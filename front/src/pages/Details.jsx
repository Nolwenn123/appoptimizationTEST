import { useMemo, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import './Details.css'

const HERO_STATS = [
  { label: 'Fiabilité de l’analyse', value: '92%', tone: 'mint' },
  { label: 'Redondances fonctionnelles', value: '12%', tone: 'rose' },
  { label: 'Taux d’usage interne', value: '76%', tone: 'sky' },
]

const EXPERTISE_PILLS = [
  { label: 'Usage', tone: 'green' },
  { label: 'Finance', tone: 'orange' },
  { label: 'Fonctionnalités', tone: 'green' },
  { label: 'Risques', tone: 'green' },
  { label: 'Redondances', tone: 'red' },
  { label: 'Satisfaction', tone: 'green' },
]

const DATA_ROWS = [
  { label: 'Catégorie', value: 'Ticketing' },
  { label: 'Technologies', value: 'Trello' },
  { label: 'Nombre d’utilisateurs', value: '1 800' },
  { label: 'Groupe', value: 'Non renseigné' },
  { label: 'Contact', value: 'Louis Dupont' },
  { label: 'Statut', value: 'En production' },
  { label: 'SaaS', value: 'Oui' },
  { label: 'Source', value: 'Fichier Beamy, API' },
  { label: 'Date de fin de contrat', value: '12/12/2025' },
]

const METRIC_SECTIONS = [
  {
    title: 'Analyse des usages',
    description: 'Evolution du nombres d’utilisateurs actifs en fonction du temps',
    insight: 'Le taux d’adoption est élevé (78 %) ce qui témoigne d’une utilisation régulière.',
    badgeText: '78% d’utilisateurs actifs',
    badgeTone: 'positive',
    trend: 'up',
    axisLabels: ['mars', 'juin', 'sept.'],
    accent: 'mint',
    chartType: 'line',
  },
  {
    title: 'Analyse économique (coût et rentabilité)',
    description: 'Comparaison du coût de Trello par an VS les autres applications de Ticketing',
    insight: 'Le coût d’usage reste compétitif par rapport aux autres solutions du segment.',
    badgeText: '83€/an par utilisateur',
    badgeTone: 'neutral',
    axisLabels: ['Trello', 'Jira', 'ServiceNow', 'App5', 'App6', 'App4'],
    accent: 'peach',
    chartType: 'bar',
    // coefficients *hauteur* (0 à 1) pour chaque barre
    barHeights: [0.9, 0.75, 1, 0.6, 0.7, 0.5],
  },
  {
    title: 'Analyse des fonctionnalités / Pertinence',
    description: 'Evolution du nombres d’utilisateurs actifs en fonction du temps',
    insight: 'L’adoption reste soutenue grâce à une couverture fonctionnelle complète.',
    badgeText: '78% d’utilisateurs actifs',
    badgeTone: 'neutral',
    axisLabels: ['mars', 'juin', 'sept.'],
    accent: 'violet',
    chartType: 'line',
  },
  {
    title: 'Analyse des risques',
    description: 'Evolution du nombres d’utilisateurs actifs en fonction du temps',
    insight: 'Le taux d’adoption est stable, aucun risque majeur détecté.',
    badgeText: '78% d’utilisateurs actifs',
    badgeTone: 'positive',
    trend: 'up',
    axisLabels: ['mars', 'juin', 'sept.'],
    accent: 'rose',
    chartType: 'line',
  },
  {
    title: 'Analyse de redondance (doublons applicatifs)',
    description: 'Evolution du nombres d’utilisateurs actifs en fonction du temps',
    insight: 'La redondance reste faible malgré quelques doublons identifiés.',
    badgeText: '78% d’utilisateurs actifs',
    badgeTone: 'neutral',
    trend: 'down',
    axisLabels: ['mars', 'juin', 'sept.'],
    accent: 'rose',
    chartType: 'line',
  },
  {
    title: 'Analyse qualitative (satisfaction)',
    description: 'Evolution du nombres d’utilisateurs actifs en fonction du temps',
    insight: 'La satisfaction moyenne reste élevée grâce à l’expérience utilisateur.',
    badgeText: '78% d’utilisateurs actifs',
    badgeTone: 'positive',
    trend: 'up',
    axisLabels: ['mars', 'juin', 'sept.'],
    accent: 'mint',
    chartType: 'line',
  },
  {
    title: 'Analyse prédictive',
    description: 'Evolution du nombres d’utilisateurs actifs en fonction du temps',
    insight: 'Les projections confirment une stabilité d’usage sur les trois prochains mois.',
    badgeText: '78% d’utilisateurs actifs',
    badgeTone: 'neutral',
    axisLabels: ['mars', 'juin', 'sept.'],
    accent: 'sky',
    chartType: 'line',
  },
]

export function Details() {
  const { appId } = useParams()
  const [usageTone, setUsageTone] = useState('orange')

  const decodedName = useMemo(() => {
    if (!appId) return '[nom_app]'
    try {
      return decodeURIComponent(appId)
    } catch (error) {
      return appId
    }
  }, [appId])
  
  useEffect(() => {
    if (!decodedName || decodedName === '[nom_app]') return

    const fetchUsage = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/applications/${encodeURIComponent(decodedName)}/usage-score`,
        )
        const data = await res.json()

        // data.level = "good" | "medium" | "low"
        if (data.level === 'good') setUsageTone('green')
        else if (data.level === 'medium') setUsageTone('orange')
        else setUsageTone('red')
      } catch (e) {
        console.error('Erreur usage-score', e)
        setUsageTone('orange') // fallback
      }
    }

    fetchUsage()
  }, [decodedName])

  // Static placeholder status instead of external theme
  const heroStatus = { className: 'status-bullet--placeholder', label: 'Statut (placeholder)' }

  return (
    <div className="details-page">
      <div className="details-page__halo details-page__halo--one" aria-hidden="true" />
      <div className="details-page__halo details-page__halo--two" aria-hidden="true" />
      <div className="details-layout">
        <header className="details-hero">
          <div className="hero-card">
            <div className="hero-toolbar">
              <Link to="/" className="hero-back">
                ← 
              </Link>
              <button type="button" className="hero-download">Télécharger cette analyse</button>
            </div>
            <div className="hero-heading">
              <h1>Analyse de {decodedName}</h1>
              <div className="hero-status">
                <span
                  className={`status-bullet ${heroStatus.className}`}
                  aria-hidden="true"
                />
                {heroStatus.label}
              </div>
            </div>
            <section className="hero-overview">
              <h2>Analyse Globale</h2>
              <p className="hero-summary">
                L’application {decodedName} présente une adoption [N/A], un coût maîtrisé [N/A] et une
                transversalité sur [N/A] départements. La satisfaction moyenne est [N/A], l’analyse suggère de conserver cette
                application.
              </p>
              <div className="hero-stats">
                {HERO_STATS.map((stat) => (
                  <div key={stat.label} className={`hero-stat hero-stat--${stat.tone}`}>
                    <span className="hero-stat__value">—</span>
                    <span className="hero-stat__label">{stat.label}</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="hero-focus">
              <h2>Points forts / A améliorer</h2>
              <div className="hero-focus__grid">
                {EXPERTISE_PILLS.map((pill) => {
  const tone =
    pill.label === 'Usage'
      ? usageTone // 👈 dynamique
      : pill.tone

  return (
    <div key={pill.label} className={`focus-card focus-card--${tone}`}>
      <span className="focus-card__dot" aria-hidden="true" />
      <span className="focus-card__label">{pill.label}</span>
    </div>
  )
})}
              </div>
            </section>
          </div>

          <aside className="hero-spotlight">
            <article className="spotlight-card data-card">
              <header>
                <h1>Données</h1>
              </header>
              <div className="data-grid">
                {DATA_ROWS.map((row) => (
                  <div key={row.label} className="data-grid__row">
                    <span className="data-grid__label">{row.label}</span>
                    <span className="data-grid__value">—</span>
                  </div>
                ))}
              </div>
            </article>
          </aside>
        </header>

        <section className="details-main">
          <div className="metrics-grid">
            {METRIC_SECTIONS.map((metric) => {
              const [badgeValue, ...badgeLabelParts] = metric.badgeText.split(' ')
              const badgeLabel = badgeLabelParts.join(' ').trim()

              return (
                <article key={metric.title} className={`metrics-card accent-${metric.accent}`}>
                  <header>
                    <div className="metrics-title">
                      <h3>{metric.title}</h3>
                      {metric.trend ? <span className={`trend-icon is-${metric.trend}`} aria-hidden="true" /> : null}
                    </div>
                    <p className="metrics-description">{metric.description}</p>
                  </header>
                  <div className="metrics-body">
                    <div className={`metrics-stat metrics-stat--${metric.accent}`}>
                      <span className="metrics-stat__value">
                        {badgeLabel ? badgeValue : metric.badgeText}
                      </span>
                      {badgeLabel ? <span className="metrics-stat__label">{badgeLabel}</span> : null}
                    </div>

                    {/* ----- VISUEL DU GRAPH ----- */}
                    <div className={`metrics-visual metrics-visual--${metric.accent}`} aria-hidden="true">
                      {metric.chartType === 'bar' ? (
  <>
    <div className="sparkline sparkline-bar">
      <div className="bar-chart__grid">
        {metric.axisLabels.map((label, index) => {
          const factor =
            Array.isArray(metric.barHeights) && metric.barHeights[index] != null
              ? metric.barHeights[index]
              : 0.6

          return (
            <div key={label} className="bar-chart__bar-wrapper">
              <div
                className="bar-chart__bar"
                style={{ height: `${factor * 100}%` }}
              />
            </div>
          )
        })}
      </div>
    </div>
    <div className="sparkline-axis">
      {metric.axisLabels.map((label) => (
        <span key={label}>{label}</span>
      ))}
    </div>
  </>
) : (
  <>
    <div className={`sparkline sparkline-${metric.accent}`}>
      <span className="sparkline__baseline" />
      <span className="sparkline__curve" />
    </div>
    <div className="sparkline-axis">
      {metric.axisLabels.map((label) => (
        <span key={label}>{label}</span>
      ))}
    </div>
  </>
)}

                    </div>
                  </div>
                  <p className="metrics-insight">{metric.insight}</p>
                </article>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
