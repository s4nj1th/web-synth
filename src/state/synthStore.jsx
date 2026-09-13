import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AudioEngine } from '../audio/engine/AudioEngine'
import { Sequencer } from '../audio/modules/Sequencer'
import { PRESETS } from '../audio/presets/presets'
import { DEFAULT_STATE, cloneDefaults } from './synthDefaults'

const SynthContext = createContext(null)

const MEMORY_KEY = 'web-synth.patches'

function loadMemoryFromStorage() {
  try {
    const raw = window.localStorage.getItem(MEMORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveMemoryToStorage(memory) {
  try {
    window.localStorage.setItem(MEMORY_KEY, JSON.stringify(memory))
  } catch {
    // localStorage unavailable (private mode, quota, etc) — fail silently
  }
}

export function SynthProvider({ children }) {
  const engineRef = useRef(null)
  if (!engineRef.current) engineRef.current = new AudioEngine()
  const engine = engineRef.current

  const [state, setState] = useState(() => ({
    ...cloneDefaults(),
    preset: { current: 0, memory: loadMemoryFromStorage() },
  }))
  const [activeNotes, setActiveNotes] = useState(() => new Set())

  const stepsRef = useRef(state.sequencer.steps)
  useEffect(() => {
    stepsRef.current = state.sequencer.steps
  }, [state.sequencer.steps])

  const sequencerRef = useRef(null)
  if (!sequencerRef.current) {
    sequencerRef.current = new Sequencer(engine, {
      getSteps: () => stepsRef.current,
      onStepChange: (index) => {
        setState((prev) => ({ ...prev, sequencer: { ...prev.sequencer, currentStep: index } }))
      },
    })
  }
  const sequencer = sequencerRef.current

  useEffect(() => {
    sequencer.setTempo(state.tempo)
  }, [state.tempo, sequencer])

  // Optional Web MIDI input. Entirely additive — if unsupported or denied,
  // the synth remains fully playable from the computer keyboard.
  useEffect(() => {
    if (!navigator.requestMIDIAccess) return
    let access
    navigator.requestMIDIAccess().then((midi) => {
      access = midi
      for (const input of access.inputs.values()) {
        input.onmidimessage = (e) => {
          const [status, note, velocity] = e.data
          const command = status & 0xf0
          if (command === 0x90 && velocity > 0) {
            engine.noteOn(note, 'midi')
            setActiveNotes((prev) => new Set(prev).add(note))
          } else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
            engine.noteOff(note, 'midi')
            setActiveNotes((prev) => {
              const next = new Set(prev)
              next.delete(note)
              return next
            })
          }
        }
      }
    }).catch(() => {
      // MIDI permission denied or unavailable — ignore, keyboard still works
    })
    return () => {
      if (access) {
        for (const input of access.inputs.values()) input.onmidimessage = null
      }
    }
  }, [engine])

  const togglePower = useCallback(() => {
    setState((prev) => {
      const next = !prev.power
      engine.ensureContext()
      engine.setPower(next)
      if (!next) {
        setActiveNotes(new Set())
        sequencer.stop()
      }
      return { ...prev, power: next, sequencer: { ...prev.sequencer, playing: next ? prev.sequencer.playing : false } }
    })
  }, [engine, sequencer])

  const setGroupParam = useCallback(
    (group, key, value) => {
      setState((prev) => ({ ...prev, [group]: { ...prev[group], [key]: value } }))
      engine.setParameter(`${group}.${key}`, value)
    },
    [engine],
  )

  const setMasterVolume = useCallback(
    (value) => {
      setState((prev) => ({ ...prev, masterVolume: value }))
      engine.setMasterVolume(value)
    },
    [engine],
  )

  const setTempo = useCallback((bpm) => {
    setState((prev) => ({ ...prev, tempo: bpm }))
  }, [])

  const noteOn = useCallback(
    (note) => {
      if (!engineRef.current.powered) return
      engine.noteOn(note, 'kbd')
      setActiveNotes((prev) => {
        if (prev.has(note)) return prev
        return new Set(prev).add(note)
      })
      // Live note-assign: whatever is currently selected on the sequencer
      // grid takes on the last note played, per the "hardware" workflow.
      setState((prev) => {
        const idx = prev.sequencer.selectedStep
        const steps = prev.sequencer.steps.map((s, i) => (i === idx ? { ...s, note } : s))
        return { ...prev, sequencer: { ...prev.sequencer, steps } }
      })
    },
    [engine],
  )

  const noteOff = useCallback(
    (note) => {
      engine.noteOff(note, 'kbd')
      setActiveNotes((prev) => {
        if (!prev.has(note)) return prev
        const next = new Set(prev)
        next.delete(note)
        return next
      })
    },
    [engine],
  )

  const selectPreset = useCallback(
    (index) => {
      const preset = PRESETS[index]
      if (!preset) return
      setState((prev) => ({
        ...prev,
        vco: { ...prev.vco, ...preset.vco },
        vcf: { ...prev.vcf, ...preset.vcf },
        lfo: { ...prev.lfo, ...preset.lfo },
        envelope: { ...prev.envelope, ...preset.envelope },
        preset: { ...prev.preset, current: index },
      }))
      engine.loadPatch({
        vco: { ...DEFAULT_STATE.vco, ...preset.vco },
        vcf: { ...DEFAULT_STATE.vcf, ...preset.vcf },
        lfo: { ...DEFAULT_STATE.lfo, ...preset.lfo },
        envelope: { ...DEFAULT_STATE.envelope, ...preset.envelope },
        masterVolume: engine.params.masterVolume,
      })
    },
    [engine],
  )

  // --- Sequencer controls ------------------------------------------------

  const playSequencer = useCallback(() => {
    if (!state.power) return
    engine.ensureContext()
    sequencer.start()
    setState((prev) => ({ ...prev, sequencer: { ...prev.sequencer, playing: true } }))
  }, [engine, sequencer, state.power])

  const stopSequencer = useCallback(() => {
    sequencer.stop()
    setState((prev) => ({ ...prev, sequencer: { ...prev.sequencer, playing: false, currentStep: -1 } }))
  }, [sequencer])

  const clearSequencer = useCallback(() => {
    setState((prev) => ({
      ...prev,
      sequencer: { ...prev.sequencer, steps: prev.sequencer.steps.map((s) => ({ ...s, active: false })) },
    }))
  }, [])

  const toggleStep = useCallback((index) => {
    setState((prev) => ({
      ...prev,
      sequencer: {
        ...prev.sequencer,
        selectedStep: index,
        steps: prev.sequencer.steps.map((s, i) => (i === index ? { ...s, active: !s.active } : s)),
      },
    }))
  }, [])

  const advanceSelectedStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      sequencer: { ...prev.sequencer, selectedStep: (prev.sequencer.selectedStep + 1) % prev.sequencer.steps.length },
    }))
  }, [])

  // --- Memory / patches ----------------------------------------------------

  const currentPatch = useCallback(
    (name) => ({
      name,
      vco: state.vco,
      lfo: state.lfo,
      vcf: state.vcf,
      envelope: state.envelope,
      sequencer: { steps: state.sequencer.steps },
      tempo: state.tempo,
    }),
    [state],
  )

  const writePatch = useCallback(() => {
    const name = window.prompt('Name this patch:', `PATCH ${state.preset.memory.length + 1}`)
    if (!name) return
    const patch = currentPatch(name)
    setState((prev) => {
      const memory = [...prev.preset.memory.filter((p) => p.name !== name), patch]
      saveMemoryToStorage(memory)
      return { ...prev, preset: { ...prev.preset, memory, current: name } }
    })
  }, [currentPatch, state.preset.memory.length])

  const recallPatch = useCallback(
    (name) => {
      const patch = state.preset.memory.find((p) => p.name === name)
      if (!patch) return
      setState((prev) => ({
        ...prev,
        vco: { ...prev.vco, ...patch.vco },
        lfo: { ...prev.lfo, ...patch.lfo },
        vcf: { ...prev.vcf, ...patch.vcf },
        envelope: { ...prev.envelope, ...patch.envelope },
        tempo: patch.tempo ?? prev.tempo,
        sequencer: { ...prev.sequencer, steps: patch.sequencer?.steps ?? prev.sequencer.steps },
        preset: { ...prev.preset, current: name },
      }))
      engine.loadPatch({
        vco: { ...DEFAULT_STATE.vco, ...patch.vco },
        vcf: { ...DEFAULT_STATE.vcf, ...patch.vcf },
        lfo: { ...DEFAULT_STATE.lfo, ...patch.lfo },
        envelope: { ...DEFAULT_STATE.envelope, ...patch.envelope },
        masterVolume: engine.params.masterVolume,
      })
    },
    [engine, state.preset.memory],
  )

  const recallNextPatch = useCallback(() => {
    const memory = state.preset.memory
    if (memory.length === 0) return
    const currentIdx = memory.findIndex((p) => p.name === state.preset.current)
    const next = memory[(currentIdx + 1) % memory.length]
    recallPatch(next.name)
  }, [recallPatch, state.preset.current, state.preset.memory])

  const erasePatch = useCallback(() => {
    setState((prev) => {
      const memory = prev.preset.memory.filter((p) => p.name !== prev.preset.current)
      saveMemoryToStorage(memory)
      return { ...prev, preset: { ...prev.preset, memory, current: 0 } }
    })
  }, [])

  const value = useMemo(
    () => ({
      state,
      activeNotes,
      togglePower,
      setVco: (key, value_) => setGroupParam('vco', key, value_),
      setLfo: (key, value_) => setGroupParam('lfo', key, value_),
      setVcf: (key, value_) => setGroupParam('vcf', key, value_),
      setEnvelope: (key, value_) => setGroupParam('envelope', key, value_),
      setMasterVolume,
      setTempo,
      noteOn,
      noteOff,
      selectPreset,
      playSequencer,
      stopSequencer,
      clearSequencer,
      toggleStep,
      advanceSelectedStep,
      writePatch,
      recallNextPatch,
      erasePatch,
    }),
    [
      state,
      activeNotes,
      togglePower,
      setGroupParam,
      setMasterVolume,
      setTempo,
      noteOn,
      noteOff,
      selectPreset,
      playSequencer,
      stopSequencer,
      clearSequencer,
      toggleStep,
      advanceSelectedStep,
      writePatch,
      recallNextPatch,
      erasePatch,
    ],
  )

  return <SynthContext.Provider value={value}>{children}</SynthContext.Provider>
}

export function useSynth() {
  const ctx = useContext(SynthContext)
  if (!ctx) throw new Error('useSynth must be used within a SynthProvider')
  return ctx
}
