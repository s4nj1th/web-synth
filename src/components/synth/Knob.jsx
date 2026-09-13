import { useCallback, useEffect, useRef, useState } from 'react'

const MIN_ANGLE = -135
const MAX_ANGLE = 135
const SWEEP = MAX_ANGLE - MIN_ANGLE
const CLICK_MOVE_THRESHOLD = 4 // px of pointer travel before a press counts as a drag, not a click

function toDisplay(value01, min, max, curve) {
  if (curve === 'log') return min * Math.pow(max / min, value01)
  return min + value01 * (max - min)
}

function fromDisplay(displayValue, min, max, curve) {
  let v
  if (curve === 'log') v = Math.log(displayValue / min) / Math.log(max / min)
  else v = (displayValue - min) / (max - min)
  return Math.min(1, Math.max(0, v))
}

// Physical-style rotary knob, value normalised 0..1.
// `format` optionally converts the 0..1 value into a display string for the
// transient value chip (e.g. Hz, seconds) instead of a raw percentage.
// `displayMin`/`displayMax`/`displayCurve` describe the real-world unit
// range so a click opens a numeric input the person can type an exact
// integer into (e.g. type "128" on the tempo knob to get 128 BPM).
export default function Knob({
  label,
  value,
  onChange,
  size = 46,
  format,
  displayMin = 0,
  displayMax = 100,
  displayCurve = 'linear',
}) {
  const [showValue, setShowValue] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState('')
  const dragState = useRef(null)
  const hideTimeout = useRef(null)
  const inputRef = useRef(null)

  const flashValue = useCallback(() => {
    setShowValue(true)
    if (hideTimeout.current) clearTimeout(hideTimeout.current)
    hideTimeout.current = setTimeout(() => setShowValue(false), 700)
  }, [])

  const clamp = (v) => Math.min(1, Math.max(0, v))

  const handlePointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragState.current = { startY: e.clientY, startValue: value, moved: false }
    setShowValue(true)
  }

  const handlePointerMove = (e) => {
    if (!dragState.current) return
    const deltaY = dragState.current.startY - e.clientY
    if (Math.abs(deltaY) > CLICK_MOVE_THRESHOLD) dragState.current.moved = true
    if (dragState.current.moved) {
      onChange(clamp(dragState.current.startValue + deltaY / 140))
    }
  }

  const handlePointerUp = (e) => {
    const wasDrag = dragState.current?.moved
    dragState.current = null
    e.currentTarget.releasePointerCapture?.(e.pointerId)
    if (wasDrag) {
      flashValue()
    } else {
      setShowValue(false)
      setEditText(String(Math.round(toDisplay(value, displayMin, displayMax, displayCurve))))
      setEditing(true)
    }
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
    if (e.key === 'Enter') {
      setEditText(String(Math.round(toDisplay(value, displayMin, displayMax, displayCurve))))
      setEditing(true)
      return
    }
    if (next !== null) {
      e.preventDefault()
      onChange(next)
      flashValue()
    }
  }

  const commitEdit = () => {
    const parsed = parseInt(editText, 10)
    if (!Number.isNaN(parsed)) {
      onChange(fromDisplay(parsed, displayMin, displayMax, displayCurve))
    }
    setEditing(false)
  }

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      commitEdit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setEditing(false)
    }
  }

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const angle = MIN_ANGLE + value * SWEEP
  const displayText = format ? format(value) : Math.round(value * 100)

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ marginBottom: showValue ? 20 : 0, width: size, height: size }}>
        {editing ? (
          <input
            ref={inputRef}
            type="number"
            step={1}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleEditKeyDown}
            aria-label={`${label} value`}
            className="text-center"
            style={{
              width: size,
              height: size * 0.55,
              marginTop: size * 0.22,
              background: 'var(--dark-control)',
              color: 'var(--cream)',
              border: '1px solid var(--accent)',
              fontSize: 11,
            }}
          />
        ) : (
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
            title="Click to type a value"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onWheel={handleWheel}
            onKeyDown={handleKeyDown}
          >
            <div className="knob-cap" />
            <div className="knob-indicator" style={{ transform: `translateX(-50%) rotate(${angle}deg)` }} />
          </div>
        )}
        {showValue && !editing && <div className="value-chip">{displayText}</div>}
      </div>
      <span className="label-print text-[8px]" style={{ color: 'var(--text)' }}>
        {label}
      </span>
    </div>
  )
}
