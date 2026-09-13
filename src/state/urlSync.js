// Turns the customisable parts of synth state into a compact query string,
// and back again. Every knob/slider value, waveform choice, tempo, volume
// and the sequencer grid round-trips through the URL so a pasted link
// reproduces the same patch for anyone who opens it.

import { DEFAULT_STATE } from './synthDefaults'

const NUM_PRECISION = 3

function n(value) {
  return Number(value.toFixed(NUM_PRECISION))
}

const FIELD_MAP = [
  ['vco.waveform', (s) => s.vco.waveform, (v) => v, 'string'],
  ['vco.pitchMod', (s) => n(s.vco.pitchMod), (v) => v, 'float'],
  ['vco.detune', (s) => n(s.vco.detune), (v) => v, 'float'],
  ['vco.pwmMod', (s) => n(s.vco.pwmMod), (v) => v, 'float'],
  ['vco.dualSaw', (s) => (s.vco.dualSaw ? 1 : 0), (v) => v, 'bool'],
  ['vco.dualDetuneCents', (s) => n(s.vco.dualDetuneCents), (v) => v, 'float'],
  ['vco.dualLevel', (s) => n(s.vco.dualLevel), (v) => v, 'float'],

  ['lfo.waveform', (s) => s.lfo.waveform, (v) => v, 'string'],
  ['lfo.rate', (s) => n(s.lfo.rate), (v) => v, 'float'],
  ['lfo.delay', (s) => n(s.lfo.delay), (v) => v, 'float'],

  ['vcf.cutoff', (s) => n(s.vcf.cutoff), (v) => v, 'float'],
  ['vcf.resonance', (s) => n(s.vcf.resonance), (v) => v, 'float'],
  ['vcf.lfoMod', (s) => n(s.vcf.lfoMod), (v) => v, 'float'],
  ['vcf.envMod', (s) => n(s.vcf.envMod), (v) => v, 'float'],

  ['env.attack', (s) => n(s.envelope.attack), (v) => v, 'float'],
  ['env.decay', (s) => n(s.envelope.decay), (v) => v, 'float'],
  ['env.sustain', (s) => n(s.envelope.sustain), (v) => v, 'float'],
  ['env.release', (s) => n(s.envelope.release), (v) => v, 'float'],

  ['vol', (s) => n(s.masterVolume), (v) => v, 'float'],
  ['tempo', (s) => Math.round(s.tempo), (v) => v, 'int'],
]

function encodeSteps(steps) {
  return steps.map((s) => `${s.note}:${s.active ? 1 : 0}`).join(',')
}

function decodeSteps(raw) {
  if (!raw) return null
  try {
    return raw.split(',').map((pair) => {
      const [note, active] = pair.split(':')
      return { note: parseInt(note, 10), active: active === '1' }
    })
  } catch {
    return null
  }
}

// Builds the full query string (no leading '?') for the given state.
export function encodeStateToSearch(state) {
  const params = new URLSearchParams()
  if (typeof state.preset.current === 'string') {
    params.set('name', state.preset.current)
  }
  FIELD_MAP.forEach(([key, getter]) => {
    params.set(key, String(getter(state)))
  })
  params.set('seq', encodeSteps(state.sequencer.steps))
  return params.toString()
}

// Parses a URLSearchParams (or query string) into a partial patch object
// shaped like { vco, lfo, vcf, envelope, masterVolume, tempo, sequencer, name }.
// Only fields actually present in the URL are included, so callers can
// merge this over the current/default state.
export function decodeSearchToPatch(search) {
  const params = search instanceof URLSearchParams ? search : new URLSearchParams(search)
  if ([...params.keys()].length === 0) return null

  const patch = { vco: {}, lfo: {}, vcf: {}, envelope: {} }
  let found = false

  FIELD_MAP.forEach(([key, , , type]) => {
    if (!params.has(key)) return
    found = true
    const raw = params.get(key)
    const [group, field] = key.includes('.') ? key.split('.') : [null, key]
    let value
    if (type === 'string') value = raw
    else if (type === 'bool') value = raw === '1' || raw === 'true'
    else if (type === 'int') value = parseInt(raw, 10)
    else value = parseFloat(raw)

    if (Number.isNaN(value)) return

    if (group === 'vco') patch.vco[field] = value
    else if (group === 'lfo') patch.lfo[field] = value
    else if (group === 'vcf') patch.vcf[field] = value
    else if (group === 'env') patch.envelope[field] = value
    else if (field === 'vol') patch.masterVolume = value
    else if (field === 'tempo') patch.tempo = value
  })

  const steps = decodeSteps(params.get('seq'))
  if (steps && steps.length === DEFAULT_STATE.sequencer.steps.length) {
    patch.sequencer = { steps }
    found = true
  }

  if (params.has('name')) {
    patch.name = params.get('name')
    found = true
  }

  return found ? patch : null
}

export function buildShareUrl(state) {
  const url = new URL(window.location.href)
  url.search = encodeStateToSearch(state)
  return url.toString()
}
