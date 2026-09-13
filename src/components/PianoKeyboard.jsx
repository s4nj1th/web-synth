import { useEffect, useMemo, useRef } from 'react'
import PianoKey from './PianoKey'

const BASE_NOTE = 60 // C4
const OCTAVES = 2
const TOTAL_SEMITONES = OCTAVES * 12
const WHITE_OFFSETS = [0, 2, 4, 5, 7, 9, 11]
const BLACK_OFFSETS = [1, 3, 6, 8, 10]
const PRECEDING_WHITE_INDEX = { 1: 0, 3: 1, 6: 3, 8: 4, 10: 5 }
const WHITE_PER_OCTAVE = 7

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// Computer-key mapping, covers one octave plus one note.
const CODE_TO_OFFSET = {
  KeyA: 0,
  KeyW: 1,
  KeyS: 2,
  KeyE: 3,
  KeyD: 4,
  KeyF: 5,
  KeyT: 6,
  KeyG: 7,
  KeyY: 8,
  KeyH: 9,
  KeyU: 10,
  KeyJ: 11,
  KeyK: 12,
}
const HINT_BY_OFFSET = {
  0: 'A',
  1: 'W',
  2: 'S',
  3: 'E',
  4: 'D',
  5: 'F',
  6: 'T',
  7: 'G',
  8: 'Y',
  9: 'H',
  10: 'U',
  11: 'J',
  12: 'K',
}

export default function PianoKeyboard({ activeNotes, onNoteOn, onNoteOff }) {
  const heldComputerKeys = useRef(new Set())

  const { whiteKeys, blackKeys, totalWhite } = useMemo(() => {
    const white = []
    const black = []
    for (let m = BASE_NOTE; m < BASE_NOTE + TOTAL_SEMITONES; m++) {
      const semitone = (m - BASE_NOTE) % 12
      const octaveIndex = Math.floor((m - BASE_NOTE) / 12)
      if (WHITE_OFFSETS.includes(semitone)) {
        white.push({ midi: m })
      } else if (BLACK_OFFSETS.includes(semitone)) {
        const leftUnits = octaveIndex * WHITE_PER_OCTAVE + PRECEDING_WHITE_INDEX[semitone] + 0.7
        black.push({ midi: m, leftUnits })
      }
    }
    return { whiteKeys: white, blackKeys: black, totalWhite: white.length }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      const offset = CODE_TO_OFFSET[e.code]
      if (offset === undefined) return
      if (heldComputerKeys.current.has(e.code)) return // ignore OS key-repeat
      heldComputerKeys.current.add(e.code)
      onNoteOn(BASE_NOTE + offset)
    }
    const handleKeyUp = (e) => {
      const offset = CODE_TO_OFFSET[e.code]
      if (offset === undefined) return
      heldComputerKeys.current.delete(e.code)
      onNoteOff(BASE_NOTE + offset)
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [onNoteOn, onNoteOff])

  const whiteWidthPct = 100 / totalWhite
  const blackWidthPct = whiteWidthPct * 0.62

  return (
    <div className="relative w-full select-none" style={{ height: 120 }}>
      <div className="absolute inset-0 flex">
        {whiteKeys.map(({ midi }) => {
          const offset = midi - BASE_NOTE
          const hint = offset <= 12 ? HINT_BY_OFFSET[offset] : undefined
          return (
            <PianoKey
              key={midi}
              isBlack={false}
              hint={hint}
              pressed={activeNotes.has(midi)}
              style={{ width: `${whiteWidthPct}%`, height: '100%' }}
              label={`Play ${NOTE_NAMES[(midi - BASE_NOTE) % 12]}`}
              onPress={() => onNoteOn(midi)}
              onRelease={() => onNoteOff(midi)}
            />
          )
        })}
      </div>
      {blackKeys.map(({ midi, leftUnits }) => {
        const offset = midi - BASE_NOTE
        const hint = offset <= 12 ? HINT_BY_OFFSET[offset] : undefined
        return (
          <PianoKey
            key={midi}
            isBlack
            hint={hint}
            pressed={activeNotes.has(midi)}
            style={{
              left: `${(leftUnits / totalWhite) * 100}%`,
              width: `${blackWidthPct}%`,
              height: '62%',
            }}
            label={`Play ${NOTE_NAMES[(midi - BASE_NOTE) % 12]} sharp`}
            onPress={() => onNoteOn(midi)}
            onRelease={() => onNoteOff(midi)}
          />
        )
      })}
    </div>
  )
}
