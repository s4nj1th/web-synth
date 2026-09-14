export default function StepCell({ active, isGroupStart, isPlayhead, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className={`drum-cell ${isGroupStart ? 'group-start' : ''} ${active ? 'active' : ''} ${isPlayhead ? 'playhead' : ''}`}
      style={{ flex: 1, height: 26 }}
    />
  )
}
