import { PRESETS } from './presets'

const MIN_CUTOFF = 200
const MAX_CUTOFF = 8000

// Simple polyphonic Web Audio synth engine.
// Signal chain per voice: oscillator(s) -> envelope gain -> low-pass filter -> master gain -> dry gain -> destination.
// The AudioContext is created lazily on the first user gesture (footswitch or key press)
// to respect browser autoplay restrictions.
export class SynthEngine {
  constructor() {
    this.ctx = null
    this.masterGain = null
    this.dryGain = null
    this.activeVoices = new Map() // midiNote -> { oscillators, envGain, filter }
    this.presetIndex = 0
    this.powered = false
    this.params = {
      vol: 0.7,
      dry: 0.7,
      synth: 0.7,
      cutoff: 0.65, // 0..1, mapped logarithmically to Hz
    }
  }

  ensureContext() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext
      this.ctx = new Ctx()
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.value = this.params.vol
      this.dryGain = this.ctx.createGain()
      this.dryGain.gain.value = 0.2 + this.params.dry * 0.8
      this.masterGain.connect(this.dryGain)
      this.dryGain.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  setPreset(index) {
    this.presetIndex = index
  }

  getPreset() {
    return PRESETS[this.presetIndex]
  }

  cutoffHz(ctrl2Value = this.params.cutoff) {
    const preset = this.getPreset()
    const base = MIN_CUTOFF * Math.pow(MAX_CUTOFF / MIN_CUTOFF, ctrl2Value)
    return Math.max(60, base * preset.cutoffScale)
  }

  setParam(name, value) {
    this.params[name] = value
    if (!this.ctx) return
    const now = this.ctx.currentTime

    if (name === 'vol') {
      this.masterGain.gain.setTargetAtTime(value, now, 0.01)
    } else if (name === 'dry') {
      this.dryGain.gain.setTargetAtTime(0.2 + value * 0.8, now, 0.01)
    } else if (name === 'cutoff') {
      const hz = this.cutoffHz(value)
      this.activeVoices.forEach((voice) => {
        voice.filter.frequency.setTargetAtTime(hz, now, 0.02)
      })
    }
    // 'synth' affects the level of newly triggered notes; no retroactive change needed.
  }

  setPower(on) {
    this.powered = on
    if (!on) {
      this.releaseAll()
    }
  }

  noteOn(midiNote) {
    if (!this.powered) return
    this.ensureContext()
    if (this.activeVoices.has(midiNote)) return

    const preset = this.getPreset()
    const ctx = this.ctx
    const now = ctx.currentTime
    const freq = 440 * Math.pow(2, (midiNote - 69) / 12) * Math.pow(2, preset.octaveShift)
    const synthLevel = 0.3 + this.params.synth * 0.7

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = this.cutoffHz(this.params.cutoff)
    filter.Q.value = 0.7

    const envGain = ctx.createGain()
    envGain.gain.value = 0

    const oscillators = []

    const osc1 = ctx.createOscillator()
    osc1.type = preset.waveform
    osc1.frequency.value = freq
    const osc1Gain = ctx.createGain()
    osc1Gain.gain.value = preset.oscCount > 1 ? synthLevel * (1 - preset.osc2Ratio * 0.3) : synthLevel
    osc1.connect(osc1Gain)
    osc1Gain.connect(envGain)
    osc1.start(now)
    oscillators.push({ osc: osc1, gain: osc1Gain })

    if (preset.oscCount > 1) {
      const osc2 = ctx.createOscillator()
      osc2.type = preset.waveform
      osc2.frequency.value = freq
      osc2.detune.value = preset.detune
      const osc2Gain = ctx.createGain()
      osc2Gain.gain.value = synthLevel * preset.osc2Ratio
      osc2.connect(osc2Gain)
      osc2Gain.connect(envGain)
      osc2.start(now)
      oscillators.push({ osc: osc2, gain: osc2Gain })
    }

    envGain.connect(filter)
    filter.connect(this.masterGain)

    envGain.gain.setValueAtTime(0, now)
    envGain.gain.linearRampToValueAtTime(1, now + preset.attack)
    envGain.gain.linearRampToValueAtTime(preset.sustain, now + preset.attack + preset.decay)

    this.activeVoices.set(midiNote, { oscillators, envGain, filter })
  }

  noteOff(midiNote) {
    const voice = this.activeVoices.get(midiNote)
    if (!voice || !this.ctx) return
    const preset = this.getPreset()
    const ctx = this.ctx
    const now = ctx.currentTime

    voice.envGain.gain.cancelScheduledValues(now)
    voice.envGain.gain.setValueAtTime(voice.envGain.gain.value, now)
    voice.envGain.gain.linearRampToValueAtTime(0.0001, now + preset.release)

    voice.oscillators.forEach(({ osc }) => {
      osc.stop(now + preset.release + 0.02)
    })

    const cleanupDelay = (preset.release + 0.05) * 1000
    setTimeout(() => {
      voice.oscillators.forEach(({ osc, gain }) => {
        osc.disconnect()
        gain.disconnect()
      })
      voice.envGain.disconnect()
      voice.filter.disconnect()
    }, cleanupDelay)

    this.activeVoices.delete(midiNote)
  }

  releaseAll() {
    Array.from(this.activeVoices.keys()).forEach((note) => this.noteOff(note))
  }
}
