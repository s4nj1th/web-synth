import SynthPanel from '../components/synth/SynthPanel'
import { SynthProvider } from '../state/synthStore'

export default function SynthPage() {
  return (
    <SynthProvider>
      <div className="min-h-[80vh] flex items-center justify-center py-8 px-3">
        <SynthPanel />
      </div>
    </SynthProvider>
  )
}
