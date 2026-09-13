import LFOPanel from '../modules/LFOPanel'
import VCOPanel from '../modules/VCOPanel'
import VCFPanel from '../modules/VCFPanel'
import EnvelopePanel from '../modules/EnvelopePanel'
import MemoryPanel from '../modules/MemoryPanel'

export default function ControlSurface() {
  return (
    <div className="flex items-stretch justify-center gap-0 py-4 px-2 flex-wrap" style={{ borderBottom: '1px solid var(--hairline)' }}>
      <LFOPanel />
      <div className="hairline-v" />
      <VCOPanel />
      <div className="hairline-v" />
      <VCFPanel />
      <div className="hairline-v" />
      <EnvelopePanel />
      <div className="hairline-v" />
      <MemoryPanel />
    </div>
  )
}
