import DrumRow from './DrumRow'
import PositionStrip from './PositionStrip'
import { DRUM_ROW_DEFS } from '../../state/drumDefaults'
import { useDrum } from '../../state/drumStore'

const LABEL_WIDTH = 96

export default function StepGrid() {
  const { state, toggleStep, previewRow } = useDrum()

  return (
    <div className="px-3 py-3 overflow-x-auto">
      <div style={{ minWidth: 640 }}>
        <PositionStrip currentStep={state.currentStep} labelWidth={LABEL_WIDTH} />
        <div className="flex flex-col gap-2">
          {DRUM_ROW_DEFS.map((def) => {
            const row = state.rows.find((r) => r.id === def.id)
            return (
              <DrumRow
                key={def.id}
                label={def.label}
                steps={row.steps}
                currentStep={state.currentStep}
                onToggle={(i) => toggleStep(def.id, i)}
                onPreview={() => previewRow(def.id)}
                labelWidth={LABEL_WIDTH}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
