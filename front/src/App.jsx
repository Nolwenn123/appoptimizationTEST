import './App.css'
import { Route, Routes, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Home } from './pages/Home'
import { Chat } from './pages/Chat'
import { Settings } from './pages/Settings'
import { Navbar } from './tools/Navbar'
import { Details } from './pages/Details'

export const STATUS_THEME = {
  garder: { className: 'status-keep', label: 'À conserver' },
  'à revoir': { className: 'status-review', label: 'À revoir' },
  'décomm.': { className: 'status-retire', label: 'À décommissionner' },
}

function App() {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false)
  const location = useLocation()
  const showLastUpdated =
    location.pathname === '/' || location.pathname.startsWith('/details')

  const toggleNavbar = () => {
    setIsNavbarOpen((previous) => !previous)
  }

  const closeNavbar = () => {
    setIsNavbarOpen(false)
  }

  return (
    <div className={`app-shell ${isNavbarOpen ? 'has-overlay' : ''}`}>
      <button
        type="button"
        className={`menu-toggle ${isNavbarOpen ? 'is-active' : ''}`}
        onClick={toggleNavbar}
        aria-label={`${isNavbarOpen ? 'Fermer' : 'Ouvrir'} le menu`}
        aria-expanded={isNavbarOpen}
        aria-controls="app-navbar"
      >
        <span />
        <span />
        <span />
      </button>
      <Navbar isOpen={isNavbarOpen} onNavigate={closeNavbar} />
      {showLastUpdated ? (
        <div className="last-updated" aria-live="polite">
          {'Mis à jour il y a 1\u00a0h'}
        </div>
      ) : null}
      <div className="nav-overlay" aria-hidden="true" />
      <main className="app-main" role="main">
        <Routes>
          <Route path="/" element={<Home statusTheme={STATUS_THEME} />} />
          <Route path="chat" element={<Chat />} />
          <Route path="settings" element={<Settings />} />
          <Route path="details/:appId" element={<Details statusTheme={STATUS_THEME} />} />
        </Routes>
      </main>
    </div>
  )
}

export default App;
