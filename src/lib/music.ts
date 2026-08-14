export type Mood = "focus" | "motivation" | "relax";

type Preset = { root: number; notes: number[]; step: number; wave: OscillatorType; gain: number };

const PRESETS: Record<Mood, Preset> = {
  focus: { root: 196, notes: [0, 3, 7, 10, 12], step: 2.6, wave: "sine", gain: 0.06 },
  motivation: { root: 261.63, notes: [0, 4, 7, 9, 12, 16], step: 1.1, wave: "triangle", gain: 0.05 },
  relax: { root: 146.83, notes: [0, 5, 7, 12, 14], step: 4.2, wave: "sine", gain: 0.07 },
};

const semitone = (root: number, n: number) => root * Math.pow(2, n / 12);

export class AmbientPlayer {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  mood: Mood | null = null;

  async play(mood: Mood, volume = 0.6) {
    this.stop();
    const Ctx = (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
      .AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = this.ctx ?? new Ctx();
    this.ctx = ctx;
    if (ctx.state === "suspended") await ctx.resume().catch(() => {});
    const master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);
    this.master = master;
    this.mood = mood;

    const p = PRESETS[mood];
    // Colchón grave continuo
    const pad = ctx.createOscillator();
    const padGain = ctx.createGain();
    pad.type = "sine";
    pad.frequency.value = p.root / 2;
    padGain.gain.value = p.gain * 0.7;
    pad.connect(padGain).connect(master);
    pad.start();

    const note = () => {
      if (!this.ctx || !this.master) return;
      const now = ctx.currentTime;
      const n = p.notes[Math.floor(Math.random() * p.notes.length)] ?? 0;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = p.wave;
      osc.frequency.value = semitone(p.root, n);
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(p.gain, now + 0.6);
      g.gain.exponentialRampToValueAtTime(0.0001, now + p.step * 1.4);
      osc.connect(g).connect(master);
      osc.start(now);
      osc.stop(now + p.step * 1.5);
    };
    note();
    this.timer = setInterval(note, p.step * 1000);
    this.padStop = () => {
      try {
        pad.stop();
      } catch {
        /* ya detenido */
      }
    };
  }

  private padStop: (() => void) | null = null;

  setVolume(v: number) {
    if (this.master) this.master.gain.value = v;
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.padStop?.();
    this.padStop = null;
    this.master?.disconnect();
    this.master = null;
    this.mood = null;
  }
}
