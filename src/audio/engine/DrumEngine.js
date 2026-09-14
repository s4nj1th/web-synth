import { DRUM_VOICES } from '../modules/DrumVoices'

// Separate, self-contained engine for the drum machine page. It doesn't
// share an AudioContext with the synth page's AudioEngine — each page
// creates its own context lazily on first user interaction, and the
// context is torn down when the page unmounts (see DrumProvider).
export class DrumEngine {
  constructor() {
    this.ctx = null
    this.masterGain = null
    this.masterVolume = 0.8
  }

  ensureContext() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext
      this.ctx = new Ctx()
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.value = this.masterVolume
      this.masterGain.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  setMasterVolume(value01) {
    this.masterVolume = value01
    if (this.ctx) {
      this.masterGain.gain.setTargetAtTime(value01, this.ctx.currentTime, 0.01)
    }
  }

  trigger(rowId, time) {
    if (!this.ctx) return
    const voice = DRUM_VOICES[rowId]
    if (!voice) return
    voice(this.ctx, this.masterGain, time)
  }

  // Manual preview trigger (e.g. clicking a row label), independent of
  // sequencer playback and safe to call even before the context exists.
  preview(rowId) {
    this.ensureContext()
    this.trigger(rowId, this.ctx.currentTime)
  }

  dispose() {
    if (this.ctx) {
      try {
        this.ctx.close()
      } catch {
        // already closed
      }
    }
  }
}
