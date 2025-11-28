import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import './Navbar.css'

const NAV_ITEMS = [
  {
    label: 'Applications',
    to: '/',
    icon: 'grid',
    end: true,
  },
  {
    label: 'Chat',
    to: '/Chat',
    icon: 'spark',
  },
]

const NAV_FOOTER_ITEM = {
  label: 'Paramètres',
  to: '/Settings',
  icon: 'settings',
}

export function Navbar({ isOpen, onNavigate }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        onNavigate()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onNavigate])

  return (
    <aside
      id="app-navbar"
      className={`app-navbar ${isOpen ? 'is-open' : ''}`}
      aria-label="Navigation principale"
      aria-hidden={!isOpen}
    >
      <div className="app-navbar__content" ref={containerRef}>
        <nav className="app-navbar__menu">
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `app-navbar__link ${isActive ? 'is-active' : ''}`
                  }
                  end={item.end}
                  onClick={onNavigate}
                >
                  <span className={`app-navbar__icon icon-${item.icon}`} aria-hidden="true" />
                  <span className="app-navbar__label">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="app-navbar__menu app-navbar__menu--footer">
          <ul>
            <li>
              <NavLink
                to={NAV_FOOTER_ITEM.to}
                className={({ isActive }) =>
                  `app-navbar__link ${isActive ? 'is-active' : ''}`
                }
                end={NAV_FOOTER_ITEM.end}
                onClick={onNavigate}
              >
                <span
                  className={`app-navbar__icon icon-${NAV_FOOTER_ITEM.icon}`}
                  aria-hidden="true"
                />
                <span className="app-navbar__label">{NAV_FOOTER_ITEM.label}</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  )
}
