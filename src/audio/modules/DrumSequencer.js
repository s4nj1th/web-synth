// Drives the drum machine's 16-step grid at the given BPM (16th notes,
// 4 steps per beat — matches the "1 2 3 4" quarter-note groupings in the
// step grid). Mirrors the synth's Sequencer.js in shape, kept separate
// since drum steps are one-shots across multiple rows rather than a
// single held note per step.
export class DrumSequencer {
  constructor(engine, { getRows, onStepChange }) {
    this.engine = engine
    this.getRows = getRows
    this.onStepChange = onStepChange
    this.timer = null
    this.currentStep = 0
    this.bpm = 90
    this.playing = false
  }

  setTempo(bpm) {
    this.bpm = bpm
    if (this.playing) this._restart()
  }

  start() {
    if (this.playing) return
    this.playing = true
    this.currentStep = 0
    this.engine.ensureContext()
    this._loop()
  }

  stop() {
    this.playing = false
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    this.onStepChange(-1)
  }

  _restart() {
    if (this.timer) clearInterval(this.timer)
    this._loop()
  }

  _loop() {
    const stepMs = 60000 / this.bpm / 4 // sixteenth notes
    this._tick()
    this.timer = setInterval(() => this._tick(), stepMs)
  }

  _tick() {
    const rows = this.getRows()
    if (!rows || rows.length === 0) return
    const now = this.engine.ctx ? this.engine.ctx.currentTime : 0
    rows.forEach((row) => {
      if (row.steps[this.currentStep]) {
        this.engine.trigger(row.id, now)
      }
    })
    this.onStepChange(this.currentStep)
    this.currentStep = (this.currentStep + 1) % 16
  }
}
