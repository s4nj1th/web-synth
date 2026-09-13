import ModulePanel from '../synth/ModulePanel'
import Slider from '../synth/Slider'
import { useSynth } from '../../state/synthStore'

export default function EnvelopePanel() {
  const { state, setEnvelope } = useSynth()
  const { envelope } = state

  return (
    <ModulePanel title="ENV">
      <div className="flex gap-3 mt-1">
        <Slider label="A" value={envelope.attack} onChange={(v) => setEnvelope('attack', v)} />
        <Slider label="D" value={envelope.decay} onChange={(v) => setEnvelope('decay', v)} />
        <Slider label="S" value={envelope.sustain} onChange={(v) => setEnvelope('sustain', v)} />
        <Slider label="R" value={envelope.release} onChange={(v) => setEnvelope('release', v)} />
      </div>
    </ModulePanel>
  )
}
