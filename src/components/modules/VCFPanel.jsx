import ModulePanel from '../synth/ModulePanel'
import Knob from '../synth/Knob'
import { useSynth } from '../../state/synthStore'
import { cutoffFromValue } from '../../audio/modules/Filter'

export default function VCFPanel() {
  const { state, setVcf } = useSynth()
  const { vcf } = state

  return (
    <ModulePanel title="VCF">
      <div className="flex gap-4">
        <Knob
          label="Cutoff"
          value={vcf.cutoff}
          onChange={(v) => setVcf('cutoff', v)}
          format={(v) => `${Math.round(cutoffFromValue(v))}Hz`}
        />
        <Knob label="Res" value={vcf.resonance} onChange={(v) => setVcf('resonance', v)} />
      </div>
      <div className="flex gap-4">
        <Knob label="LFO Mod" value={vcf.lfoMod} onChange={(v) => setVcf('lfoMod', v)} />
        <Knob label="Env Mod" value={vcf.envMod} onChange={(v) => setVcf('envMod', v)} />
      </div>
    </ModulePanel>
  )
}
