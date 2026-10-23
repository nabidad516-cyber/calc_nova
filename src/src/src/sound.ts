/**
 * Web Audio API synthesizer for tactile and cosmic calculator clicks
 */

class SoundController {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // Check saved preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('calc_sound_enabled');
      if (saved !== null) {
        this.enabled = saved === 'true';
      }
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('calc_sound_enabled', String(this.enabled));
    }
    if (this.enabled) {
      this.playBeep(440, 0.05, 'sine');
    }
    return this.enabled;
  }

  public playDigitClick() {
    if (!this.enabled) return;
    this.playBeep(480 + Math.random() * 40, 0.03, 'sine', 0.08);
  }

  public playOperatorClick() {
    if (!this.enabled) return;
    this.playBeep(640, 0.04, 'triangle', 0.12);
  }

  public playEquals() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    // Pleasant ascending cosmic chord
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.03);
      gain.gain.setValueAtTime(0.09, now + i * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.03 + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + i * 0.03);
      osc.stop(now + i * 0.03 + 0.15);
    });
  }

  public playClear() {
    if (!this.enabled) return;
    this.playBeep(320, 0.05, 'sawtooth', 0.05);
  }

  public playError() {
    if (!this.enabled) return;
    this.playBeep(180, 0.12, 'sawtooth', 0.15);
  }

  private playBeep(freq: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.08) {
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Ignore audio policy restrictions on untrusted gestures
    }
  }
}

export const soundManager = new SoundController();
