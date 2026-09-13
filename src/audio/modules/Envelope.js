// Pure Web Audio scheduling helpers for a simple ADSR shape.
// These operate on any AudioParam-bearing GainNode, so the same functions
// drive both the voice's amplitude (VCA) stage and the envelope->filter
// modulation stage.

// Schedules attack -> decay -> sustain starting at `startTime`, reaching
// `peak` at the top of the attack and settling at `peak * sustain`.
export function triggerAttack(gainParam, envelope, startTime, peak = 1) {
  const { attack, decay, sustain } = envelope
  gainParam.cancelScheduledValues(startTime)
  gainParam.setValueAtTime(0, startTime)
  gainParam.linearRampToValueAtTime(peak, startTime + Math.max(0.001, attack))
  gainParam.linearRampToValueAtTime(
    peak * clampSustain(sustain),
    startTime + Math.max(0.001, attack) + Math.max(0.001, decay),
  )
}

// Schedules the release phase from whatever value the param currently holds.
export function triggerRelease(gainParam, envelope, startTime) {
  const { release } = envelope
  gainParam.cancelScheduledValues(startTime)
  gainParam.setValueAtTime(gainParam.value, startTime)
  gainParam.linearRampToValueAtTime(0.0001, startTime + Math.max(0.02, release))
}

function clampSustain(s) {
  return Math.min(1, Math.max(0, s))
}

// Maps a normalised 0..1 slider value onto a musically useful time range.
// Squaring the input gives finer control at short times, which is where
// attack/decay/release differences are most audible.
export function mapEnvTime(value01, minSeconds, maxSeconds) {
  const v = Math.min(1, Math.max(0, value01))
  return minSeconds + v * v * (maxSeconds - minSeconds)
}
