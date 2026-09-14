export default function PositionStrip({ currentStep, labelWidth }) {
  return (
    <div className="flex items-center gap-1 mb-2">
      <div style={{ width: labelWidth }} />
      <div className="flex gap-1 flex-1">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className={`position-led ${i % 4 === 0 ? 'group-start' : ''} ${currentStep === i ? 'on' : ''}`}
            style={{ height: 4, flex: 1 }}
          />
        ))}
      </div>
    </div>
  )
}
