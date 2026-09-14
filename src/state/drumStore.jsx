import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { DrumEngine } from '../audio/engine/DrumEngine'
import { DrumSequencer } from '../audio/modules/DrumSequencer'
import { DRUM_PRESETS } from '../audio/presets/drumPresets'
import { cloneDrumDefaults, DRUM_ROW_DEFS } from './drumDefaults'
import { decodeSearchToDrumPatch, encodeDrumStateToSearch, buildDrumShareUrl } from './drumUrlSync'

const DrumContext = createContext(null)

function applyDrumPatchToState(base, patch) {
  if (!patch) return base
  return {
    ...base,
    bpm: patch.bpm ?? base.bpm,
    masterVolume: patch.masterVolume ?? base.masterVolume,
    preset: patch.name ?? base.preset,
    rows: base.rows.map((row) => (patch.rows[row.id] ? { ...row, steps: patch.rows[row.id] } : row)),
  }
}

export function DrumProvider({ children }) {
  const engineRef = useRef(null)
  if (!engineRef.current) engineRef.current = new DrumEngine()
  const engine = engineRef.current

  const [state, setState] = useState(() => {
    const base = cloneDrumDefaults()
    const urlPatch = decodeSearchToDrumPatch(window.location.search)
    const initial = applyDrumPatchToState(base, urlPatch)
    engineRef.current.setMasterVolume(initial.masterVolume)
    return initial
  })

  const rowsRef = useRef(state.rows)
  useEffect(() => {
    rowsRef.current = state.rows
  }, [state.rows])

  const sequencerRef = useRef(null)
  if (!sequencerRef.current) {
    sequencerRef.current = new DrumSequencer(engine, {
      getRows: () => rowsRef.current,
      onStepChange: (step) => {
        setState((prev) => ({ ...prev, currentStep: step }))
      },
    })
  }
  const sequencer = sequencerRef.current

  useEffect(() => {
    sequencer.setTempo(state.bpm)
  }, [state.bpm, sequencer])

  // Tear down the AudioContext when the drum page is left, since each page
  // owns its own context rather than sharing one across the whole site.
  useEffect(() => () => engine.dispose(), [engine])

  // Keep the address bar in sync with the current pattern so it's always a
  // valid, shareable link. Excludes currentStep/playing so this doesn't
  // fire on every sixteenth-note tick during playback.
  useEffect(() => {
    const search = encodeDrumStateToSearch(state)
    const url = `${window.location.pathname}?${search}`
    window.history.replaceState(null, '', url)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.bpm, state.masterVolume, state.rows, state.preset])

  const setMasterVolume = useCallback(
    (value) => {
      setState((prev) => ({ ...prev, masterVolume: value }))
      engine.setMasterVolume(value)
    },
    [engine],
  )

  const togglePlay = useCallback(() => {
    setState((prev) => {
      const next = !prev.playing
      if (next) {
        sequencer.start()
      } else {
        sequencer.stop()
      }
      return { ...prev, playing: next, currentStep: next ? prev.currentStep : -1 }
    })
  }, [sequencer])

  const setBpm = useCallback((bpm) => {
    setState((prev) => ({ ...prev, bpm }))
  }, [])

  const toggleStep = useCallback((rowId, stepIndex) => {
    setState((prev) => ({
      ...prev,
      rows: prev.rows.map((row) =>
        row.id === rowId ? { ...row, steps: row.steps.map((v, i) => (i === stepIndex ? !v : v)) } : row,
      ),
    }))
  }, [])

  const clearAll = useCallback(() => {
    setState((prev) => ({
      ...prev,
      rows: prev.rows.map((row) => ({ ...row, steps: Array(16).fill(false) })),
    }))
  }, [])

  const selectPreset = useCallback((index) => {
    const preset = DRUM_PRESETS[index]
    if (!preset) return
    setState((prev) => ({
      ...prev,
      preset: index,
      bpm: preset.bpm,
      rows: DRUM_ROW_DEFS.map((def) => ({ id: def.id, steps: [...preset.rows[def.id]] })),
    }))
  }, [])

  const previewRow = useCallback(
    (rowId) => {
      engine.preview(rowId)
    },
    [engine],
  )

  const copyShareLink = useCallback(async () => {
    const url = buildDrumShareUrl(state)
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Clipboard API unavailable — the URL is already live in the address bar either way.
    }
    return url
  }, [state])

  const value = useMemo(
    () => ({
      state,
      togglePlay,
      setBpm,
      setMasterVolume,
      toggleStep,
      clearAll,
      selectPreset,
      previewRow,
      copyShareLink,
    }),
    [state, togglePlay, setBpm, setMasterVolume, toggleStep, clearAll, selectPreset, previewRow, copyShareLink],
  )

  return <DrumContext.Provider value={value}>{children}</DrumContext.Provider>
}

export function useDrum() {
  const ctx = useContext(DrumContext)
  if (!ctx) throw new Error('useDrum must be used within a DrumProvider')
  return ctx
}
