export const DRUM_ROW_DEFS = [
  { id: 'hihatFoot', label: 'Hi-hat (foot)' },
  { id: 'tomTom', label: 'Tom-tom' },
  { id: 'floorTom', label: 'Floor tom' },
  { id: 'ride', label: 'Ride cymbal' },
  { id: 'hihat', label: 'Hi-hat' },
  { id: 'snare', label: 'Snare drum' },
  { id: 'kick', label: 'Bass drum' },
]

const EMPTY_STEPS = () => Array(16).fill(false)

export const DEFAULT_DRUM_STATE = {
  playing: false,
  bpm: 90,
  masterVolume: 0.8,
  currentStep: -1,
  preset: 0,
  rows: DRUM_ROW_DEFS.map((def) => ({ id: def.id, steps: EMPTY_STEPS() })),
}

export function cloneDrumDefaults() {
  return JSON.parse(JSON.stringify(DEFAULT_DRUM_STATE))
}
