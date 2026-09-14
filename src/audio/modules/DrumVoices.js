// Every drum sound here is synthesized on the fly with oscillators and
// filtered noise, matching the project's "no external audio libraries or
// samples" constraint. Each function schedules its own short-lived nodes
// and cleans them up after they finish ringing out.

function noiseBuffer(ctx, duration) {
  const length = Math.max(1, Math.floor(ctx.sampleRate * duration))
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
  return buffer
}

function scheduleCleanup(nodes, time) {
  setTimeout(() => {
    nodes.forEach((node) => {
      try {
        node.disconnect()
      } catch {
        // already disconnected
      }
    })
  }, time * 1000 + 60)
}

// Sine oscillator with a fast downward pitch sweep — the basis for kick
// drums and toms, just at different starting/ending frequencies.
function pitchedThump(ctx, out, time, { startFreq, endFreq, duration, gain = 1 }) {
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(startFreq, time)
  osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), time + duration * 0.9)

  const amp = ctx.createGain()
  amp.gain.setValueAtTime(gain, time)
  amp.gain.exponentialRampToValueAtTime(0.001, time + duration)

  osc.connect(amp)
  amp.connect(out)
  osc.start(time)
  osc.stop(time + duration + 0.02)
  scheduleCleanup([osc, amp], duration + 0.05)
}

export function playKick(ctx, out, time) {
  pitchedThump(ctx, out, time, { startFreq: 150, endFreq: 42, duration: 0.28, gain: 1 })
  // A very short click at the very start of the transient for attack definition.
  const click = ctx.createBufferSource()
  click.buffer = noiseBuffer(ctx, 0.01)
  const clickFilter = ctx.createBiquadFilter()
  clickFilter.type = 'highpass'
  clickFilter.frequency.value = 2000
  const clickGain = ctx.createGain()
  clickGain.gain.setValueAtTime(0.4, time)
  clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.02)
  click.connect(clickFilter)
  clickFilter.connect(clickGain)
  clickGain.connect(out)
  click.start(time)
  scheduleCleanup([click, clickFilter, clickGain], 0.05)
}

export function playTom(ctx, out, time) {
  pitchedThump(ctx, out, time, { startFreq: 190, endFreq: 110, duration: 0.24, gain: 0.85 })
}

export function playFloorTom(ctx, out, time) {
  pitchedThump(ctx, out, time, { startFreq: 120, endFreq: 65, duration: 0.3, gain: 0.85 })
}

export function playSnare(ctx, out, time) {
  // Tonal body
  const osc = ctx.createOscillator()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(190, time)
  const oscGain = ctx.createGain()
  oscGain.gain.setValueAtTime(0.5, time)
  oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12)
  osc.connect(oscGain)
  oscGain.connect(out)
  osc.start(time)
  osc.stop(time + 0.14)

  // Noise snap
  const noise = ctx.createBufferSource()
  noise.buffer = noiseBuffer(ctx, 0.2)
  const noiseFilter = ctx.createBiquadFilter()
  noiseFilter.type = 'highpass'
  noiseFilter.frequency.value = 1500
  const noiseGain = ctx.createGain()
  noiseGain.gain.setValueAtTime(0.7, time)
  noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.16)
  noise.connect(noiseFilter)
  noiseFilter.connect(noiseGain)
  noiseGain.connect(out)
  noise.start(time)

  scheduleCleanup([osc, oscGain, noise, noiseFilter, noiseGain], 0.25)
}

// Metallic hi-hat/ride/cymbal timbre: six square oscillators at
// inharmonic ratios summed together, passed through a highpass filter —
// a common trick for approximating cymbal-family sounds without samples.
const METAL_RATIOS = [1, 1.48, 2.11, 2.54, 3.14, 3.85]
const METAL_FUNDAMENTAL = 205

function metallicHit(ctx, out, time, { duration, highpassHz, gain = 0.5 }) {
  const bandpass = ctx.createBiquadFilter()
  bandpass.type = 'highpass'
  bandpass.frequency.value = highpassHz

  const amp = ctx.createGain()
  amp.gain.setValueAtTime(gain, time)
  amp.gain.exponentialRampToValueAtTime(0.001, time + duration)

  const oscillators = METAL_RATIOS.map((ratio) => {
    const osc = ctx.createOscillator()
    osc.type = 'square'
    osc.frequency.value = METAL_FUNDAMENTAL * ratio
    osc.connect(bandpass)
    osc.start(time)
    osc.stop(time + duration + 0.02)
    return osc
  })

  bandpass.connect(amp)
  amp.connect(out)
  scheduleCleanup([...oscillators, bandpass, amp], duration + 0.05)
}

export function playHihatClosed(ctx, out, time) {
  metallicHit(ctx, out, time, { duration: 0.09, highpassHz: 7000, gain: 0.35 })
}

export function playHihatFoot(ctx, out, time) {
  metallicHit(ctx, out, time, { duration: 0.045, highpassHz: 7500, gain: 0.22 })
}

export function playRide(ctx, out, time) {
  metallicHit(ctx, out, time, { duration: 0.7, highpassHz: 4500, gain: 0.28 })
}

export const DRUM_VOICES = {
  hihatFoot: playHihatFoot,
  tomTom: playTom,
  floorTom: playFloorTom,
  ride: playRide,
  hihat: playHihatClosed,
  snare: playSnare,
  kick: playKick,
}
