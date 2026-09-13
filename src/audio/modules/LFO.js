import { mapLog, mapLinear } from '../utils/audioMath'

export const WAVEFORMS = ['sine', 'triangle', 'sawtooth', 'square']

export const RATE_MIN_HZ = 0.1
export const RATE_MAX_HZ = 20
export const DELAY_MAX_SECONDS = 2

// Maximum swing each modulation destination can reach at full depth.
export const PITCH_MOD_MAX_CENTS = 150
export const FILTER_MOD_MAX_HZ = 4000

export function rateFromValue(value01) {
  return mapLog(value01, RATE_MIN_HZ, RATE_MAX_HZ)
}

export function delayFromValue(value01) {
  return mapLinear(value01, 0, DELAY_MAX_SECONDS)
}

// One shared LFO oscillator feeds every active voice. Each voice attaches
// its own depth-scaling gain nodes so per-voice modulation amount (and the
// per-voice delay ramp) can be controlled independently while sharing a
// single phase source, which is both cheaper and how real analogue synths
// with one LFO behave.
export function createSharedLfo(ctx, lfoParams) {
  const osc = ctx.createOscillator()
  osc.type = lfoParams.waveform
  osc.frequency.value = rateFromValue(lfoParams.rate)
  osc.start()
  return osc
}
