const REPO_URL = 'https://github.com/s4nj1th/web-synth'

export default function Footer() {
  return (
    <footer
      className="flex items-center justify-center px-4 py-4"
      style={{ borderTop: '1px solid var(--hairline)', background: '#141414' }}
    >
      <a
        href={REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="label-print text-[9px] inline-flex items-center gap-1"
        style={{ color: 'var(--muted-grey)', textDecoration: 'none' }}
        onMouseOver={(e) => (e.currentTarget.style.color = 'var(--accent)')}
        onMouseOut={(e) => (e.currentTarget.style.color = 'var(--muted-grey)')}
      >
        <span>Source Code</span>
        <svg width="10" height="10" viewBox="0 0 768 1024" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true">
          <path d="M640 768H128V257.90599999999995L256 256V128H0v768h768V576H640V768zM384 128l128 128L320 448l128 128 192-192 128 128V128H384z" />
        </svg>
      </a>
    </footer>
  )
}
