import { useState, useEffect, useRef, useCallback } from 'react'
import { MetronomeEngine, BEATS_PER_NOTE, COUNT_IN_BEATS } from '../components/MetronomeEngine'

export default function FretboardTrainer() {
  const [bpm, setBpm] = useState(80)
  const [isRunning, setIsRunning] = useState(false)
  const [isCountIn, setIsCountIn] = useState(false)
  const [countInBeat, setCountInBeat] = useState(-1)
  const [currentNote, setCurrentNote] = useState('—')
  const [nextNote, setNextNote] = useState(null)
  const [currentBeat, setCurrentBeat] = useState(null)

  const engineRef = useRef(null)
  const progressBarRef = useRef(null)
  // カウントイン中かどうかを ref で管理（コールバック内で参照するため）
  const isCountInRef = useRef(false)
  const barDuration = (BEATS_PER_NOTE * 60) / bpm

  const resetProgressBar = useCallback(() => {
    const bar = progressBarRef.current
    if (!bar) return
    bar.style.transition = 'none'
    bar.classList.remove('counting')
    void bar.offsetWidth
    bar.style.transition = `transform ${barDuration}s linear`
    requestAnimationFrame(() => {
      bar.classList.add('counting')
    })
  }, [barDuration])

  const callbacksRef = useRef({})
  callbacksRef.current = {
    onBeat: (beat) => {
      // 最初の onBeat でカウントイン終了
      isCountInRef.current = false
      setIsCountIn(false)
      setCurrentBeat(beat)
    },
    onNoteChange: (note) => {
      setCurrentNote(note)
      // カウントイン中はプログレスバーを動かさない
      if (!isCountInRef.current) {
        resetProgressBar()
      }
    },
    onNextNote: (note) => setNextNote(note),
    onCountIn: (beat) => {
      setCountInBeat(beat)
    },
  }

  useEffect(() => {
    const engine = new MetronomeEngine({
      onBeat: (beat) => callbacksRef.current.onBeat(beat),
      onNoteChange: (note) => callbacksRef.current.onNoteChange(note),
      onNextNote: (note) => callbacksRef.current.onNextNote(note),
      onCountIn: (beat) => callbacksRef.current.onCountIn(beat),
    })
    engineRef.current = engine
    return () => engine.destroy()
  }, [])

  const handleToggle = () => {
    const engine = engineRef.current
    if (!engine) return

    if (isRunning) {
      engine.stop()
      isCountInRef.current = false
      setIsRunning(false)
      setIsCountIn(false)
      setCountInBeat(-1)
      setCurrentNote('—')
      setNextNote(null)
      setCurrentBeat(null)
      const bar = progressBarRef.current
      if (bar) {
        bar.style.transition = 'none'
        bar.classList.remove('counting')
      }
    } else {
      isCountInRef.current = true
      engine.setBpm(bpm)
      engine.start()
      setIsRunning(true)
      setIsCountIn(true)
      setCountInBeat(-1)
    }
  }

  const handleBpmChange = (newBpm) => {
    const clamped = Math.min(200, Math.max(40, newBpm))
    setBpm(clamped)
    if (isRunning && engineRef.current) {
      engineRef.current.stop()
      isCountInRef.current = true
      setCurrentNote('—')
      setNextNote(null)
      setCurrentBeat(null)
      setIsCountIn(true)
      setCountInBeat(-1)
      engineRef.current.setBpm(clamped)
      engineRef.current.start()
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* グリッド背景 */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(232,255,71,0.015) 60px, rgba(232,255,71,0.015) 61px),
            repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(232,255,71,0.015) 60px, rgba(232,255,71,0.015) 61px)
          `,
        }}
      />

      <div className="relative w-full max-w-[480px] flex flex-col gap-5">
        {/* ヘッダー */}
        <header className="text-center">
          <h1
            className="text-[#e8ff47] leading-none tracking-[0.15em]"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(2rem, 8vw, 3.2rem)',
            }}
          >
            Fretboard Trainer
          </h1>
          <p className="text-[#555570] text-[0.7rem] tracking-[0.3em] mt-1">
            指板音名トレーニング
          </p>
        </header>

        {/* 音名表示エリア */}
        <div className="bg-[#111118] border border-[#2a2a3a] rounded px-5 py-10 text-center relative overflow-hidden">
          {/* プログレスバー（カウントイン中は非表示） */}
          {!isCountIn && (
            <div
              ref={progressBarRef}
              className="progress-bar-anim absolute top-0 left-0 right-0 h-0.5 bg-[#e8ff47]"
            />
          )}

          {/* 現在の音名 */}
          <span
            className="block leading-none"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(7rem, 30vw, 11rem)',
              color: isCountIn ? '#b8cc2f' : '#e8ff47',
              textShadow: isCountIn
                ? '0 0 60px rgba(232,255,71,0.1)'
                : '0 0 60px rgba(232,255,71,0.3)',
              transition: 'color 0.2s, text-shadow 0.2s',
            }}
          >
            {currentNote}
          </span>

          {/* 次の音名プレビュー（カウントイン中は非表示） */}
          <div className="flex items-center justify-center gap-2.5 mt-3.5 min-h-9">
            {!isCountIn && (
              <>
                <span
                  className="text-[0.6rem] tracking-[0.25em] transition-opacity duration-200"
                  style={{ color: '#555570', opacity: nextNote ? 1 : 0 }}
                >
                  NEXT
                </span>
                <span
                  className="transition-all duration-200"
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: '1.8rem',
                    letterSpacing: '0.05em',
                    color: nextNote ? '#ff9f43' : '#555570',
                    textShadow: nextNote ? '0 0 20px rgba(255,159,67,0.4)' : 'none',
                    transform: nextNote ? 'scale(1)' : 'scale(0.9)',
                  }}
                >
                  {nextNote ?? ''}
                </span>
              </>
            )}
          </div>

          {/* ビートカウンター / カウントインドット */}
          {isCountIn ? (
            <>
              <div
                className="text-[0.75rem] tracking-[0.2em] mt-2"
                style={{ color: '#ff9f43' }}
              >
                COUNT IN
              </div>
              <div className="flex justify-center gap-2 mt-3">
                {Array.from({ length: COUNT_IN_BEATS }, (_, i) => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full transition-all duration-50"
                    style={{
                      background: countInBeat === i ? '#ff9f43' : '#2a2a3a',
                      transform: countInBeat === i ? 'scale(1.4)' : 'scale(1)',
                      boxShadow: countInBeat === i ? '0 0 8px #ff9f43' : 'none',
                    }}
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="text-[#555570] text-[0.75rem] tracking-[0.2em] mt-2">
                BEAT {currentBeat !== null ? currentBeat + 1 : 0} / {BEATS_PER_NOTE}
              </div>
              <div className="flex justify-center gap-2 mt-3">
                {Array.from({ length: BEATS_PER_NOTE }, (_, i) => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full transition-all duration-50"
                    style={{
                      background: currentBeat === i ? '#e8ff47' : '#2a2a3a',
                      transform: currentBeat === i ? 'scale(1.4)' : 'scale(1)',
                      boxShadow: currentBeat === i ? '0 0 8px #e8ff47' : 'none',
                      border: i === 0 ? '1px solid #555570' : 'none',
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* BPMコントロール */}
        <div className="bg-[#111118] border border-[#2a2a3a] rounded px-5 py-4">
          <div className="text-[#555570] text-[0.65rem] tracking-[0.3em] mb-3">TEMPO</div>
          <div className="flex items-center gap-3">
            <span
              className="text-[#e0e0f0] min-w-[80px]"
              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.8rem' }}
            >
              {bpm}
            </span>
            <input
              type="range"
              min="40"
              max="200"
              value={bpm}
              onChange={(e) => handleBpmChange(parseInt(e.target.value))}
              className="flex-1 cursor-pointer"
              style={{
                WebkitAppearance: 'none',
                height: '3px',
                background: `linear-gradient(to right, #e8ff47 ${((bpm - 40) / 160) * 100}%, #2a2a3a ${((bpm - 40) / 160) * 100}%)`,
                borderRadius: '2px',
                outline: 'none',
              }}
            />
            <div className="flex gap-1.5">
              <button
                onClick={() => handleBpmChange(bpm - 5)}
                className="w-8 h-8 bg-[#2a2a3a] rounded text-[#e0e0f0] text-lg hover:bg-[#3a3a4a] active:bg-[#e8ff47] active:text-black transition-colors cursor-pointer"
                style={{ fontFamily: "'Share Tech Mono', monospace" }}
              >
                −
              </button>
              <button
                onClick={() => handleBpmChange(bpm + 5)}
                className="w-8 h-8 bg-[#2a2a3a] rounded text-[#e0e0f0] text-lg hover:bg-[#3a3a4a] active:bg-[#e8ff47] active:text-black transition-colors cursor-pointer"
                style={{ fontFamily: "'Share Tech Mono', monospace" }}
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* スタート/ストップボタン */}
        <button
          onClick={handleToggle}
          className="w-full py-4 rounded text-xl tracking-[0.2em] font-bold transition-all duration-150 active:scale-[0.98] cursor-pointer"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '1.5rem',
            background: isRunning ? '#ff4757' : '#e8ff47',
            color: isRunning ? '#fff' : '#000',
          }}
        >
          {isRunning ? 'STOP' : 'START'}
        </button>

        {/* 使い方 */}
        <div className="bg-[#111118] border border-[#2a2a3a] rounded px-4 py-3.5 text-[0.68rem] text-[#555570] leading-loose tracking-wide">
          <span className="text-[#e8ff47]">使い方</span>
          <br />
          メトロノームに合わせて
          <br />
          <span className="text-[#e8ff47]">6弦 → 1弦</span> の順に表示された音名を弾く
          <br />
          <span className="text-[#e8ff47]">8拍</span>ごとに音名がランダムに切り替わる
        </div>
      </div>
    </div>
  )
}
