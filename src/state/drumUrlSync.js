// Same idea as state/urlSync.js but for the drum machine: BPM, the preset
// name (if any), and all 7 rows of 16 steps round-trip through the URL.
// Each row's 16 booleans are packed into a 4-character hex string instead
// of 16 raw characters, to keep shared links reasonably short.

import { DRUM_ROW_DEFS } from './drumDefaults'

function stepsToHex(steps) {
  let bits = 0
  steps.forEach((active, i) => {
    if (active) bits |= 1 << i
  })
  return bits.toString(16).padStart(4, '0')
}

function hexToSteps(hex) {
  const bits = parseInt(hex, 16)
  if (Number.isNaN(bits)) return null
  return Array.from({ length: 16 }, (_, i) => (bits & (1 << i)) !== 0)
}

export function encodeDrumStateToSearch(state) {
  const params = new URLSearchParams()
  params.set('bpm', String(Math.round(state.bpm)))
  if (typeof state.preset === 'string') {
    params.set('name', state.preset)
  }
  state.rows.forEach((row) => {
    params.set(`steps.${row.id}`, stepsToHex(row.steps))
  })
  return params.toString()
}

export function decodeSearchToDrumPatch(search) {
  const params = search instanceof URLSearchParams ? search : new URLSearchParams(search)
  if ([...params.keys()].length === 0) return null

  let found = false
  const patch = { rows: {} }

  if (params.has('bpm')) {
    const bpm = parseInt(params.get('bpm'), 10)
    if (!Number.isNaN(bpm)) {
      patch.bpm = bpm
      found = true
    }
  }

  if (params.has('name')) {
    patch.name = params.get('name')
    found = true
  }

  DRUM_ROW_DEFS.forEach((def) => {
    const key = `steps.${def.id}`
    if (!params.has(key)) return
    const steps = hexToSteps(params.get(key))
    if (steps) {
      patch.rows[def.id] = steps
      found = true
    }
  })

  return found ? patch : null
}

export function buildDrumShareUrl(state) {
  const url = new URL(window.location.href)
  url.search = encodeDrumStateToSearch(state)
  return url.toString()
}
