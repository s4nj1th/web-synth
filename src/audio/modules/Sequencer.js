// Simple 8-step sequencer. Plays eighth notes at the given tempo through
// the shared AudioEngine, using a distinct note "source" so sequencer
// notes never fight with keyboard-held notes for the same voice slot.
export class Sequencer {
  constructor(engine, { getSteps, onStepChange }) {
    this.engine = engine
    this.getSteps = getSteps
    this.onStepChange = onStepChange
    this.timer = null
    this.currentStep = 0
    this.bpm = 120
    this.playing = false
  }

  setTempo(bpm) {
    this.bpm = bpm
    if (this.playing) {
      this._restart()
    }
  }

  start() {
    if (this.playing) return
    this.playing = true
    this.currentStep = 0
    this._scheduleLoop()
  }

  stop() {
    this.playing = false
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    this.engine.releaseSource('seq')
    this.onStepChange(-1)
  }

  _restart() {
    if (this.timer) clearInterval(this.timer)
    this._scheduleLoop()
  }

  _scheduleLoop() {
    const stepMs = 60000 / this.bpm / 2 // eighth notes
    this._tick()
    this.timer = setInterval(() => this._tick(), stepMs)
  }

  _tick() {
    const steps = this.getSteps()
    if (!steps || steps.length === 0) return
    const step = steps[this.currentStep]
    if (step && step.active) {
      this.engine.noteOn(step.note, 'seq')
      const gateMs = ((60000 / this.bpm) / 2) * 0.65
      setTimeout(() => this.engine.noteOff(step.note, 'seq'), gateMs)
    }
    this.onStepChange(this.currentStep)
    this.currentStep = (this.currentStep + 1) % steps.length
  }
}
