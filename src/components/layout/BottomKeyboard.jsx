import SequencerPanel from '../modules/SequencerPanel'
import Keyboard from '../synth/Keyboard'
import PresetRow from '../synth/PresetRow'

export default function BottomKeyboard() {
  return (
    <div className="flex flex-col gap-3 px-4 pt-3 pb-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <PresetRow />
        <SequencerPanel />
      </div>
      <Keyboard />
    </div>
  )
}
