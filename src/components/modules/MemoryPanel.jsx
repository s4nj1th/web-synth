import { useState } from 'react'
import ModulePanel from '../synth/ModulePanel'
import SynthButton from '../synth/ToggleButton'
import Display from '../synth/Display'
import { useSynth } from '../../state/synthStore'

export default function MemoryPanel() {
  const { state, writePatch, recallNextPatch, erasePatch } = useSynth()
  const [recordOn, setRecordOn] = useState(false)

  const currentLabel =
    typeof state.preset.current === 'string' ? state.preset.current.slice(0, 10) : '----'

  return (
    <ModulePanel title="Memory" width={110}>
      <Display value={currentLabel} width={90} label="Patch" />
      <div className="flex flex-col gap-1 items-stretch">
        <SynthButton label="Write" small onClick={writePatch} />
        <SynthButton label="Record" small active={recordOn} onClick={() => setRecordOn((v) => !v)} />
        <SynthButton label="Play" small onClick={recallNextPatch} />
        <SynthButton label="Erase" small onClick={erasePatch} />
      </div>
    </ModulePanel>
  )
}
