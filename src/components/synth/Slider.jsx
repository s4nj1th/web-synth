import { useRef, useState } from 'react'

const HEIGHT = 96

// Physical-style vertical fader, value normalised 0..1 (0 = bottom).
export default function Slider({ label, value, onChange }) {
  const trackRef = useRef(null)
  const dragState = useRef(null)
  const [showValue, setShowValue] = useState(false)

  const clamp = (v) => Math.min(1, Math.max(0, v))

  const handlePointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragState.current = { startY: e.clientY, startValue: value }
    setShowValue(true)
  }

  const handlePointerMove = (e) => {
    if (!dragState.current) return
    const deltaY = dragState.current.startY - e.clientY
    onChange(clamp(dragState.current.startValue + deltaY / HEIGHT))
  }

  const handlePointerUp = (e) => {
    dragState.current = null
    e.currentTarget.releasePointerCapture?.(e.pointerId)
    setTimeout(() => setShowValue(false), 500)
  }

  const handleKeyDown = (e) => {
    let next = null
    if (e.key === 'ArrowUp') next = clamp(value + 0.03)
    if (e.key === 'ArrowDown') next = clamp(value - 0.03)
    if (next !== null) {
      e.preventDefault()
      onChange(next)
      setShowValue(true)
      setTimeout(() => setShowValue(false), 500)
    }
  }

  const handlePercent = value * 100

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ height: HEIGHT, paddingTop: 6, paddingBottom: 6 }}>
        <div ref={trackRef} className="slider-track" style={{ height: HEIGHT }}>
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
      </div>
      <span className="label-print text-[9px]" style={{ color: 'var(--cream)' }}>
        {label}
      </span>
    </div>
  )
}
