// Web Audio API を使ったメトロノームエンジン
// コンポーネント外に切り出してスケジューリングを管理する

const NOTES = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
export const BEATS_PER_NOTE = 8;
export const COUNT_IN_BEATS = 4;

// 各音名の周波数（A3=220Hz基準、ギター音域）
const NOTE_FREQUENCIES = {
  'A': 220, 'A#': 233.08, 'B': 246.94,
  'C': 261.63, 'C#': 277.18, 'D': 293.66,
  'D#': 311.13, 'E': 329.63, 'F': 349.23,
  'F#': 369.99, 'G': 392, 'G#': 415.3,
};

export class MetronomeEngine {
  /**
   * @param {{
   *   onBeat: (beatInMeasure: number) => void,
   *   onNoteChange: (note: string) => void,
   *   onNextNote: (note: string | null) => void,
   *   onCountIn: (beat: number) => void,
   * }} callbacks
   */
  constructor({ onBeat, onNoteChange, onNextNote, onCountIn }) {
    this.bpm = 80;
    this.isRunning = false;
    this.beat = 0;
    this.currentNote = '—';
    this.nextNoteVal = '';
    this.lastNote = '';
    this.audioCtx = null;
    this.nextTickTime = 0;
    this.timerID = null;
    this.countInRemaining = 0;

    this.onBeat = onBeat;
    this.onNoteChange = onNoteChange;
    this.onNextNote = onNextNote;
    this.onCountIn = onCountIn || (() => {});
  }

  _getAudioCtx() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.audioCtx;
  }

  _playTick(time, isAccent) {
    const ctx = this._getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = isAccent ? 1200 : 800;
    gain.gain.setValueAtTime(isAccent ? 0.5 : 0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    osc.start(time);
    osc.stop(time + 0.06);
  }

  // ギター風の音を鳴らす（三角波 + 速いアタック + 指数減衰）
  _playNote(time, note) {
    const freq = NOTE_FREQUENCIES[note];
    if (!freq) return;
    const ctx = this._getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.3, time + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 1.5);
    osc.start(time);
    osc.stop(time + 1.6);
  }

  _pickNote(exclude) {
    let n;
    do {
      n = NOTES[Math.floor(Math.random() * NOTES.length)];
    } while (n === exclude);
    return n;
  }

  _schedule() {
    const ctx = this._getAudioCtx();
    const interval = 60 / this.bpm;
    const lookAhead = 0.1;

    while (this.nextTickTime < ctx.currentTime + lookAhead) {
      const delay = Math.max(0, (this.nextTickTime - ctx.currentTime) * 1000);

      if (this.countInRemaining > 0) {
        // カウントイン処理
        const countBeat = COUNT_IN_BEATS - this.countInRemaining; // 0, 1, 2, 3
        this._playTick(this.nextTickTime, countBeat === 0);
        const capturedCountBeat = countBeat;
        setTimeout(() => {
          if (!this.isRunning) return;
          this.onCountIn(capturedCountBeat);
        }, delay);
        this.countInRemaining--;
      } else {
        // 通常再生
        const beatInMeasure = this.beat % BEATS_PER_NOTE;
        const isFirstBeat = beatInMeasure === 0;
        // 7拍目（0始まりで6）に次の音名をプレビュー表示
        const isPreviewBeat = beatInMeasure === 6;

        this._playTick(this.nextTickTime, isFirstBeat);

        const scheduledBeat = beatInMeasure;
        setTimeout(() => {
          if (!this.isRunning) return;
          this.onBeat(scheduledBeat);
        }, delay);

        // 1拍目：音名切り替え＋音を鳴らす
        if (isFirstBeat) {
          const newNote = this.nextNoteVal || this._pickNote(this.lastNote);
          this.currentNote = newNote;
          this.lastNote = newNote;
          this.nextNoteVal = '';
          const capturedNote = newNote;
          this._playNote(this.nextTickTime, capturedNote);
          setTimeout(() => {
            if (!this.isRunning) return;
            this.onNextNote(null);
            this.onNoteChange(capturedNote);
          }, delay);
        }

        // 7拍目：次の音名を事前生成してプレビュー＋音を鳴らす
        if (isPreviewBeat) {
          const upcoming = this._pickNote(this.currentNote);
          this.nextNoteVal = upcoming;
          this.lastNote = upcoming;
          const capturedUpcoming = upcoming;
          this._playNote(this.nextTickTime, capturedUpcoming);
          setTimeout(() => {
            if (!this.isRunning) return;
            this.onNextNote(capturedUpcoming);
          }, delay);
        }

        this.beat++;
      }

      this.nextTickTime += interval;
    }

    this.timerID = setTimeout(() => this._schedule(), 25);
  }

  start() {
    this.isRunning = true;
    this.beat = 0;
    this.nextNoteVal = '';
    this.lastNote = '';
    this.countInRemaining = COUNT_IN_BEATS;

    // カウントイン中から最初の音名を確定してUIに通知
    const firstNote = this._pickNote('');
    this.nextNoteVal = firstNote;
    this.lastNote = firstNote;
    this.currentNote = firstNote;
    this.onNoteChange(firstNote);

    const ctx = this._getAudioCtx();
    this.nextTickTime = ctx.currentTime + 0.1;
    this._schedule();
  }

  stop() {
    this.isRunning = false;
    clearTimeout(this.timerID);
    this.timerID = null;
  }

  setBpm(bpm) {
    this.bpm = Math.min(200, Math.max(40, bpm));
  }

  destroy() {
    this.stop();
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}
