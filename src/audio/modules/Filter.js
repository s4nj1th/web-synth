import { mapLog, mapLinear } from '../utils/audioMath'

export const CUTOFF_MIN_HZ = 100
export const CUTOFF_MAX_HZ = 12000
export const RESONANCE_MIN_Q = 0.1
export const RESONANCE_MAX_Q = 18

export function cutoffFromValue(value01) {
  return mapLog(value01, CUTOFF_MIN_HZ, CUTOFF_MAX_HZ)
}

export function resonanceFromValue(value01) {
  return mapLinear(value01, RESONANCE_MIN_Q, RESONANCE_MAX_Q)
}

export function createVoiceFilter(ctx, vcfParams) {
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = cutoffFromValue(vcfParams.cutoff)
  filter.Q.value = resonanceFromValue(vcfParams.resonance)
  return filter
}
