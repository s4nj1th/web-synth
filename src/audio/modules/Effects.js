// Extension point for future effects (delay, reverb, drive, etc).
// An effect module should export a factory of the shape:
//   createXEffect(ctx, params) -> { input: AudioNode, output: AudioNode, setParameter(name, value) }
// so AudioEngine can splice it into the chain between Mixer.voiceInput and
// Mixer.masterGain without changing Voice.js or the engine's public API.
//
// No effects are wired up yet — this file exists so the pattern is
// established before the first real effect is added.

export function createPassThroughEffect(ctx) {
  const node = ctx.createGain()
  node.gain.value = 1
  return {
    input: node,
    output: node,
    setParameter() {},
  }
}
