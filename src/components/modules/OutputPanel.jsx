// Visual-only system section (MIDI/sync jacks). Real MIDI input, when the
// browser supports it, is wired up in synthStore.jsx independently of this
// display — these jacks simply mirror the reference hardware's rear panel.
export default function OutputPanel() {
  return (
    <div className="flex items-end gap-4">
      <Jack label="MIDI IN" din />
      <Jack label="SYNC IN" />
      <Jack label="SYNC OUT" />
    </div>
  )
}

function Jack({ label, din = false }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={din ? 'jack-din' : 'jack'} style={{ width: 22, height: 22 }} />
      <span className="label-print text-[7px]" style={{ color: 'var(--muted-grey)' }}>
        {label}
      </span>
    </div>
  )
}
