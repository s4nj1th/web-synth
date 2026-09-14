import { useRouter } from '../../router/Router'

const LINKS = [
  { path: '/', label: 'Synth' },
  { path: '/drums', label: 'Drum Machine' },
  { path: '/sampler', label: 'Sampler' },
  { path: '/effects', label: 'Effects' },
  { path: '/arp', label: 'Arpeggiator' },
]

export default function NavBar() {
  const { path, navigate } = useRouter()

  return (
    <nav
      className="flex items-center justify-between gap-4 flex-wrap px-4 sm:px-6 py-3"
      style={{ borderBottom: '1px solid var(--hairline)', background: '#141414' }}
    >
      <a
        href="/"
        onClick={(e) => {
          e.preventDefault()
          navigate('/')
        }}
        className="brand-font text-[18px] font-semibold"
        style={{ color: 'var(--cream)' }}
      >
        WEB-SYNTH
      </a>
      <div className="flex items-center gap-1 flex-wrap">
        {LINKS.map((link) => {
          const active = link.path === '/' ? path === '/' : path.startsWith(link.path)
          return (
            <a
              key={link.path}
              href={link.path}
              onClick={(e) => {
                e.preventDefault()
                navigate(link.path)
              }}
              className="label-print synth-btn"
              style={{
                fontSize: 9,
                padding: '6px 10px',
                textDecoration: 'none',
                display: 'inline-block',
                borderColor: active ? 'var(--accent)' : undefined,
                color: active ? 'var(--cream)' : 'var(--text)',
              }}
              aria-current={active ? 'page' : undefined}
            >
              {link.label}
            </a>
          )
        })}
      </div>
    </nav>
  )
}
