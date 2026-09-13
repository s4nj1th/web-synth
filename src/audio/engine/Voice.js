import { midiToFrequency } from '../utils/audioMath'
import { createVoiceOscillators, startOscillators, stopOscillators, disconnectOscillators } from '../modules/Oscillator'
import { createVoiceFilter, cutoffFromValue, resonanceFromValue } from '../modules/Filter'
import { triggerAttack, triggerRelease } from '../modules/Envelope'
import { PITCH_MOD_MAX_CENTS, FILTER_MOD_MAX_HZ, delayFromValue } from '../modules/LFO'

const ENV_FILTER_MOD_MAX_HZ = 6000

// A Voice owns every audio node needed to sound a single note:
// oscillator(s) -> filter -> VCA(envelope) -> engine output.
// Modulation sources (the engine's shared LFO, and this voice's own
// envelope) are connected in here so the rest of the app never touches
// raw AudioNodes.
export class Voice {
  constructor(ctx, engine, note, params) {
    this.ctx = ctx
    this.engine = engine
    this.note = note
    this.releasing = false

    const frequency = midiToFrequency(note)
    const now = ctx.currentTime

    const { oscillators, output: oscOutput } = createVoiceOscillators(
      ctx,
      {
        waveform: params.vco.waveform,
        detuneCents: (params.vco.detune - 0.5) * 100,
        pwmMix: params.vco.pwmMod,
        dualSaw: !!params.vco.dualSaw,
        dualDetuneCents: params.vco.dualDetuneCents ?? 14,
        dualLevel: params.vco.dualLevel ?? 0.6,
      },
      frequency,
    )
    this.oscillators = oscillators

    this.filter = createVoiceFilter(ctx, params.vcf)

    // VCA stage
    this.ampGain = ctx.createGain()
    this.ampGain.gain.value = 0

    oscOutput.connect(this.filter)
    this.filter.connect(this.ampGain)
    this.ampGain.connect(engine.getVoiceInput())

    // Envelope -> filter modulation. A constant-source provides a steady
    // 1.0 signal; shaping its gain with the same ADSR curve as the VCA
    // produces an audio-rate modulation signal we can feed into the
    // filter's frequency AudioParam.
    this.envModConst = ctx.createConstantSource()
    this.envModConst.offset.value = 1
    this.envModShape = ctx.createGain()
    this.envModShape.gain.value = 0
    this.envModDepth = ctx.createGain()
    this.envModDepth.gain.value = params.vcf.envMod * ENV_FILTER_MOD_MAX_HZ
    this.envModConst.connect(this.envModShape)
    this.envModShape.connect(this.envModDepth)
    this.envModDepth.connect(this.filter.frequency)
    this.envModConst.start(now)

    // LFO -> pitch depth (per oscillator) and LFO -> filter depth.
    // Both ramp in from 0 over the LFO delay time, then hold at the
    // configured depth for as long as the note plays.
    this.lfoPitchDepth = ctx.createGain()
    this.lfoFilterDepth = ctx.createGain()
    const pitchTarget = params.vco.pitchMod * PITCH_MOD_MAX_CENTS
    const filterTarget = params.vcf.lfoMod * FILTER_MOD_MAX_HZ
    const delaySeconds = delayFromValue(params.lfo.delay)
    this.lfoPitchDepth.gain.setValueAtTime(0, now)
    this.lfoPitchDepth.gain.linearRampToValueAtTime(pitchTarget, now + Math.max(0.001, delaySeconds))
    this.lfoFilterDepth.gain.setValueAtTime(0, now)
    this.lfoFilterDepth.gain.linearRampToValueAtTime(filterTarget, now + Math.max(0.001, delaySeconds))

    this.lfoOsc = engine.getLfoNode()
    if (this.lfoOsc) {
      this.lfoOsc.connect(this.lfoPitchDepth)
      this.lfoOsc.connect(this.lfoFilterDepth)
    }
    this.oscillators.forEach(({ osc }) => this.lfoPitchDepth.connect(osc.detune))
    this.lfoFilterDepth.connect(this.filter.frequency)

    startOscillators(this.oscillators, now)

    triggerAttack(this.ampGain.gain, params.envelope, now, 1)
    triggerAttack(this.envModShape.gain, params.envelope, now, 1)
  }

  // Called when engine-level parameters change while this voice is active,
  // so held notes track live knob movement instead of only affecting new notes.
  updateCutoffResonance(vcf) {
    const now = this.ctx.currentTime
    this.filter.frequency.setTargetAtTime(cutoffFromValue(vcf.cutoff), now, 0.02)
    this.filter.Q.setTargetAtTime(resonanceFromValue(vcf.resonance), now, 0.02)
  }

  updateFilterModDepths(vcf) {
    if (!this.ctx) return
    const now = this.ctx.currentTime
    this.envModDepth.gain.setTargetAtTime(vcf.envMod * ENV_FILTER_MOD_MAX_HZ, now, 0.02)
    this.lfoFilterDepth.gain.setTargetAtTime(vcf.lfoMod * FILTER_MOD_MAX_HZ, now, 0.02)
  }

  updatePitchModDepth(vco) {
    const now = this.ctx.currentTime
    this.lfoPitchDepth.gain.setTargetAtTime(vco.pitchMod * PITCH_MOD_MAX_CENTS, now, 0.02)
  }

  release(envelope) {
    if (this.releasing) return
    this.releasing = true
    const now = this.ctx.currentTime
    triggerRelease(this.ampGain.gain, envelope, now)
    triggerRelease(this.envModShape.gain, envelope, now)
    const stopTime = now + Math.max(0.02, envelope.release) + 0.02
    stopOscillators(this.oscillators, stopTime)
    try {
      this.envModConst.stop(stopTime)
    } catch {
      // ignore
    }
    const cleanupMs = (stopTime - now + 0.05) * 1000
    setTimeout(() => this.dispose(), cleanupMs)
  }

  // Immediate stop used for voice stealing, no release tail.
  forceStop() {
    const now = this.ctx.currentTime
    try {
      this.ampGain.gain.cancelScheduledValues(now)
      this.ampGain.gain.setTargetAtTime(0, now, 0.01)
      stopOscillators(this.oscillators, now + 0.03)
      this.envModConst.stop(now + 0.03)
    } catch {
      // ignore
    }
    setTimeout(() => this.dispose(), 60)
  }

  dispose() {
    // Sever this voice's edges from the long-lived shared LFO first —
    // otherwise the LFO oscillator keeps a dangling connection to these
    // gain nodes forever, since it never stops on its own. Isolated in its
    // own try/catch so a failure here can't skip the rest of cleanup.
    try {
      if (this.lfoOsc) {
        this.lfoOsc.disconnect(this.lfoPitchDepth)
        this.lfoOsc.disconnect(this.lfoFilterDepth)
      }
    } catch {
      // already disconnected
    }
    try {
      disconnectOscillators(this.oscillators)
      this.filter.disconnect()
      this.ampGain.disconnect()
      this.envModConst.disconnect()
      this.envModShape.disconnect()
      this.envModDepth.disconnect()
      this.lfoPitchDepth.disconnect()
      this.lfoFilterDepth.disconnect()
    } catch {
      // nodes may already be disconnected
    }
  }
}
