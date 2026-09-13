import ModulePanel from '../synth/ModulePanel'
import Knob from '../synth/Knob'
import SynthButton from '../synth/ToggleButton'
import { useSynth } from '../../state/synthStore'
import { rateFromValue, delayFromValue } from '../../audio/modules/LFO'

const WAVEFORMS = [
  { value: 'sine', label: 'SIN' },
  { value: 'triangle', label: 'TRI' },
  { value: 'sawtooth', label: 'SAW' },
  { value: 'square', label: 'SQR' },
]

export default function LFOPanel() {
  const { state, setLfo } = useSynth()
  const { lfo } = state

  return (
    <ModulePanel title="LFO">
      <div className="flex gap-4">
        <Knob label="Rate" value={lfo.rate} onChange={(v) => setLfo('rate', v)} format={(v) => `${rateFromValue(v).toFixed(1)}Hz`} />
        <Knob label="Delay" value={lfo.delay} onChange={(v) => setLfo('delay', v)} format={(v) => `${delayFromValue(v).toFixed(2)}s`} />
      </div>
      <div className="flex gap-1 flex-wrap justify-center">
        {WAVEFORMS.map((w) => (
          <SynthButton
            key={w.value}
            label={w.label}
            small
            active={lfo.waveform === w.value}
            onClick={() => setLfo('waveform', w.value)}
          />
        ))}
      </div>
    </ModulePanel>
  )
}
