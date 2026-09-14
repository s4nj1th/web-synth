import { useState } from 'react'
import Knob from '../synth/Knob'
import Display from '../synth/Display'
import LED from '../synth/LED'
import SynthButton from '../synth/ToggleButton'
import OutputPanel from '../modules/OutputPanel'
import { useSynth } from '../../state/synthStore'

const MIN_BPM = 40
const MAX_BPM = 240

function tempoToValue(bpm) {
  return (bpm - MIN_BPM) / (MAX_BPM - MIN_BPM)
}
function valueToTempo(v) {
  return Math.round(MIN_BPM + v * (MAX_BPM - MIN_BPM))
}

export default function Header() {
  const { state, togglePower, setMasterVolume, setTempo } = useSynth()
  const [funcOn, setFuncOn] = useState(false)

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap px-4 py-3" style={{ borderBottom: '1px solid var(--hairline)' }}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePower}
          aria-pressed={state.power}
          aria-label={state.power ? 'Turn synthesizer off' : 'Turn synthesizer on'}
          className="synth-btn flex items-center gap-2 px-3 py-2"
        >
          <LED on={state.power} size={9} />
          <span className="label-print text-[9px]">Power</span>
        </button>
      </div>

      <div className="flex flex-col items-start">
        <h1 className="brand-font text-[26px] leading-none font-bold tracking-tight" style={{ color: 'var(--cream)' }}>
          WEB-SYNTH
        </h1>
        <p className="label-print text-[9px] mt-1" style={{ color: 'var(--accent)' }}>
          Analog Synthesizer
        </p>
      </div>

      <SynthButton label="Func" small active={funcOn} onClick={() => setFuncOn((v) => !v)} />

      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center gap-1">
          <Knob
            label="Tempo"
            value={tempoToValue(state.tempo)}
            onChange={(v) => setTempo(valueToTempo(v))}
            format={() => `${state.tempo}`}
            displayMin={MIN_BPM}
            displayMax={MAX_BPM}
          />
          <Display value={`${state.tempo} BPM`} width={64} />
        </div>
        <Knob label="Volume" value={state.masterVolume} onChange={setMasterVolume} />
      </div>

      <OutputPanel />
    </div>
  )
}
