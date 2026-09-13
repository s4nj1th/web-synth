export default function IndicatorLED({ on }) {
  return (
    <div
      className="led relative"
      style={{
        width: 12,
        height: 12,
        background: on ? 'var(--led-on)' : 'var(--led-off)',
      }}
      role="status"
      aria-label={on ? 'Synth active' : 'Synth inactive'}
    >
      <div className="led-highlight" />
    </div>
  )
}
