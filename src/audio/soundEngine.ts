// High-performance Web Audio API Sound Synthesizer for Schedule I

export interface RadioTrack {
  id: number;
  name: string;
  genre: string;
  bpm: number;
  notes: number[];
  bass: number[];
}

export const RADIO_TRACKS: RadioTrack[] = [
  {
    id: 0,
    name: "Hyland Neon 1987",
    genre: "Synthwave FM",
    bpm: 118,
    notes: [220, 261.63, 329.63, 440, 392, 329.63, 261.63, 293.66],
    bass: [110, 110, 87.31, 87.31, 98, 98, 130.81, 110]
  },
  {
    id: 1,
    name: "Motel Strip Midnight",
    genre: "Lo-Fi Chill",
    bpm: 88,
    notes: [293.66, 349.23, 440, 523.25, 493.88, 440, 349.23, 329.63],
    bass: [73.42, 73.42, 87.31, 87.31, 65.41, 65.41, 82.41, 82.41]
  },
  {
    id: 2,
    name: "Docks Cyber Bass",
    genre: "Dark Electro",
    bpm: 128,
    notes: [164.81, 196, 246.94, 329.63, 293.66, 246.94, 196, 185],
    bass: [82.41, 82.41, 98, 82.41, 73.42, 73.42, 65.41, 73.42]
  }
];

class SoundEngine {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  // Engine hum state
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private lastScreechTime: number = 0;

  // Synthwave Radio state
  public radioActive: boolean = false;
  public currentTrackIdx: number = 0;
  private radioInterval: number | null = null;
  private radioStep: number = 0;

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public updateEngineHum(speed: number, isDriving: boolean) {
    if (this.muted || !isDriving) {
      if (this.engineGain && this.ctx) {
        this.engineGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.08);
      }
      return;
    }

    this.init();
    if (!this.ctx) return;

    if (!this.engineOsc || !this.engineGain) {
      try {
        this.engineOsc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        this.engineGain = this.ctx.createGain();

        this.engineOsc.type = 'sawtooth';
        filter.type = 'lowpass';
        filter.frequency.value = 180;

        this.engineOsc.frequency.value = 48;
        this.engineGain.gain.value = 0.001;

        this.engineOsc.connect(filter);
        filter.connect(this.engineGain);
        this.engineGain.connect(this.ctx.destination);
        this.engineOsc.start();
      } catch (e) {
        return;
      }
    }

    const now = this.ctx.currentTime;
    const baseFreq = 46 + Math.abs(speed) * 24;
    const targetGain = Math.min(0.045, 0.012 + Math.abs(speed) * 0.009);
    this.engineOsc.frequency.setTargetAtTime(baseFreq, now, 0.05);
    this.engineGain.gain.setTargetAtTime(targetGain, now, 0.06);
  }

  public playTireScreech() {
    if (this.muted) return;
    const nowMs = performance.now();
    if (nowMs - this.lastScreechTime < 450) return;
    this.lastScreechTime = nowMs;

    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc2.type = 'triangle';
    osc.frequency.setValueAtTime(680, now);
    osc.frequency.linearRampToValueAtTime(520, now + 0.18);
    osc2.frequency.setValueAtTime(715, now);
    osc2.frequency.linearRampToValueAtTime(540, now + 0.18);

    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.2);
    osc2.stop(now + 0.2);
  }

  public playSpray() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // White noise burst for aerosol spray + chime
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + 0.35);
    this.playFanfare();
  }

  public toggleRadio(): boolean {
    this.radioActive = !this.radioActive;
    if (this.radioActive) {
      this.startRadioLoop();
    } else {
      this.stopRadioLoop();
    }
    return this.radioActive;
  }

  public nextRadioTrack(): RadioTrack {
    this.currentTrackIdx = (this.currentTrackIdx + 1) % RADIO_TRACKS.length;
    if (this.radioActive) {
      this.stopRadioLoop();
      this.startRadioLoop();
    }
    return RADIO_TRACKS[this.currentTrackIdx];
  }

  public getCurrentTrack(): RadioTrack {
    return RADIO_TRACKS[this.currentTrackIdx];
  }

  private startRadioLoop() {
    this.stopRadioLoop();
    this.init();
    const track = RADIO_TRACKS[this.currentTrackIdx];
    const stepMs = Math.round((60 / track.bpm / 2) * 1000);

    this.radioInterval = window.setInterval(() => {
      if (this.muted || !this.radioActive || !this.ctx) return;
      const now = this.ctx.currentTime;
      const idx = this.radioStep % track.notes.length;
      this.radioStep++;

      // Lead synth arpeggio
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(track.notes[idx], now);
      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + stepMs / 1000);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + stepMs / 1000);

      // Sub bass on even steps
      if (idx % 2 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(track.bass[idx], now);
        bassGain.gain.setValueAtTime(0.04, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + (stepMs * 1.8) / 1000);
        bassOsc.connect(bassGain);
        bassGain.connect(this.ctx.destination);
        bassOsc.start(now);
        bassOsc.stop(now + (stepMs * 1.8) / 1000);
      }
    }, stepMs);
  }

  private stopRadioLoop() {
    if (this.radioInterval !== null) {
      clearInterval(this.radioInterval);
      this.radioInterval = null;
    }
  }

  public playCash() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const osc3 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc3.type = 'sine';

    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc1.frequency.exponentialRampToValueAtTime(1318.51, now + 0.12); // E6
    osc2.frequency.setValueAtTime(1318.51, now);
    osc2.frequency.exponentialRampToValueAtTime(1760.00, now + 0.12); // A6
    osc3.frequency.setValueAtTime(2093.00, now + 0.05); // C7
    osc3.frequency.exponentialRampToValueAtTime(2637.02, now + 0.18); // E7

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc1.connect(gain);
    osc2.connect(gain);
    osc3.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc3.start(now + 0.05);
    osc1.stop(now + 0.4);
    osc2.stop(now + 0.4);
    osc3.stop(now + 0.4);
  }

  public playPing() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.setValueAtTime(1200, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playBubble() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(250 + Math.random() * 100, now);
    osc.frequency.exponentialRampToValueAtTime(650 + Math.random() * 150, now + 0.09);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playHarvest() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  public playSiren() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.linearRampToValueAtTime(950, now + 0.2);
    osc.frequency.linearRampToValueAtTime(600, now + 0.4);

    gain.gain.setValueAtTime(0.07, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  public playCrash() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playSkid() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.linearRampToValueAtTime(280, now + 0.15);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  public playFanfare() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = now + idx * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.15, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + 0.35);
    });
  }

  public playFootstep() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(95 + Math.random() * 30, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.05);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playDoor() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.15);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(540, now);
    osc2.frequency.exponentialRampToValueAtTime(220, now + 0.12);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.22);
    osc2.stop(now + 0.22);
  }

  public playRadioChirp() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.setValueAtTime(2400, now + 0.04);
    osc.frequency.setValueAtTime(1400, now + 0.08);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  public playMissionTriumph() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880, 1108.73]; // A4, C#5, E5, A5, C#6
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = now + idx * 0.09;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.18, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + 0.45);
    });
  }
}

export const sound = new SoundEngine();
