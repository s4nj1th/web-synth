import SynthButton from './ToggleButton'
import { useSynth } from '../../state/synthStore'
import { PRESETS } from '../../audio/presets/presets'

export default function PresetRow() {
  const { state, selectPreset } = useSynth()

  return (
    <div className="flex flex-col gap-1">
      <span className="label-print text-[8px]" style={{ color: 'var(--muted-grey)' }}>
        Presets
      </span>
      <div className="flex gap-1 flex-wrap">
        {PRESETS.map((preset, i) => (
          <SynthButton
            key={preset.code}
            small
            label={`${preset.code} ${preset.name}`}
            active={state.preset.current === i}
            onClick={() => selectPreset(i)}
          />
        ))}
      </div>
    </div>
  )
}
