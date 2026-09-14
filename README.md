<div align="center">
    <img src="public/favicon.svg" width="80" alt="web-synth icon" />
    <h1>Web Synth</h1>
</div>

A vibe-coded browser synthesizer and drum machine, inspired by compact analogue synth hardware.

web-synth is a small web-based instrument suite built to feel like real gear rather than a music production dashboard. It's a modular synthesizer — oscillators, a filter, an envelope, an LFO, and a step sequencer — paired with a standalone drum machine, both running entirely on the Web Audio API with no external audio engine and no samples. Every tone is synthesized live in the browser, from the analogue-style waveforms to the procedurally generated kicks, snares, and cymbals.

Patches and drum patterns can be shared just by copying the URL, since the current sound and pattern are always encoded into it. There's also basic patch memory backed by the browser's local storage.

Built with React, Tailwind CSS, and Vite.

```
npm install
npm run dev
```
