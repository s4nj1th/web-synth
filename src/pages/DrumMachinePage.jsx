import DrumPanel from '../components/drum/DrumPanel'
import { DrumProvider } from '../state/drumStore'

export default function DrumMachinePage() {
  return (
    <DrumProvider>
      <div className="min-h-[80vh] flex items-center justify-center py-8 px-3">
        <DrumPanel />
      </div>
    </DrumProvider>
  )
}
