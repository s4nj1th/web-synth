import { useRef } from 'react'

const COUNT = 6
const MIN_ANGLE = -150
const MAX_ANGLE = 150
const STEP_ANGLE = (MAX_ANGLE - MIN_ANGLE) / (COUNT - 1)
const SIZE = 108
const NUMBER_RADIUS = SIZE / 2 + 16

// Large cream rotary selector with six fixed positions.
// Dragging accumulates vertical movement into discrete steps; wheel and
// arrow keys move one position at a time; clicking a number jumps directly.
export default function SynthSelector({ index, onChange }) {
  const dragState = useRef(null)

  const clampIndex = (i) => Math.min(COUNT - 1, Math.max(0, i))

  const handlePointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragState.current = { startY: e.clientY, startIndex: index }
  }

  const handlePointerMove = (e) => {
    if (!dragState.current) return
    const deltaY = dragState.current.startY - e.clientY
    const steps = Math.round(deltaY / 40)
    const next = clampIndex(dragState.current.startIndex + steps)
    if (next !== index) onChange(next)
  }

  const handlePointerUp = (e) => {
    dragState.current = null
    e.currentTarget.releasePointerCapture?.(e.pointerId)
  }

  const handleWheel = (e) => {
    if (e.deltaY < 0) onChange(clampIndex(index + 1))
    else onChange(clampIndex(index - 1))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault()
      onChange(clampIndex(index + 1))
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault()
      onChange(clampIndex(index - 1))
    }
  }

  const angle = MIN_ANGLE + index * STEP_ANGLE

  return (
    <div className="relative" style={{ width: SIZE + NUMBER_RADIUS, height: SIZE + NUMBER_RADIUS }}>
      <div
        className="selector-body absolute"
        style={{ width: SIZE, height: SIZE, left: 0, top: NUMBER_RADIUS - SIZE / 2 + 8 }}
        role="slider"
        tabIndex={0}
        aria-label="Synth type selector"
        aria-valuemin={1}
        aria-valuemax={COUNT}
        aria-valuenow={index + 1}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        onKeyDown={handleKeyDown}
      >
        <div
          className="selector-indicator"
          style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
        />
      </div>
      {Array.from({ length: COUNT }).map((_, i) => {
        const numAngle = ((MIN_ANGLE + i * STEP_ANGLE) * Math.PI) / 180
        const cx = SIZE / 2
        const cy = NUMBER_RADIUS - SIZE / 2 + 8 + SIZE / 2
        const x = cx + Math.sin(numAngle) * NUMBER_RADIUS
        const y = cy - Math.cos(numAngle) * NUMBER_RADIUS
        return (
          <button
            key={i}
            type="button"
            className={`selector-number ${i === index ? 'active' : ''}`}
            style={{ left: x, top: y }}
            onClick={() => onChange(i)}
            aria-label={`Select synth ${i + 1}`}
          >
            {i + 1}
          </button>
        )
      })}
    </div>
  )
}
