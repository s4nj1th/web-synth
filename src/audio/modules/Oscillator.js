// Builds the oscillator stage for a single voice. Returns the oscillator
// node(s), a mix gain to feed the rest of the voice chain, and a cleanup fn.
// Keeping this separate from Voice.js means new waveform/oscillator schemes
// can be dropped in without touching voice lifecycle or modulation wiring.

export const WAVEFORMS = ['sine', 'triangle', 'sawtooth', 'square']

// A small amount of unison detune used to approximate the "width" a real
// pulse-width-modulated square wave gets, since Web Audio has no native
// pulse oscillator. Only applied to the square waveform, per spec.
const PWM_UNISON_CENTS = 9

export function createVoiceOscillators(ctx, { waveform, detuneCents, pwmMix, dualSaw, dualDetuneCents, dualLevel }, frequency) {
  const mixGain = ctx.createGain()
  mixGain.gain.value = 1
  const oscillators = []

  const osc1 = ctx.createOscillator()
  osc1.type = waveform
  osc1.frequency.value = frequency
  osc1.detune.value = detuneCents
  const osc1Gain = ctx.createGain()
  osc1Gain.gain.value = dualSaw ? 1 - dualLevel * 0.3 : 1
  osc1.connect(osc1Gain)
  osc1Gain.connect(mixGain)
  oscillators.push({ osc: osc1, gain: osc1Gain, detuneBase: detuneCents })

  if (dualSaw) {
    const osc2 = ctx.createOscillator()
    osc2.type = waveform
    osc2.frequency.value = frequency
    osc2.detune.value = detuneCents + dualDetuneCents
    const osc2Gain = ctx.createGain()
    osc2Gain.gain.value = dualLevel
    osc2.connect(osc2Gain)
    osc2Gain.connect(mixGain)
    oscillators.push({ osc: osc2, gain: osc2Gain, detuneBase: detuneCents + dualDetuneCents })
  } else if (waveform === 'square' && pwmMix > 0) {
    const oscPwm = ctx.createOscillator()
    oscPwm.type = 'square'
    oscPwm.frequency.value = frequency
    oscPwm.detune.value = detuneCents + PWM_UNISON_CENTS
    const oscPwmGain = ctx.createGain()
    oscPwmGain.gain.value = pwmMix * 0.5
    oscPwm.connect(oscPwmGain)
    oscPwmGain.connect(mixGain)
    oscillators.push({ osc: oscPwm, gain: oscPwmGain, detuneBase: detuneCents + PWM_UNISON_CENTS })
  }

  return { oscillators, output: mixGain }
}

export function startOscillators(oscillators, time) {
  oscillators.forEach(({ osc }) => osc.start(time))
}

export function stopOscillators(oscillators, time) {
  oscillators.forEach(({ osc }) => {
    try {
      osc.stop(time)
    } catch {
      // already stopped, ignore
    }
  })
}

export function disconnectOscillators(oscillators) {
  oscillators.forEach(({ osc, gain }) => {
    osc.disconnect()
    gain.disconnect()
  })
}
