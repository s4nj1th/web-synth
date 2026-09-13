import ModulePanel from '../synth/ModulePanel'
import Knob from '../synth/Knob'
import SynthButton from '../synth/ToggleButton'
import { useSynth } from '../../state/synthStore'

const WAVEFORMS = [
  { value: 'sine', label: 'SINE' },
  { value: 'triangle', label: 'TRI' },
  { value: 'sawtooth', label: 'SAW' },
  { value: 'square', label: 'SQR' },
]

export default function VCOPanel() {
  const { state, setVco } = useSynth()
  const { vco } = state

  return (
    <ModulePanel title="VCO">
      <div className="flex gap-4">
        <Knob label="Pitch Mod" value={vco.pitchMod} onChange={(v) => setVco('pitchMod', v)} />
        <Knob label="Detune" value={vco.detune} onChange={(v) => setVco('detune', v)} />
      </div>
      <div className="flex gap-1 flex-wrap justify-center">
        {WAVEFORMS.map((w) => (
          <SynthButton
            key={w.value}
            label={w.label}
            small
            active={vco.waveform === w.value}
            onClick={() => setVco('waveform', w.value)}
          />
        ))}
      </div>
      <Knob label="PWM Mod" value={vco.pwmMod} onChange={(v) => setVco('pwmMod', v)} />
    </ModulePanel>
  )
}
