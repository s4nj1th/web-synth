import { useCallback, useRef, useState } from 'react'
import ControlKnob from './ControlKnob'
import SynthSelector from './SynthSelector'
import PresetList from './PresetList'
import FootSwitch from './FootSwitch'
import IndicatorLED from './IndicatorLED'
import PianoKeyboard from './PianoKeyboard'
import { SynthEngine } from '../audio/synth'

const KNOB_DEFS = [
  { key: 'dry', label: 'DRY' },
  { key: 'vol', label: 'VOL' },
  { key: 'synth', label: 'SYNTH' },
  { key: 'cutoff', label: 'CTRL 2' },
]

export default function SynthPedal() {
  const engineRef = useRef(null)
  if (!engineRef.current) engineRef.current = new SynthEngine()
  const engine = engineRef.current

  const [powered, setPowered] = useState(false)
  const [presetIndex, setPresetIndex] = useState(0)
  const [knobs, setKnobs] = useState({ dry: 0.6, vol: 0.7, synth: 0.7, cutoff: 0.65 })
  const [activeNotes, setActiveNotes] = useState(() => new Set())

  const togglePower = useCallback(() => {
    setPowered((prev) => {
      const next = !prev
      engine.ensureContext()
      engine.setPower(next)
      if (!next) setActiveNotes(new Set())
      return next
    })
  }, [engine])

  const handleKnobChange = useCallback(
    (key, value) => {
      setKnobs((prev) => ({ ...prev, [key]: value }))
      engine.setParam(key, value)
    },
    [engine],
  )

  const handlePresetChange = useCallback(
    (index) => {
      setPresetIndex(index)
      engine.setPreset(index)
    },
    [engine],
  )

  const handleNoteOn = useCallback(
    (midi) => {
      if (!powered) return
      engine.noteOn(midi)
      setActiveNotes((prev) => {
        if (prev.has(midi)) return prev
        const next = new Set(prev)
        next.add(midi)
        return next
      })
    },
    [engine, powered],
  )

  const handleNoteOff = useCallback(
    (midi) => {
      engine.noteOff(midi)
      setActiveNotes((prev) => {
        if (!prev.has(midi)) return prev
        const next = new Set(prev)
        next.delete(midi)
        return next
      })
    },
    [engine],
  )

  return (
    <div
      className="mx-auto rounded-[18px] p-4 sm:p-6"
      style={{ background: 'var(--enclosure)', border: '1px solid var(--enclosure-edge)', maxWidth: 780 }}
    >
      <div
        className="rounded-[10px] px-4 py-5 sm:px-7 sm:py-7"
        style={{ background: 'var(--panel)', border: '2px solid var(--accent)' }}
      >
        {/* Top power marking */}
        <div className="flex justify-center mb-5">
          <span className="label-print text-[9px]" style={{ color: 'var(--muted-blue)' }}>
            9V DC
          </span>
        </div>

        {/* Main control row */}
        <div className="flex justify-center gap-6 sm:gap-10 mb-6 flex-wrap">
          {KNOB_DEFS.map((def) => (
            <ControlKnob
              key={def.key}
              label={def.label}
              value={knobs[def.key]}
              onChange={(v) => handleKnobChange(def.key, v)}
            />
          ))}
        </div>

        <div className="hairline mb-6" />

        {/* Central identity + selector */}
        <div className="flex justify-between items-start gap-4 mb-6 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <h1
              className="text-[30px] sm:text-[36px] leading-none font-bold tracking-tight"
              style={{ color: 'var(--cream)', fontFamily: 'Georgia, serif' }}
            >
              WEB-SYNTH
            </h1>
            <p className="label-print text-[10px] mt-1" style={{ color: 'var(--accent)' }}>
              Synthesizer Machine
            </p>

            <DecorativeMark />

            <div className="mt-5">
              <PresetList selectedIndex={presetIndex} onSelect={handlePresetChange} />
            </div>
          </div>

          <div className="flex flex-col items-center pt-2">
            <SynthSelector index={presetIndex} onChange={handlePresetChange} />
            <span className="label-print text-[9px] mt-2" style={{ color: 'var(--cream)' }}>
              Synth Select
            </span>
          </div>
        </div>

        <div className="hairline mb-6" />

        {/* LED + footswitch */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <IndicatorLED on={powered} />
          <FootSwitch on={powered} onToggle={togglePower} />
          <span className="label-print text-[9px]" style={{ color: 'var(--muted-blue)' }}>
            {powered ? 'On' : 'Off'}
          </span>
        </div>

        <div className="hairline-accent mb-4" />

        {/* Piano keyboard */}
        <PianoKeyboard activeNotes={activeNotes} onNoteOn={handleNoteOn} onNoteOff={handleNoteOff} />
      </div>
    </div>
  )
}

// Small, restrained inline SVG suggesting a waveform over a strip of keys.
function DecorativeMark() {
  return (
    <svg
      viewBox="0 0 180 34"
      width="150"
      height="28"
      className="mt-3"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <polyline
        points="0,17 15,17 22,4 30,30 38,10 46,24 54,17 180,17"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.5"
      />
      {Array.from({ length: 10 }).map((_, i) => (
        <rect
          key={i}
          x={i * 12}
          y={28}
          width="9"
          height="5"
          fill="none"
          stroke="var(--muted-blue)"
          strokeWidth="1"
        />
      ))}
    </svg>
  )
}
