// Rhythm presets for the drum machine's 16-step grid. Each pattern is
// defined as "which steps are active" per row, using the same row ids as
// DRUM_ROW_DEFS in drumDefaults.js. Rows omitted from a pattern default to
// silent (no active steps).

function pattern(active) {
  const steps = Array(16).fill(false)
  active.forEach((i) => {
    steps[i] = true
  })
  return steps
}

function buildPattern(rowSteps) {
  return {
    hihatFoot: pattern(rowSteps.hihatFoot || []),
    tomTom: pattern(rowSteps.tomTom || []),
    floorTom: pattern(rowSteps.floorTom || []),
    ride: pattern(rowSteps.ride || []),
    hihat: pattern(rowSteps.hihat || []),
    snare: pattern(rowSteps.snare || []),
    kick: pattern(rowSteps.kick || []),
  }
}

export const DRUM_PRESETS = [
  {
    name: 'ROCK',
    bpm: 112,
    rows: buildPattern({
      kick: [0, 8],
      snare: [4, 12],
      hihat: [0, 2, 4, 6, 8, 10, 12, 14],
    }),
  },
  {
    name: 'FOUR ON FLOOR',
    bpm: 124,
    rows: buildPattern({
      kick: [0, 4, 8, 12],
      snare: [4, 12],
      hihatFoot: [2, 6, 10, 14],
      hihat: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    }),
  },
  {
    name: 'HIP-HOP',
    bpm: 92,
    rows: buildPattern({
      kick: [0, 10],
      snare: [4, 12],
      hihat: [0, 2, 4, 6, 8, 10, 12, 14],
      hihatFoot: [3, 7, 11, 15],
    }),
  },
  {
    name: 'BREAKBEAT',
    bpm: 132,
    rows: buildPattern({
      kick: [0, 6, 10],
      snare: [4, 12, 14],
      hihat: [0, 2, 4, 6, 8, 10, 12, 14],
    }),
  },
  {
    name: 'MINIMAL TECHNO',
    bpm: 128,
    rows: buildPattern({
      kick: [0, 4, 8, 12],
      hihat: [2, 6, 10, 14],
      ride: [0, 4, 8, 12],
    }),
  },
  {
    name: 'HALF-TIME',
    bpm: 80,
    rows: buildPattern({
      kick: [0],
      snare: [8],
      hihat: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    }),
  },
  {
    name: 'LATIN',
    bpm: 104,
    rows: buildPattern({
      kick: [0, 7, 10],
      tomTom: [3, 11],
      floorTom: [6, 14],
      hihat: [0, 2, 4, 6, 8, 10, 12, 14],
    }),
  },
  {
    name: 'TOM GROOVE',
    bpm: 100,
    rows: buildPattern({
      kick: [0, 8],
      tomTom: [2, 6, 10, 14],
      floorTom: [4, 12],
      ride: [0, 4, 8, 12],
    }),
  },
]
