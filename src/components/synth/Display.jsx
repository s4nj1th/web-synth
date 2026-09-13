export default function Display({ value, width = 56, label }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="hw-display text-[11px] py-1" style={{ width }}>
        {value}
      </div>
      {label && (
        <span className="label-print text-[8px]" style={{ color: 'var(--muted-grey)' }}>
          {label}
        </span>
      )}
    </div>
  )
}
