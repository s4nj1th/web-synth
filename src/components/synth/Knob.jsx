import { useCallback, useRef, useState } from 'react'

const MIN_ANGLE = -135
const MAX_ANGLE = 135
const SWEEP = MAX_ANGLE - MIN_ANGLE

// Physical-style rotary knob, value normalised 0..1.
// `format` optionally converts the 0..1 value into a display string for the
// transient value chip (e.g. Hz, seconds) instead of a raw percentage.
export default function Knob({ label, value, onChange, size = 46, format }) {
  const [showValue, setShowValue] = useState(false)
  const dragState = useRef(null)
  const hideTimeout = useRef(null)

  const flashValue = useCallback(() => {
    setShowValue(true)
    if (hideTimeout.current) clearTimeout(hideTimeout.current)
    hideTimeout.current = setTimeout(() => setShowValue(false), 700)
  }, [])

  const clamp = (v) => Math.min(1, Math.max(0, v))

  const handlePointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragState.current = { startY: e.clientY, startValue: value }
    setShowValue(true)
  }

  const handlePointerMove = (e) => {
    if (!dragState.current) return
    const deltaY = dragState.current.startY - e.clientY
    onChange(clamp(dragState.current.startValue + deltaY / 140))
  }

  const handlePointerUp = (e) => {
    dragState.current = null
    e.currentTarget.releasePointerCapture?.(e.pointerId)
    flashValue()
  }

  const handleWheel = (e) => {
    const delta = e.deltaY < 0 ? 0.02 : -0.02
    onChange(clamp(value + delta))
    flashValue()
  }

  const handleKeyDown = (e) => {
    let next = null
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') next = clamp(value + 0.02)
    if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') next = clamp(value - 0.02)
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = 1
    if (next !== null) {
      e.preventDefault()
      onChange(next)
      flashValue()
    }
  }

  const angle = MIN_ANGLE + value * SWEEP
  const displayText = format ? format(value) : Math.round(value * 100)

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ marginBottom: showValue ? 20 : 0 }}>
        <div
          className="knob-body"
          style={{ width: size, height: size }}
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={1}
          aria-valuenow={Number(value.toFixed(2))}
          aria-orientation="vertical"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onWheel={handleWheel}
          onKeyDown={handleKeyDown}
        >
          <div className="knob-cap" />
          <div className="knob-indicator" style={{ transform: `translateX(-50%) rotate(${angle}deg)` }} />
        </div>
        {showValue && <div className="value-chip">{displayText}</div>}
      </div>
      <span className="label-print text-[8px]" style={{ color: 'var(--text)' }}>
        {label}
      </span>
    </div>
  )
}
