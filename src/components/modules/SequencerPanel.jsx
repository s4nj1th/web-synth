import ModulePanel from '../synth/ModulePanel'
import SynthButton from '../synth/ToggleButton'
import LED from '../synth/LED'
import { useSynth } from '../../state/synthStore'

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

function noteLabel(note) {
  return `${NOTE_NAMES[note % 12]}${Math.floor(note / 12) - 1}`
}

export default function SequencerPanel() {
  const { state, playSequencer, stopSequencer, clearSequencer, toggleStep, advanceSelectedStep } = useSynth()
  const { steps, playing, currentStep, selectedStep } = state.sequencer

  return (
    <ModulePanel title="Sequencer" width={undefined}>
      <div className="flex items-center gap-2">
        <SynthButton label="Play" withLed active={playing} onClick={playSequencer} />
        <SynthButton label="Stop" onClick={stopSequencer} />
        <SynthButton label="Clear" onClick={clearSequencer} />
        <SynthButton label="Step" onClick={advanceSelectedStep} />
      </div>
      <div className="flex gap-2 mt-1">
        {steps.map((step, i) => (
          <button
            key={i}
            type="button"
            onClick={() => toggleStep(i)}
            className={`step-pad flex flex-col items-center justify-center gap-1 ${step.active ? 'active' : ''} ${
              selectedStep === i ? 'selected' : ''
            }`}
            style={{ width: 44, height: 44 }}
            aria-label={`Step ${i + 1}, ${step.active ? 'on' : 'off'}, note ${noteLabel(step.note)}`}
            aria-pressed={step.active}
          >
            <LED on={currentStep === i} size={7} />
            <span className="label-print text-[7px]" style={{ color: 'var(--text)' }}>
              {noteLabel(step.note)}
            </span>
          </button>
        ))}
      </div>
    </ModulePanel>
  )
}
