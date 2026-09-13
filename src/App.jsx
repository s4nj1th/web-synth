import SynthPanel from './components/synth/SynthPanel'
import { SynthProvider } from './state/synthStore'

export default function App() {
  return (
    <SynthProvider>
      <div className="min-h-screen flex items-center justify-center py-8 px-3" style={{ background: 'var(--page-bg)' }}>
        <SynthPanel />
      </div>
    </SynthProvider>
  )
}
