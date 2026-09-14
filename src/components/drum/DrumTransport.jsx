import { useState } from 'react'
import Knob from '../synth/Knob'
import Display from '../synth/Display'
import SynthButton from '../synth/ToggleButton'
import { useDrum } from '../../state/drumStore'

const MIN_BPM = 40
const MAX_BPM = 240

function tempoToValue(bpm) {
  return (bpm - MIN_BPM) / (MAX_BPM - MIN_BPM)
}
function valueToTempo(v) {
  return Math.round(MIN_BPM + v * (MAX_BPM - MIN_BPM))
}

export default function DrumTransport() {
  const { state, togglePlay, setBpm, clearAll, copyShareLink } = useDrum()
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    await copyShareLink()
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div className="flex items-center gap-4 flex-wrap px-4 py-3" style={{ borderBottom: '1px solid var(--hairline)' }}>
      <SynthButton label={state.playing ? 'Stop' : 'Play'} withLed active={state.playing} onClick={togglePlay} />
      <div className="flex flex-col items-center gap-1">
        <Knob
          label="Tempo"
          value={tempoToValue(state.bpm)}
          onChange={(v) => setBpm(valueToTempo(v))}
          format={() => `${state.bpm}`}
          displayMin={MIN_BPM}
          displayMax={MAX_BPM}
        />
        <Display value={`${state.bpm} BPM`} width={64} />
      </div>
      <SynthButton label="Clear" onClick={clearAll} />
      <SynthButton label={copied ? 'Copied!' : 'Copy Link'} active={copied} onClick={handleCopyLink} />
    </div>
  )
}
