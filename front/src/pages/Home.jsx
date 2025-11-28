import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Home.css'

const STATUS_ORDER = { garder: 0, 'à revoir': 1, 'décomm.': 2, 'non défini': 3 }

export function Home() {
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' })
  const [applications, setApplications] = useState([])

  const DEFAULT_STATUS = {
    garder: { className: 'status-keep', label: 'À conserver' },
    'à revoir': { className: 'status-review', label: 'À revoir' },
    'décomm.': { className: 'status-retire', label: 'À décomm.' },
    'non défini': { className: 'status-undefined', label: 'Non défini' },
  }

  const barStyle = (height) => ({
    '--bar-height': height,
  })

  const toggleSort = (key) => {
    setSortConfig((previous) =>
      previous.key === key
        ? { key, direction: previous.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' },
    )
  }

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch('http://localhost:8000/applications')
        const data = await response.json()

        const mapped = data.map((app) => ({
          name: app.nom,
          detail: '',
          trend: 'up',
          status: 'non défini',
        }))

        setApplications(mapped)
      } catch (e) {
        console.error('Erreur en récupérant les applications :', e)
      }
    }

    fetchApplications()
  }, [])

  const sortedApplications = useMemo(
    () =>
      [...applications].sort((a, b) => {
        if (sortConfig.key === 'name') {
          const comparison = a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' })
          return sortConfig.direction === 'asc' ? comparison : -comparison
        }

        const compareOrder =
          STATUS_ORDER[a.status] === STATUS_ORDER[b.status]
            ? a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' })
            : STATUS_ORDER[a.status] - STATUS_ORDER[b.status]

        return sortConfig.direction === 'asc' ? compareOrder : -compareOrder
      }),
    [applications, sortConfig],
  )


  return (
    <div className="home-page">
      <div className="home-content">
        <section className="suggestions-card">
          <div className="suggestions-card__header">
            <h1>Suggestions de l&rsquo;IA</h1>
            <button className="download-button">Télécharger cette analyse</button>
          </div>

          <div className="suggestions-table">
            <div className="suggestions-table__header">
              <button
                className={`column-button ${sortConfig.key === 'name' ? 'is-active' : ''}`}
                onClick={() => toggleSort('name')}
              >
                <span>Applications</span>
                <span
                  className={`sort-icon ${
                    sortConfig.key === 'name' ? `is-${sortConfig.direction}` : ''
                  }`}
                  aria-hidden="true"
                />
              </button>
              <span className="column-label">Détails</span>
              <button
                className={`column-button ${sortConfig.key === 'status' ? 'is-active' : ''}`}
                onClick={() => toggleSort('status')}
              >
                <span>Statut</span>
                <span
                  className={`sort-icon ${
                    sortConfig.key === 'status' ? `is-${sortConfig.direction}` : ''
                  }`}
                  aria-hidden="true"
                />
              </button>
            </div>

            <div className="suggestions-table__body">
              {sortedApplications.map((application, index) => (
                <Link
                  to={`/details/${encodeURIComponent(application.name)}`}
                  className="suggestions-table__row"
                  key={`${application.name}-${application.detail}-${index}`}
                  style={{ color: '#1f2432' }}
                >
                  <div className="cell cell--name">{application.name}</div>
                  <div className="cell cell--detail">
                    <span className={`trend-indicator is-${application.trend}`} aria-hidden="true" />
                    <span>{application.detail}</span>
                  </div>

                  <div className="cell cell--status">
                    <span
                      className={`status-bullet ${DEFAULT_STATUS[application.status].className}`}
                      aria-hidden="true"
                    />
                    <span>{DEFAULT_STATUS[application.status].label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="analysis-card">
          <h1>Analyse</h1>
          <p>
            Sur les 71 applications recensées, 42 sont à conserver, 18 présentent un risque de
            redondance et 11 sont à décommissionner. Les prochaines étapes consistent à prioriser
            la suppression des outils faiblement utilisés dans les secteurs du ticketing et de la
            planification.
          </p>
          <div className="analysis-card__content">
            <div className="analysis-chart">
              <div className="analysis-chart__bars">
                <div className="bar bar--decommission" style={barStyle('62%')}>
                  <span>—</span>
                </div>
                <div className="bar bar--keep" style={barStyle('100%')}>
                  <span>—</span>
                </div>
                <div className="bar bar--review" style={barStyle('74%')}>
                  <span>—</span>
                </div>
              </div>
              <ul className="analysis-chart__legend">
                <li>
                  <span className={`legend-dot ${DEFAULT_STATUS['décomm.'].className}`} aria-hidden="true" />
                  {DEFAULT_STATUS['décomm.'].label}
                </li>
                <li>
                  <span className={`legend-dot ${DEFAULT_STATUS.garder.className}`} aria-hidden="true" />
                  {DEFAULT_STATUS.garder.label}
                </li>
                <li>
                  <span className={`legend-dot ${DEFAULT_STATUS['à revoir'].className}`} aria-hidden="true" />
                  {DEFAULT_STATUS['à revoir'].label}
                </li>
              </ul>
              <div className="forecast-caption">
                <h6>Suggestion de rationalisation des outils</h6>
              </div>
            </div>
            <div className="analysis-forecast">
              <div className="forecast-chart">
                <svg viewBox="0 0 220 120" role="img" aria-label="Evolution du nombre d’applications actives par mois">
                  <line x1="28" y1="108" x2="208" y2="108" className="forecast-axis-line forecast-axis-line--x" />
                  <line x1="28" y1="108" x2="28" y2="18" className="forecast-axis-line forecast-axis-line--y" />
                  <line x1="68" y1="108" x2="68" y2="102" className="forecast-tick forecast-tick--x" />
                  <line x1="118" y1="108" x2="118" y2="102" className="forecast-tick forecast-tick--x" />
                  <line x1="168" y1="108" x2="168" y2="102" className="forecast-tick forecast-tick--x" />
                  <line x1="28" y1="88" x2="34" y2="88" className="forecast-tick forecast-tick--y" />
                  <line x1="28" y1="68" x2="34" y2="68" className="forecast-tick forecast-tick--y" />
                  <line x1="28" y1="48" x2="34" y2="48" className="forecast-tick forecast-tick--y" />
                  <path
                    d="M28,100 C48,86 64,82 84,88 C104,94 118,78 138,74 C158,70 176,78 196,62"
                    className="forecast-line"
                    fill="none"
                  />
                  <line x1="158" x2="158" y1="32" y2="108" className="forecast-marker" />
                  <circle cx="158" cy="62" r="4" className="forecast-point" />
                  <text x="18" y="92" className="forecast-axis-label">20</text>
                  <text x="18" y="72" className="forecast-axis-label">30</text>
                  <text x="18" y="52" className="forecast-axis-label">40</text>
                </svg>
                <div className="forecast-tooltip">
                  <div className="tooltip-title">Date — N actives (placeholder)</div>
                </div>
              </div>
              <div className="forecast-axis">
                <span>mars</span>
                <span>juin</span>
                <span>sept.</span>
              </div>

              <div className="forecast-caption">
                <h6>Évolution du nombre d'applications actives par mois</h6>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}