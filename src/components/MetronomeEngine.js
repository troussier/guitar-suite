// Web Audio API を使ったメトロノームエンジン
// コンポーネント外に切り出してスケジューリングを管理する

const NOTES = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
export const BEATS_PER_NOTE = 8;

export class MetronomeEngine {
  /**
   * @param {{
   *   onBeat: (beatInMeasure: number) => void,
   *   onNoteChange: (note: string) => void,
   *   onNextNote: (note: string | null) => void,
   * }} callbacks
   */
  constructor({ onBeat, onNoteChange, onNextNote }) {
    this.bpm = 80;
    this.isRunning = false;
    this.beat = 0;
    this.currentNote = '—';
    this.nextNoteVal = '';
    this.lastNote = '';
    this.audioCtx = null;
    this.nextTickTime = 0;
    this.timerID = null;

    this.onBeat = onBeat;
    this.onNoteChange = onNoteChange;
    this.onNextNote = onNextNote;
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
      const beatInMeasure = this.beat % BEATS_PER_NOTE;
      const isFirstBeat = beatInMeasure === 0;
      // 7拍目（0始まりで6）に次の音名をプレビュー表示
      const isPreviewBeat = beatInMeasure === 6;

      this._playTick(this.nextTickTime, isFirstBeat);

      const scheduledBeat = beatInMeasure;
      const delay = Math.max(0, (this.nextTickTime - ctx.currentTime) * 1000);

      // ビートUI更新
      setTimeout(() => {
        if (!this.isRunning) return;
        this.onBeat(scheduledBeat);
      }, delay);

      // 1拍目：音名切り替え
      if (isFirstBeat) {
        const newNote = this.nextNoteVal || this._pickNote(this.lastNote);
        this.currentNote = newNote;
        this.lastNote = newNote;
        this.nextNoteVal = '';
        const capturedNote = newNote;
        setTimeout(() => {
          if (!this.isRunning) return;
          this.onNextNote(null);
          this.onNoteChange(capturedNote);
        }, delay);
      }

      // 7拍目：次の音名を事前生成してプレビュー
      if (isPreviewBeat) {
        const upcoming = this._pickNote(this.currentNote);
        this.nextNoteVal = upcoming;
        this.lastNote = upcoming;
        const capturedUpcoming = upcoming;
        setTimeout(() => {
          if (!this.isRunning) return;
          this.onNextNote(capturedUpcoming);
        }, delay);
      }

      this.nextTickTime += interval;
      this.beat++;
    }

    this.timerID = setTimeout(() => this._schedule(), 25);
  }

  start() {
    this.isRunning = true;
    this.beat = 0;
    this.nextNoteVal = '';
    this.lastNote = '';
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
