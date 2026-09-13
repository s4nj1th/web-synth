import { useEffect, useRef, useState } from 'react'

const HEIGHT = 96
const CLICK_MOVE_THRESHOLD = 4

// Physical-style vertical fader, value normalised 0..1 (0 = bottom).
// Clicking without dragging opens a small numeric input so the exact
// percentage can be typed in.
export default function Slider({ label, value, onChange }) {
  const dragState = useRef(null)
  const [showValue, setShowValue] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState('')
  const inputRef = useRef(null)

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
      onChange(clamp(dragState.current.startValue + deltaY / HEIGHT))
    }
  }

  const handlePointerUp = (e) => {
    const wasDrag = dragState.current?.moved
    dragState.current = null
    e.currentTarget.releasePointerCapture?.(e.pointerId)
    if (wasDrag) {
      setTimeout(() => setShowValue(false), 500)
    } else {
      setShowValue(false)
      setEditText(String(Math.round(value * 100)))
      setEditing(true)
    }
  }

  const handleKeyDown = (e) => {
    let next = null
    if (e.key === 'ArrowUp') next = clamp(value + 0.03)
    if (e.key === 'ArrowDown') next = clamp(value - 0.03)
    if (e.key === 'Enter') {
      setEditText(String(Math.round(value * 100)))
      setEditing(true)
      return
    }
    if (next !== null) {
      e.preventDefault()
      onChange(next)
      setShowValue(true)
      setTimeout(() => setShowValue(false), 500)
    }
  }

  const commitEdit = () => {
    const parsed = parseInt(editText, 10)
    if (!Number.isNaN(parsed)) {
      onChange(clamp(parsed / 100))
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

  const handlePercent = value * 100

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ height: HEIGHT, paddingTop: 6, paddingBottom: 6 }}>
        {editing ? (
          <input
            ref={inputRef}
            type="number"
            step={1}
            min={0}
            max={100}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleEditKeyDown}
            aria-label={`${label} value`}
            className="text-center"
            style={{
              width: 34,
              height: 24,
              marginTop: HEIGHT / 2 - 12,
              background: 'var(--dark-control)',
              color: 'var(--cream)',
              border: '1px solid var(--accent)',
              fontSize: 10,
            }}
          />
        ) : (
          <>
            <div className="slider-track" style={{ height: HEIGHT }}>
              {[0, 25, 50, 75, 100].map((p) => (
                <div key={p} className="slider-tick" style={{ bottom: `${p}%` }} />
              ))}
            </div>
            <div
              className="slider-handle"
              role="slider"
              tabIndex={0}
              aria-label={label}
              aria-valuemin={0}
              aria-valuemax={1}
              aria-valuenow={Number(value.toFixed(2))}
              aria-orientation="vertical"
              title="Click to type a value"
              style={{ bottom: `${handlePercent}%` }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onKeyDown={handleKeyDown}
            />
            {showValue && (
              <div className="value-chip" style={{ bottom: `${handlePercent}%`, left: 28, transform: 'translateY(50%)' }}>
                {Math.round(handlePercent)}
              </div>
            )}
          </>
        )}
      </div>
      <span className="label-print text-[9px]" style={{ color: 'var(--cream)' }}>
        {label}
      </span>
    </div>
  )
}
