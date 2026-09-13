// Master output stage. Deliberately tiny: a single gain node standing in
// for the mixer bus. Future effects (delay, reverb, etc.) should be
// inserted between voiceInput and masterGain so every voice passes through
// them automatically without touching Voice.js.
export class Mixer {
  constructor(ctx) {
    this.ctx = ctx
    this.voiceInput = ctx.createGain() // where voices sum together
    this.masterGain = ctx.createGain()
    this.masterGain.gain.value = 0.7
    this.voiceInput.connect(this.masterGain)
    this.masterGain.connect(ctx.destination)
  }

  getVoiceInput() {
    return this.voiceInput
  }

  setMasterVolume(value01) {
    const now = this.ctx.currentTime
    this.masterGain.gain.setTargetAtTime(value01, now, 0.01)
  }
}
