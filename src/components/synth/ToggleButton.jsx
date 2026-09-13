import LED from './LED'

// Generic hardware button. Works for both momentary actions (PLAY, WRITE)
// and toggled states (active waveform, selected step) via the `active` prop.
export default function SynthButton({ label, active = false, onClick, withLed = false, small = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`synth-btn label-print flex items-center justify-center gap-1 ${active ? 'active' : ''}`}
      style={{
        fontSize: small ? 8 : 9,
        padding: small ? '4px 6px' : '6px 9px',
        minWidth: small ? 34 : undefined,
      }}
    >
      {withLed && <LED on={active} size={6} />}
      <span>{label}</span>
    </button>
  )
}
