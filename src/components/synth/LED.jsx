export default function LED({ on, size = 10 }) {
  return (
    <span
      className="led inline-block"
      style={{ width: size, height: size, background: on ? 'var(--led-on)' : 'var(--led-off)' }}
      role="status"
      aria-label={on ? 'active' : 'inactive'}
    >
      <span className="led-highlight" />
    </span>
  )
}
