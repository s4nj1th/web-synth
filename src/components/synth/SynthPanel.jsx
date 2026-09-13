import Header from '../layout/Header'
import ControlSurface from '../layout/ControlSurface'
import BottomKeyboard from '../layout/BottomKeyboard'

export default function SynthPanel() {
  return (
    <div
      className="mx-auto rounded-[10px] overflow-hidden"
      style={{
        background: 'var(--enclosure)',
        border: '1px solid var(--enclosure-edge)',
        maxWidth: 1240,
        width: '100%',
      }}
    >
      <div className="rounded-[6px] m-2" style={{ background: 'var(--panel)', border: '1px solid #000' }}>
        <Header />
        <ControlSurface />
        <BottomKeyboard />
      </div>
    </div>
  )
}
