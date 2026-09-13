// Starting patches. Each one configures VCO/VCF/LFO/ENV together, but every
// parameter remains fully editable afterwards — these are just presets,
// not separate synth engines.

export const PRESETS = [
  {
    code: '01',
    name: 'SINE',
    vco: { waveform: 'sine', dualSaw: false, pwmMod: 0, detune: 0.5, pitchMod: 0 },
    vcf: { cutoff: 0.75, resonance: 0.1, lfoMod: 0, envMod: 0.15 },
    lfo: { waveform: 'sine', rate: 0.25, delay: 0 },
    envelope: { attack: 0.04, decay: 0.2, sustain: 0.8, release: 0.3 },
  },
  {
    code: '02',
    name: 'TRIANGLE',
    vco: { waveform: 'triangle', dualSaw: false, pwmMod: 0, detune: 0.5, pitchMod: 0.1 },
    vcf: { cutoff: 0.55, resonance: 0.15, lfoMod: 0.05, envMod: 0.2 },
    lfo: { waveform: 'sine', rate: 0.2, delay: 0.15 },
    envelope: { attack: 0.06, decay: 0.25, sustain: 0.72, release: 0.35 },
  },
  {
    code: '03',
    name: 'SAW',
    vco: { waveform: 'sawtooth', dualSaw: false, pwmMod: 0, detune: 0.5, pitchMod: 0 },
    vcf: { cutoff: 0.65, resonance: 0.2, lfoMod: 0, envMod: 0.4 },
    lfo: { waveform: 'sine', rate: 0.3, delay: 0 },
    envelope: { attack: 0.01, decay: 0.15, sustain: 0.65, release: 0.25 },
  },
  {
    code: '04',
    name: 'SQUARE',
    vco: { waveform: 'square', dualSaw: false, pwmMod: 0.4, detune: 0.5, pitchMod: 0 },
    vcf: { cutoff: 0.5, resonance: 0.25, lfoMod: 0, envMod: 0.35 },
    lfo: { waveform: 'sine', rate: 0.3, delay: 0 },
    envelope: { attack: 0.01, decay: 0.12, sustain: 0.6, release: 0.25 },
  },
  {
    code: '05',
    name: 'DUAL SAW',
    vco: { waveform: 'sawtooth', dualSaw: true, dualDetuneCents: 16, dualLevel: 0.65, pwmMod: 0, detune: 0.5, pitchMod: 0.05 },
    vcf: { cutoff: 0.6, resonance: 0.2, lfoMod: 0.1, envMod: 0.35 },
    lfo: { waveform: 'sine', rate: 0.25, delay: 0 },
    envelope: { attack: 0.015, decay: 0.18, sustain: 0.68, release: 0.3 },
  },
  {
    code: '06',
    name: 'BASS',
    vco: { waveform: 'sawtooth', dualSaw: false, pwmMod: 0, detune: 0.5, pitchMod: 0 },
    vcf: { cutoff: 0.28, resonance: 0.3, lfoMod: 0, envMod: 0.55 },
    lfo: { waveform: 'sine', rate: 0.2, delay: 0 },
    envelope: { attack: 0.008, decay: 0.12, sustain: 0.8, release: 0.2 },
  },
]
