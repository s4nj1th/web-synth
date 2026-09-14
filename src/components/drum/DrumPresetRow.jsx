import SynthButton from '../synth/ToggleButton'
import { useDrum } from '../../state/drumStore'
import { DRUM_PRESETS } from '../../audio/presets/drumPresets'

export default function DrumPresetRow() {
  const { state, selectPreset } = useDrum()

  return (
    <div className="flex flex-col gap-1 px-4 pt-3">
      <span className="label-print text-[8px]" style={{ color: 'var(--muted-grey)' }}>
        Beats
      </span>
      <div className="flex gap-1 flex-wrap">
        {DRUM_PRESETS.map((preset, i) => (
          <SynthButton
            key={preset.name}
            small
            label={preset.name}
            active={state.preset === i}
            onClick={() => selectPreset(i)}
          />
        ))}
      </div>
    </div>
  )
}
