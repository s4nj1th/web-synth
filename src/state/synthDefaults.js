// The canonical shape of synth state. Kept serialisable (plain numbers and
// strings only, no AudioNodes) so it can be saved to localStorage as a patch.

export const DEFAULT_STATE = {
  power: false,
  masterVolume: 0.7,
  tempo: 120,

  vco: {
    waveform: 'sawtooth',
    pitchMod: 0,
    detune: 0.5, // 0.5 = centred / no detune
    pwmMod: 0,
    dualSaw: false,
    dualDetuneCents: 14,
    dualLevel: 0.6,
  },

  lfo: {
    waveform: 'sine',
    rate: 0.3,
    delay: 0,
  },

  vcf: {
    cutoff: 0.6,
    resonance: 0.15,
    lfoMod: 0,
    envMod: 0.3,
  },

  envelope: {
    attack: 0.05,
    decay: 0.25,
    sustain: 0.7,
    release: 0.2,
  },

  sequencer: {
    playing: false,
    steps: Array.from({ length: 8 }, (_, i) => ({
      note: 60 + [0, 3, 7, 10, 12, 7, 3, 0][i],
      active: i % 2 === 0,
    })),
    currentStep: -1,
    selectedStep: 0,
  },

  preset: {
    current: 0,
    memory: [],
  },
}

export function cloneDefaults() {
  return JSON.parse(JSON.stringify(DEFAULT_STATE))
}
