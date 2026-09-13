import { PRESETS } from '../audio/presets'

// Presets printed directly onto the panel, not styled as buttons.
export default function PresetList({ selectedIndex, onSelect }) {
  return (
    <div className="flex flex-col gap-[3px]">
      {PRESETS.map((preset, i) => {
        const active = i === selectedIndex
        return (
          <button
            key={preset.code}
            type="button"
            onClick={() => onSelect(i)}
            className="flex items-center gap-2 text-left bg-transparent border-0 p-0 cursor-pointer"
            style={{
              borderLeft: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
              paddingLeft: 6,
            }}
            aria-pressed={active}
          >
            <span
              className="label-print text-[10px]"
              style={{ color: active ? 'var(--accent)' : 'var(--muted-blue)' }}
            >
              {preset.code}
            </span>
            <span
              className="label-print text-[11px]"
              style={{ color: active ? 'var(--cream)' : 'var(--muted-blue)' }}
            >
              {preset.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}
