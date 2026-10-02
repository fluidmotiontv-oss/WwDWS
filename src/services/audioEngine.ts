/**
 * Audio Context Manager and Real-Time FFT Analyzer
 * FluidmotionTV West Coast Radio
 */

export interface AudioMetrics {
  bass: number;        // 0.0 - 1.0 (Low frequencies: 20 - 250 Hz)
  mid: number;         // 0.0 - 1.0 (Mid frequencies: 250 - 2500 Hz)
  treble: number;      // 0.0 - 1.0 (High frequencies: 2500 - 12000 Hz)
  overall: number;     // 0.0 - 1.0 (RMS amplitude)
  beatDetected: boolean;
  beatStrength: number;
  beatAccumulator: number;
  frequencyData: Uint8Array;
  timeDomainData: Uint8Array;
}

export type AudioSourceType = 'generative' | 'local_mp3' | 'radio_stream' | 'microphone';

export interface RadioTrack {
  id: string;
  title: string;
  artist: string;
  sourceType: AudioSourceType;
  streamUrl?: string;
  bpm?: number;
  genre?: string;
}

export class WestCoastAudioEngine {
  private static instance: WestCoastAudioEngine | null = null;

  public ctx: AudioContext | null = null;
  public analyser: AnalyserNode | null = null;
  public masterGain: GainNode | null = null;

  private mediaSource: MediaElementAudioSourceNode | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private micStream: MediaStream | null = null;
  private audioElement: HTMLAudioElement | null = null;

  // Generative Synth Node refs
  private isGenerativeRunning = false;
  private generativeTimer: number | null = null;
  private generativeGain: GainNode | null = null;

  // Frequency buffers
  private frequencyData: Uint8Array = new Uint8Array(256);
  private timeDomainData: Uint8Array = new Uint8Array(256);

  // Transient beat detection state
  private energyHistory: number[] = [];
  private beatAccumulator = 0;
  private lastBeatTime = 0;
  private beatDecay = 0;

  // Public state
  public isPlaying = false;
  public currentVolume = 0.85;
  public currentTrack: RadioTrack = {
    id: "fm-synth-01",
    title: "Pacific Coast Sunset Drift",
    artist: "FluidmotionTV Generative Studio",
    sourceType: "generative",
    bpm: 88,
    genre: "West Coast Synthwave / Lo-Fi"
  };

  private listeners: Set<(metrics: AudioMetrics) => void> = new Set();
  private stateListeners: Set<() => void> = new Set();

  public static getInstance(): WestCoastAudioEngine {
    if (!WestCoastAudioEngine.instance) {
      WestCoastAudioEngine.instance = new WestCoastAudioEngine();
    }
    return WestCoastAudioEngine.instance;
  }

  private constructor() {
    // Will lazily init on first user gesture
  }

  public initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.82;
      this.analyser.minDecibels = -90;
      this.analyser.maxDecibels = -10;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
      this.timeDomainData = new Uint8Array(this.analyser.frequencyBinCount);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    return this.ctx;
  }

  public subscribe(cb: (metrics: AudioMetrics) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  public subscribeState(cb: () => void): () => void {
    this.stateListeners.add(cb);
    return () => this.stateListeners.delete(cb);
  }

  private notifyStateChange() {
    this.stateListeners.forEach(cb => cb());
  }

  public setVolume(val: number) {
    this.currentVolume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.currentVolume, this.ctx.currentTime, 0.05);
    }
    if (this.audioElement) {
      this.audioElement.volume = this.currentVolume;
    }
    this.notifyStateChange();
  }

  // --- Real-time FFT Analysis Engine ---
  public getMetrics(): AudioMetrics {
    if (!this.analyser) {
      return {
        bass: 0,
        mid: 0,
        treble: 0,
        overall: 0,
        beatDetected: false,
        beatStrength: 0,
        beatAccumulator: this.beatAccumulator,
        frequencyData: this.frequencyData,
        timeDomainData: this.timeDomainData
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.analyser.getByteFrequencyData(this.frequencyData as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.analyser.getByteTimeDomainData(this.timeDomainData as any);

    const binCount = this.frequencyData.length; // 256
    // Sub-bass & Bass: 0 to 18 bins (~0 to 350 Hz)
    let bassSum = 0;
    const bassBins = Math.min(18, binCount);
    for (let i = 0; i < bassBins; i++) {
      bassSum += this.frequencyData[i];
    }
    const bass = Math.min(1.0, (bassSum / bassBins / 255) * 1.5);

    // Mids: 19 to 90 bins (~350 to 2000 Hz)
    let midSum = 0;
    const midBins = Math.min(90, binCount);
    for (let i = bassBins; i < midBins; i++) {
      midSum += this.frequencyData[i];
    }
    const mid = Math.min(1.0, (midSum / (midBins - bassBins) / 255) * 1.6);

    // Treble: 91 to 240 bins (~2000 to 12000 Hz)
    let trebleSum = 0;
    const trebleBins = Math.min(240, binCount);
    for (let i = midBins; i < trebleBins; i++) {
      trebleSum += this.frequencyData[i];
    }
    const treble = Math.min(1.0, (trebleSum / (trebleBins - midBins) / 255) * 2.2);

    // Overall energy
    let totalSum = 0;
    for (let i = 0; i < binCount; i++) {
      totalSum += this.frequencyData[i];
    }
    const overall = Math.min(1.0, (totalSum / binCount / 255) * 1.4);

    // Dynamic Beat Detection (spectral energy flux in low-end)
    const now = performance.now();
    const currentLowEnergy = bass;
    this.energyHistory.push(currentLowEnergy);
    if (this.energyHistory.length > 40) {
      this.energyHistory.shift();
    }

    const avgEnergy = this.energyHistory.reduce((a, b) => a + b, 0) / (this.energyHistory.length || 1);
    const variance = this.energyHistory.reduce((acc, val) => acc + Math.pow(val - avgEnergy, 2), 0) / (this.energyHistory.length || 1);
    const dynamicMultiplier = (-15 * variance) + 1.35;
    const threshold = Math.max(0.28, avgEnergy * dynamicMultiplier);

    let beatDetected = false;
    let beatStrength = 0;

    if (currentLowEnergy > threshold && (now - this.lastBeatTime) > 280) {
      beatDetected = true;
      beatStrength = Math.min(1.0, (currentLowEnergy - threshold) * 2.8 + 0.3);
      this.lastBeatTime = now;
      this.beatDecay = 1.0;
    } else {
      this.beatDecay = Math.max(0, this.beatDecay - 0.04);
      beatStrength = this.beatDecay;
    }

    // Accumulate phase driven by beat + tempo
    this.beatAccumulator += 0.016 * (1.0 + (beatStrength * 2.5) + (bass * 1.5));

    return {
      bass,
      mid,
      treble,
      overall,
      beatDetected,
      beatStrength,
      beatAccumulator: this.beatAccumulator,
      frequencyData: this.frequencyData,
      timeDomainData: this.timeDomainData
    };
  }

  // --- Source: Built-in West Coast Generative Synthesizer ---
  public startGenerative() {
    this.initContext();
    this.stopAllSources();

    if (!this.ctx || !this.masterGain) return;

    this.isGenerativeRunning = true;
    this.isPlaying = true;
    this.currentTrack = {
      id: "fm-synth-01",
      title: "Pacific Coast Sunset Drift",
      artist: "FluidmotionTV Generative Studio",
      sourceType: "generative",
      bpm: 88,
      genre: "West Coast Synthwave / Lo-Fi"
    };

    this.generativeGain = this.ctx.createGain();
    this.generativeGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
    this.generativeGain.connect(this.masterGain);

    // Chord progression in F# minor / E / D (Iconic West Coast Sunset aesthetic)
    // F#m9, C#m7, Dmaj9, E9sus4
    const chords = [
      [185.00, 220.00, 277.18, 329.63, 415.30], // F#m9 (F#3, A3, C#4, E4, G#4)
      [138.59, 164.81, 207.65, 246.94, 329.63], // C#m7 (C#3, E3, G#3, B3, E4)
      [146.83, 185.00, 220.00, 277.18, 369.99], // Dmaj9 (D3, F#3, A3, C#4, F#4)
      [164.81, 220.00, 246.94, 329.63, 392.00], // E9sus4 (E3, A3, B3, E4, G4)
    ];

    const bassNotes = [92.50, 69.30, 73.42, 82.41]; // F#2, C#2, D2, E2

    let step = 0;
    const playChordStep = () => {
      if (!this.isGenerativeRunning || !this.ctx || !this.generativeGain) return;

      const chord = chords[step % chords.length];
      const bassFreq = bassNotes[step % bassNotes.length];
      const now = this.ctx.currentTime;
      const duration = 3.6;

      // 1. Lush Analog Pad / Rhodes Synth
      chord.forEach((freq, idx) => {
        if (!this.ctx || !this.generativeGain) return;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const noteGain = this.ctx.createGain();

        // Sawtooth blended through warm 24dB low-pass filter
        osc.type = idx % 2 === 0 ? "sawtooth" : "triangle";
        osc.frequency.setValueAtTime(freq + (Math.sin(idx) * 0.4), now);

        // Filter envelope: gentle swell
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(450 + (idx * 150), now);
        filter.frequency.exponentialRampToValueAtTime(1400 + (idx * 200), now + 0.6);
        filter.frequency.exponentialRampToValueAtTime(600, now + duration);
        filter.Q.setValueAtTime(3.0, now);

        // Note gain envelope
        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.linearRampToValueAtTime(0.09 / chord.length, now + 0.4);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.generativeGain);

        osc.start(now);
        osc.stop(now + duration + 0.2);
      });

      // 2. Warm 808 Sub-Bass
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = "sine";
      bassOsc.frequency.setValueAtTime(bassFreq, now);
      bassGain.gain.setValueAtTime(0.001, now);
      bassGain.gain.linearRampToValueAtTime(0.24, now + 0.08);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.85);

      bassOsc.connect(bassGain);
      bassGain.connect(this.generativeGain);
      bassOsc.start(now);
      bassOsc.stop(now + duration);

      // 3. Chill Lo-Fi Drum Kick & Snare accents
      this.playGenerativeBeats(now);

      step++;
      this.generativeTimer = window.setTimeout(playChordStep, duration * 1000 - 150);
    };

    playChordStep();
    this.notifyStateChange();
  }

  private playGenerativeBeats(startTime: number) {
    if (!this.ctx || !this.generativeGain) return;
    const beatInterval = 0.68; // ~88 BPM

    // Sub kick on beat 0 and beat 2.5
    [0, 1.36, 2.04].forEach(offset => {
      if (!this.ctx || !this.generativeGain) return;
      const t = startTime + offset;
      const kickOsc = this.ctx.createOscillator();
      const kickGain = this.ctx.createGain();

      kickOsc.type = "sine";
      kickOsc.frequency.setValueAtTime(140, t);
      kickOsc.frequency.exponentialRampToValueAtTime(42, t + 0.15);

      kickGain.gain.setValueAtTime(0.35, t);
      kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

      kickOsc.connect(kickGain);
      kickGain.connect(this.generativeGain);
      kickOsc.start(t);
      kickOsc.stop(t + 0.25);
    });

    // Snare / Rimshot on beat 2 and 4 (offset ~0.68 and ~2.04)
    [beatInterval, beatInterval * 3].forEach(offset => {
      if (!this.ctx || !this.generativeGain) return;
      const t = startTime + offset;
      // White noise buffer for snare snap
      const bufferSize = this.ctx.sampleRate * 0.15;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.setValueAtTime(1200, t);

      const snareGain = this.ctx.createGain();
      snareGain.gain.setValueAtTime(0.18, t);
      snareGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      noise.connect(filter);
      filter.connect(snareGain);
      snareGain.connect(this.generativeGain);
      noise.start(t);
      noise.stop(t + 0.16);
    });
  }

  // --- Source: Local MP3 & Media Element ---
  public async playLocalTrack(url: string, trackInfo: Partial<RadioTrack>) {
    this.initContext();
    this.stopAllSources();

    if (!this.ctx || !this.masterGain) return;

    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.crossOrigin = "anonymous";
      this.mediaSource = this.ctx.createMediaElementSource(this.audioElement);
      this.mediaSource.connect(this.masterGain);

      this.audioElement.addEventListener('ended', () => {
        this.nextTrack();
      });
      this.audioElement.addEventListener('play', () => {
        this.isPlaying = true;
        this.notifyStateChange();
      });
      this.audioElement.addEventListener('pause', () => {
        this.isPlaying = false;
        this.notifyStateChange();
      });
    }

    this.audioElement.src = url;
    this.audioElement.volume = this.currentVolume;

    try {
      await this.audioElement.play();
      this.isPlaying = true;
      this.currentTrack = {
        id: trackInfo.id || "local-track",
        title: trackInfo.title || "Custom Track",
        artist: trackInfo.artist || "FluidmotionTV",
        sourceType: "local_mp3",
        bpm: trackInfo.bpm || 90,
        genre: trackInfo.genre || "West Coast Sound"
      };
      this.notifyStateChange();
    } catch {
      // In case playback fails (e.g. missing MP3 in folder), gracefully fallback to generative synth!
      this.startGenerative();
    }
  }

  // --- Source: Live Microphone Input ---
  public async startMicrophone(): Promise<boolean> {
    this.initContext();
    this.stopAllSources();

    if (!this.ctx || !this.analyser) return false;

    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.micSource = this.ctx.createMediaStreamSource(this.micStream);
      // Connect to analyser directly (NOT to masterGain/destination to avoid feedback loop squeals!)
      this.micSource.connect(this.analyser);

      this.isPlaying = true;
      this.currentTrack = {
        id: "mic-live",
        title: "Live West Coast Studio Mic",
        artist: "Real-time Studio Feed",
        sourceType: "microphone",
        genre: "Live Input"
      };
      this.notifyStateChange();
      return true;
    } catch {
      // Fallback
      this.startGenerative();
      return false;
    }
  }

  // --- Source: Online Web Radio Streams ---
  public playOnlineRadio(url: string, title: string, artist: string) {
    this.playLocalTrack(url, {
      title,
      artist,
      sourceType: "radio_stream"
    });
  }

  public togglePlayPause() {
    this.initContext();

    if (this.currentTrack.sourceType === 'generative') {
      if (this.isPlaying) {
        this.stopAllSources();
        this.isPlaying = false;
      } else {
        this.startGenerative();
      }
    } else if (this.audioElement) {
      if (this.audioElement.paused) {
        this.audioElement.play();
        this.isPlaying = true;
      } else {
        this.audioElement.pause();
        this.isPlaying = false;
      }
    } else {
      this.startGenerative();
    }
    this.notifyStateChange();
  }

  public nextTrack() {
    // Cycles through curated West Coast moods
    const modes: Array<{ title: string; bpm: number; genre: string }> = [
      { title: "Pacific Coast Sunset Drift", bpm: 88, genre: "West Coast Synthwave" },
      { title: "Santa Monica Twilight Neon", bpm: 96, genre: "Chillwave / Lo-Fi" },
      { title: "Venice Boardwalk Horizon", bpm: 104, genre: "Future Funk / Groove" },
      { title: "Malibu Deep Field Resonance", bpm: 82, genre: "Ambient Cybernetic" }
    ];
    const currentIndex = modes.findIndex(m => m.title === this.currentTrack.title);
    const nextMode = modes[(currentIndex + 1) % modes.length];

    this.startGenerative();
    this.currentTrack.title = nextMode.title;
    this.currentTrack.bpm = nextMode.bpm;
    this.currentTrack.genre = nextMode.genre;
    this.notifyStateChange();
  }

  public prevTrack() {
    this.nextTrack();
  }

  public stopAllSources() {
    // Generative
    this.isGenerativeRunning = false;
    if (this.generativeTimer !== null) {
      clearTimeout(this.generativeTimer);
      this.generativeTimer = null;
    }
    if (this.generativeGain) {
      try {
        this.generativeGain.disconnect();
      } catch {
        // Safe ignore
      }
      this.generativeGain = null;
    }

    // Audio element
    if (this.audioElement) {
      this.audioElement.pause();
    }

    // Mic
    if (this.micStream) {
      this.micStream.getTracks().forEach(track => track.stop());
      this.micStream = null;
    }
    if (this.micSource) {
      try {
        this.micSource.disconnect();
      } catch {
        // Safe ignore
      }
      this.micSource = null;
    }

    this.isPlaying = false;
    this.notifyStateChange();
  }
}
