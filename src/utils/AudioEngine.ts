export const AudioEngine = {
  ctx: null as AudioContext | null,
  gain: null as GainNode | null,
  filter: null as BiquadFilterNode | null,
  playing: false,

  init() {
    if (this.ctx) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AC();
    this.gain = this.ctx.createGain();
    this.gain.connect(this.ctx.destination);
    this.gain.gain.value = 0;
    this.setupWind();
  },

  resume() {
    if (!this.ctx) this.init();
    if (this.ctx?.state === "suspended") this.ctx.resume();
    this.toggle(true);
  },

  setupWind() {
    if (!this.ctx || !this.gain) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(
      1,
      bufferSize,
      this.ctx.sampleRate
    );
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.value = 400;
    noise.connect(this.filter);
    this.filter.connect(this.gain);
    noise.start();
  },

  toggle(forceState?: boolean) {
    if (forceState !== undefined) this.playing = forceState;
    else this.playing = !this.playing;

    if (!this.ctx || !this.gain) return;

    const now = this.ctx.currentTime;
    this.gain.gain.setTargetAtTime(
      this.playing ? 0.2 : 0,
      now,
      1.5
    );
    
    // Dispatch event for UI update
    window.dispatchEvent(new CustomEvent('audio-toggle', { detail: this.playing }));
  },

  update(velocity: number) {
    if (!this.playing || !this.filter || !this.ctx) return;
    const freq = 300 + Math.min(velocity * 1000, 1000);
    this.filter.frequency.setTargetAtTime(
      freq,
      this.ctx.currentTime,
      0.1
    );
  },
};
