// Small collection of pure math helpers used across the audio engine.
// Kept dependency-free so any module can import them without pulling in
// engine or UI code.

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

// Maps a normalised 0..1 value onto [min, max] logarithmically.
// Useful for frequency-like parameters (filter cutoff, LFO rate) where
// perceived change is proportional rather than linear.
export function mapLog(value01, min, max) {
  const v = clamp(value01, 0, 1)
  return min * Math.pow(max / min, v)
}

// Maps a normalised 0..1 value onto [min, max] linearly.
export function mapLinear(value01, min, max) {
  const v = clamp(value01, 0, 1)
  return min + v * (max - min)
}

export function midiToFrequency(note) {
  return 440 * Math.pow(2, (note - 69) / 12)
}

export function centsToRatio(cents) {
  return Math.pow(2, cents / 1200)
}
