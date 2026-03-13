import { Outlet, NavLink } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="min-h-svh flex flex-col" style={{ background: '#0a0a0f', color: '#e0e0f0' }}>
      <header className="border-b border-[#2a2a3a] px-4 py-3 flex items-center gap-6">
        <NavLink
          to="/"
          className="font-display text-[#e8ff47] text-xl tracking-widest hover:opacity-80 transition-opacity"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          ギター基礎トレくん
        </NavLink>
        <nav className="flex gap-4 text-xs tracking-widest">
          <NavLink
            to="/fretboard"
            className={({ isActive }) =>
              isActive
                ? 'text-[#e8ff47]'
                : 'text-[#555570] hover:text-[#e0e0f0] transition-colors'
            }
          >
            FRETBOARD
          </NavLink>
        </nav>
      </header>

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  )
}
