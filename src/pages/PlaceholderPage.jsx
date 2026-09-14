// Boilerplate page for a module that doesn't exist yet. Wiring a nav link
// and a stub page ahead of time keeps the eventual module addition to
// "build the module and swap this file in" rather than touching routing,
// nav, or layout.
export default function PlaceholderPage({ title, description }) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8 px-3">
      <div
        className="rounded-[10px] px-8 py-10 text-center"
        style={{ background: 'var(--enclosure)', border: '1px solid var(--enclosure-edge)', maxWidth: 480 }}
      >
        <p className="label-print text-[9px] mb-3" style={{ color: 'var(--accent)' }}>
          Coming soon
        </p>
        <h1 className="brand-font text-[28px] mb-3" style={{ color: 'var(--cream)' }}>
          {title}
        </h1>
        <p className="text-[13px]" style={{ color: 'var(--muted-grey)' }}>
          {description || `The ${title} module isn't built yet. This page is a placeholder in the site's navigation.`}
        </p>
      </div>
    </div>
  )
}
