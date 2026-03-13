import { Link } from 'react-router-dom'

const MENU_ITEMS = [
  {
    to: '/fretboard',
    label: 'FRETBOARD TRAINER',
    sub: '指板音名トレーニング',
    ready: true,
  },
  {
    to: '/solfege',
    label: 'SOLFEGE',
    sub: 'ソルフェージュ（準備中）',
    ready: false,
  },
  {
    to: '/rhythm',
    label: 'RHYTHM TRAINER',
    sub: 'リズムトレーニング（準備中）',
    ready: false,
  },
]

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
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

      <div className="relative w-full max-w-sm flex flex-col gap-6">
        <header className="text-center">
          <h1
            className="text-[#e8ff47] text-5xl tracking-[0.15em] leading-none"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            ギター基礎トレくん
          </h1>
          <p className="text-[#555570] text-[0.65rem] tracking-[0.3em] mt-1">
            GUITAR TRAINING SUITE
          </p>
        </header>

        <ul className="flex flex-col gap-3">
          {MENU_ITEMS.map(({ to, label, sub, ready }) =>
            ready ? (
              <li key={to}>
                <Link
                  to={to}
                  className="block bg-[#111118] border border-[#2a2a3a] rounded p-4 hover:border-[#e8ff47] transition-colors group"
                >
                  <span
                    className="block text-[#e8ff47] text-xl tracking-[0.15em] group-hover:text-white transition-colors"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    {label}
                  </span>
                  <span className="block text-[#555570] text-xs tracking-wider mt-0.5">
                    {sub}
                  </span>
                </Link>
              </li>
            ) : (
              <li key={to}>
                <div className="block bg-[#111118] border border-[#2a2a3a] rounded p-4 opacity-40 cursor-not-allowed">
                  <span
                    className="block text-[#e0e0f0] text-xl tracking-[0.15em]"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    {label}
                  </span>
                  <span className="block text-[#555570] text-xs tracking-wider mt-0.5">
                    {sub}
                  </span>
                </div>
              </li>
            )
          )}
        </ul>
      </div>
    </div>
  )
}
