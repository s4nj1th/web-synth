import { Mixer } from './Mixer'
import { Voice } from './Voice'
import { createSharedLfo, rateFromValue, WAVEFORMS as LFO_WAVEFORMS } from '../modules/LFO'
import { cloneDefaults } from '../../state/synthDefaults'

const MAX_VOICES = 8

// AudioEngine is the single authority over Web Audio state. UI components
// never touch AudioNodes directly — they call engine methods, which is the
// separation the whole module architecture depends on.
//
// The AudioContext itself is created lazily on the first call that needs
// it (ensureContext), since browsers block audio until a user gesture.
export class AudioEngine {
  constructor() {
    this.ctx = null
    this.mixer = null
    this.lfoOsc = null
    this.powered = false
    this.voices = new Map() // "source:note" -> Voice
    this.params = cloneDefaults()
  }

  ensureContext() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext
      this.ctx = new Ctx()
      this.mixer = new Mixer(this.ctx)
      this.mixer.setMasterVolume(this.params.masterVolume)
      this.lfoOsc = createSharedLfo(this.ctx, this.params.lfo)
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  getVoiceInput() {
    return this.mixer.getVoiceInput()
  }

  getLfoNode() {
    return this.lfoOsc
  }

  setPower(on) {
    this.powered = on
    if (!on) {
      this.releaseAll()
    }
  }

  // --- Voice management -----------------------------------------------

  noteOn(note, source = 'kbd') {
    if (!this.powered) return
    this.ensureContext()
    const id = `${source}:${note}`
    if (this.voices.has(id)) return

    if (this.voices.size >= MAX_VOICES) {
      const oldestId = this.voices.keys().next().value
      const oldest = this.voices.get(oldestId)
      oldest.forceStop()
      this.voices.delete(oldestId)
    }

    const voice = new Voice(this.ctx, this, note, this.params)
    this.voices.set(id, voice)
  }

  noteOff(note, source = 'kbd') {
    if (!this.ctx) return
    const id = `${source}:${note}`
    const voice = this.voices.get(id)
    if (!voice) return
    voice.release(this.params.envelope)
    this.voices.delete(id)
  }

  releaseSource(source) {
    Array.from(this.voices.entries())
      .filter(([id]) => id.startsWith(`${source}:`))
      .forEach(([id, voice]) => {
        voice.release(this.params.envelope)
        this.voices.delete(id)
      })
  }

  releaseAll() {
    Array.from(this.voices.entries()).forEach(([id, voice]) => {
      voice.forceStop()
      this.voices.delete(id)
    })
  }

  // --- Parameter updates -------------------------------------------------
  // `path` is a dotted string like "vco.waveform" or "vcf.cutoff".

  setParameter(path, value) {
    const [group, key] = path.split('.')

    // Top-level scalar parameters (no nested group), e.g. "masterVolume".
    if (key === undefined) {
      this.params[group] = value
      if (group === 'masterVolume' && this.ctx) {
        this.mixer.setMasterVolume(value)
      }
      return
    }

    if (!this.params[group] || typeof this.params[group] !== 'object') return
    this.params[group][key] = value

    if (!this.ctx) return

    if (group === 'vcf' && (key === 'cutoff' || key === 'resonance')) {
      this.voices.forEach((v) => v.updateCutoffResonance(this.params.vcf))
    } else if (group === 'vcf' && (key === 'lfoMod' || key === 'envMod')) {
      this.voices.forEach((v) => v.updateFilterModDepths(this.params.vcf))
    } else if (group === 'vco' && key === 'pitchMod') {
      this.voices.forEach((v) => v.updatePitchModDepth(this.params.vco))
    } else if (group === 'lfo' && key === 'rate') {
      this.lfoOsc.frequency.setTargetAtTime(rateFromValue(value), this.ctx.currentTime, 0.02)
    } else if (group === 'lfo' && key === 'waveform') {
      this.lfoOsc.type = value
    }
  }

  setMasterVolume(value) {
    this.setParameter('masterVolume', value)
  }

  // Applies a full preset/patch object in one go (used by presets + memory recall).
  loadPatch(patch) {
    this.params = {
      ...cloneDefaults(),
      ...patch,
      vco: { ...cloneDefaults().vco, ...patch.vco },
      lfo: { ...cloneDefaults().lfo, ...patch.lfo },
      vcf: { ...cloneDefaults().vcf, ...patch.vcf },
      envelope: { ...cloneDefaults().envelope, ...patch.envelope },
    }
    if (this.ctx) {
      this.mixer.setMasterVolume(this.params.masterVolume)
      this.lfoOsc.type = this.params.lfo.waveform
      this.lfoOsc.frequency.setTargetAtTime(rateFromValue(this.params.lfo.rate), this.ctx.currentTime, 0.02)
    }
  }
}

export { LFO_WAVEFORMS }
