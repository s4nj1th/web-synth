import { RouterProvider, useRouter } from './router/Router'
import NavBar from './components/layout/NavBar'
import SynthPage from './pages/SynthPage'
import DrumMachinePage from './pages/DrumMachinePage'
import PlaceholderPage from './pages/PlaceholderPage'

function CurrentPage() {
  const { path } = useRouter()
  if (path === '/drums') return <DrumMachinePage />
  if (path === '/sampler') return <PlaceholderPage title="Sampler" />
  if (path === '/effects') return <PlaceholderPage title="Effects" />
  if (path === '/arp') return <PlaceholderPage title="Arpeggiator" />
  return <SynthPage />
}

export default function App() {
  return (
    <RouterProvider>
      <div style={{ background: 'var(--page-bg)', minHeight: '100vh' }}>
        <NavBar />
        <CurrentPage />
      </div>
    </RouterProvider>
  )
}
