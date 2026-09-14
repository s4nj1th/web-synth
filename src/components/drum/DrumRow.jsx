import StepCell from './StepCell'

export default function DrumRow({ label, steps, currentStep, onToggle, onPreview, labelWidth }) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onPreview}
        title="Click to preview this sound"
        className="text-right pr-2 label-print text-[10px] bg-transparent border-0 cursor-pointer"
        style={{ width: labelWidth, color: 'var(--text)' }}
      >
        {label}
      </button>
      <div className="flex gap-1 flex-1">
        {steps.map((active, i) => (
          <StepCell
            key={i}
            active={active}
            isGroupStart={i % 4 === 0}
            isPlayhead={currentStep === i}
            onClick={() => onToggle(i)}
            label={`${label}, step ${i + 1}, ${active ? 'on' : 'off'}`}
          />
        ))}
      </div>
    </div>
  )
}
