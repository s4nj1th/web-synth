// Shared visual frame for every printed-on-the-panel module. Keeping this
// generic means adding a new module (Delay, Arp, ...) only requires a new
// panel component using this wrapper, not new panel chrome.
export default function ModulePanel({ title, children, width }) {
  return (
    <div className="flex flex-col h-full px-3 py-2" style={{ width }}>
      <div className="label-print text-[10px] mb-2 text-center" style={{ color: 'var(--accent)' }}>
        {title}
      </div>
      <div className="flex-1 flex flex-col items-center justify-start gap-3">{children}</div>
    </div>
  )
}
