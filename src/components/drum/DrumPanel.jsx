import DrumTransport from './DrumTransport'
import DrumPresetRow from './DrumPresetRow'
import StepGrid from './StepGrid'

export default function DrumPanel() {
  return (
    <div
      className="mx-auto rounded-[10px] overflow-hidden"
      style={{
        background: 'var(--enclosure)',
        border: '1px solid var(--enclosure-edge)',
        maxWidth: 900,
        width: '100%',
      }}
    >
      <div className="rounded-[6px] m-2" style={{ background: 'var(--panel)', border: '1px solid #000' }}>
        <div className="flex items-center justify-between gap-4 flex-wrap px-4 py-3" style={{ borderBottom: '1px solid var(--hairline)' }}>
          <div className="flex flex-col items-start">
            <h1 className="brand-font text-[24px] leading-none" style={{ color: 'var(--cream)' }}>
              WEB-SYNTH
            </h1>
            <p className="label-print text-[9px] mt-1" style={{ color: 'var(--accent)' }}>
              Drum Machine
            </p>
          </div>
        </div>
        <DrumTransport />
        <DrumPresetRow />
        <StepGrid />
      </div>
    </div>
  )
}
