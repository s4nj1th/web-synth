export default function PianoKey({ isBlack, hint, pressed, style, onPress, onRelease, label }) {
  return (
    <button
      type="button"
      className={`${isBlack ? 'piano-black-key' : 'piano-white-key'} ${pressed ? 'pressed' : ''}`}
      style={style}
      aria-label={label}
      onPointerDown={(e) => {
        e.preventDefault()
        onPress()
      }}
      onPointerUp={onRelease}
      onPointerLeave={() => {
        if (pressed) onRelease()
      }}
    >
      {hint && <span className="key-hint">{hint}</span>}
    </button>
  )
}
