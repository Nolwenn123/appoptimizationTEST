import { useMemo, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import './Details.css'

const HERO_STATS = [
  { key: 'reliability', label: 'Fiabilité de l’analyse', tone: 'mint' },
  { key: 'redundancy', label: 'Redondances fonctionnelles', tone: 'rose' },
  { key: 'usage', label: 'Taux d’usage interne', tone: 'sky' },
]

const FOCUS_CRITERIA = [
  { key: 'usage', label: 'Usage' },
  { key: 'finance', label: 'Finance' },
  { key: 'features', label: 'Fonctionnalités' },
  { key: 'risks', label: 'Risques' },
  { key: 'redundancy', label: 'Redondances' },
  { key: 'satisfaction', label: 'Satisfaction' },
]

const DATA_FIELDS = [
  { key: 'categorie', label: 'Catégorie' },
  { key: 'technologies', label: 'Technologies' },
  { key: 'nombre_utilisateurs', label: 'Nombre d’utilisateurs' },
  { key: 'groupe', label: 'Groupe' },
  { key: 'contact', label: 'Contact' },
  { key: 'statut', label: 'Statut' },
  { key: 'saas', label: 'SaaS' },
  { key: 'source', label: 'Source' },
  { key: 'date_fin_contrat', label: 'Date de fin de contrat' },
]

const METRIC_SECTIONS = [
  {
    title: 'Analyse des usages',
    description: 'Evolution du nombres d’utilisateurs actifs en fonction du temps',
    insight: 'Le taux d’adoption est calculé sur la base des utilisateurs actifs sur 90j.',
    badgeKey: 'activePercent',
    badgeTone: 'positive',
    trend: null,
    axisLabels: ['mars', 'juin', 'sept.'],
    accent: 'mint',
    chartType: 'line',
  },
  {
    title: 'Analyse économique (coût et rentabilité)',
    description: 'Comparaison du coût par utilisateur avec les autres applications du segment.',
    insight: 'Le coût unitaire est comparé aux autres solutions du segment.',
    badgeKey: 'unitPrice',
    badgeTone: 'neutral',
    axisLabels: ['App A', 'App B', 'App C', 'App D', 'App E', 'App F'],
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
  const DEFAULT_TONE = 'undefined'
  const [criteriaTones, setCriteriaTones] = useState(() =>
    FOCUS_CRITERIA.reduce((acc, criterion) => ({ ...acc, [criterion.key]: DEFAULT_TONE }), {}),
  )
  const [reliability, setReliability] = useState('—')
  const [dataDetails, setDataDetails] = useState({
    categorie: 'Non renseigné',
    technologies: [],
    nombre_utilisateurs: null,
    utilisateurs_actifs_90j: null,
    groupe: 'Non renseigné',
    contact: 'Non renseigné',
    statut: 'Non renseigné',
    saas: 'Non renseigné',
    source: 'Non renseigné',
    date_fin_contrat: null,
    prix_licence_unitaire: null,
  })
  const [applicationCosts, setApplicationCosts] = useState([])

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

    const levelToTone = { good: 'green', medium: 'orange', low: 'red' }
    const fetchUsage = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/applications/${encodeURIComponent(decodedName)}/usage-score`,
        )
        const data = await res.json()

        // data.level = "good" | "medium" | "low"
        const tone = levelToTone[data.level] ?? DEFAULT_TONE
        setCriteriaTones((previous) => ({ ...previous, usage: tone }))
      } catch (e) {
        console.error('Erreur usage-score', e)
        setCriteriaTones((previous) => ({ ...previous, usage: DEFAULT_TONE }))
      }
    }

    fetchUsage()
  }, [decodedName])

  useEffect(() => {
    if (!decodedName || decodedName === '[nom_app]') return

    const formatSaas = (value) => {
      if (value === true) return 'Oui'
      if (value === false) return 'Non'
      return 'Non renseigné'
    }

    const formatDate = (value) => {
      if (!value) return 'Non renseigné'
      const parsed = new Date(value)
      return Number.isNaN(parsed.getTime())
        ? 'Non renseigné'
        : parsed.toLocaleDateString('fr-FR')
    }

    const fetchDetails = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/applications/${encodeURIComponent(decodedName)}/details`,
        )
        const data = await res.json()

        setDataDetails({
          categorie: data.categorie ?? 'Non renseigné',
          technologies: Array.isArray(data.technologies) ? data.technologies : [],
          nombre_utilisateurs:
            typeof data.nombre_utilisateurs === 'number' ? data.nombre_utilisateurs : null,
          utilisateurs_actifs_90j:
            typeof data.utilisateurs_actifs_90j === 'number' ? data.utilisateurs_actifs_90j : null,
          groupe: data.groupe ?? 'Non renseigné',
          contact: data.contact ?? 'Non renseigné',
          statut: data.statut ?? 'Non renseigné',
          saas: formatSaas(data.saas),
          source: data.source ?? 'Non renseigné',
          date_fin_contrat: formatDate(data.date_fin_contrat),
          prix_licence_unitaire:
            typeof data.prix_licence_unitaire === 'number' ? data.prix_licence_unitaire : null,
        })

        if (typeof data.reliability === 'number') {
          setReliability(`${Math.round(data.reliability)}%`)
        } else {
          setReliability('—')
        }
      } catch (error) {
        console.error('Erreur application details', error)
      }
    }

    fetchDetails()
  }, [decodedName])

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch('http://localhost:8000/applications/costs')
        const data = await res.json()
        const costs = Array.isArray(data) ? data : []
        setApplicationCosts(costs)
      } catch (error) {
        console.error('Erreur chargement applications', error)
      }
    }

    fetchApplications()
  }, [])

  // Static placeholder status instead of external theme
  const heroStatus = { className: 'status-bullet--placeholder', label: 'Statut (placeholder)' }

  const getDataValue = (key) => {
    const value = dataDetails[key]

    if (key === 'technologies') {
      return Array.isArray(value) && value.length ? value.join(', ') : 'Non renseigné'
    }

    if (key === 'nombre_utilisateurs') {
      return typeof value === 'number' ? value.toLocaleString('fr-FR') : 'Non renseigné'
    }

    if (key === 'utilisateurs_actifs_90j') {
      return typeof value === 'number' ? value.toLocaleString('fr-FR') : 'Non renseigné'
    }

    if (key === 'prix_licence_unitaire') {
      return typeof value === 'number' ? `${value.toLocaleString('fr-FR')} €` : 'Non renseigné'
    }

    return value ?? 'Non renseigné'
  }

  const computeActivePercent = () => {
    const { utilisateurs_actifs_90j: actifs, nombre_utilisateurs: total } = dataDetails
    if (typeof actifs === 'number' && typeof total === 'number' && total > 0) {
      return Math.round((actifs / total) * 100)
    }
    return null
  }

  const formatCurrency = (value) => {
    if (typeof value !== 'number') return '—'
    return `${value.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`
  }

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
                    <span className="hero-stat__value">
                      {stat.key === 'reliability'
                        ? reliability
                        : stat.key === 'usage'
                          ? (() => {
                              const percent = computeActivePercent()
                              return percent != null ? `${percent}%` : '—'
                            })()
                          : '—'}
                    </span>
                    <span className="hero-stat__label">{stat.label}</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="hero-focus">
              <h2>Points forts / A améliorer</h2>
              <div className="hero-focus__grid">
                {FOCUS_CRITERIA.map((criterion) => {
                  const tone = criteriaTones[criterion.key] ?? DEFAULT_TONE
                  const isUndefined = tone === DEFAULT_TONE

                  return (
                    <div key={criterion.key} className={`focus-card focus-card--${tone}`}>
                      <span
                        className={`focus-card__dot ${isUndefined ? 'status-undefined' : ''}`}
                        aria-hidden="true"
                      />
                      <span className="focus-card__label">{criterion.label}</span>
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
                {DATA_FIELDS.map((row) => (
                  <div key={row.key} className="data-grid__row">
                    <span className="data-grid__label">{row.label}</span>
                    <span className="data-grid__value">{getDataValue(row.key)}</span>
                  </div>
                ))}
              </div>
            </article>
          </aside>
        </header>

        <section className="details-main">
          <div className="metrics-grid">
            {METRIC_SECTIONS.map((metric) => {
              const rawBadgeText = metric.badgeText ?? ''
              const [badgeValue, ...badgeLabelParts] = rawBadgeText.split(' ')
              const badgeLabel = badgeLabelParts.join(' ').trim()
              const axisLabels =
                metric.chartType === 'bar' && metric.badgeKey === 'unitPrice'
                  ? (applicationCosts.length ? applicationCosts.map((app) => app.nom) : metric.axisLabels)
                  : metric.axisLabels
              const costValues = applicationCosts.map((app) =>
                typeof app.prix_licence_unitaire === 'number' ? app.prix_licence_unitaire : 0,
              )
              const maxCost = costValues.length ? Math.max(...costValues) : null
              const yAxisMax = maxCost ? Math.ceil(maxCost / 50) * 50 : 50
              const heights =
                metric.chartType === 'bar'
                  ? (() => {
                      if (metric.badgeKey !== 'unitPrice' || applicationCosts.length === 0) {
                        return axisLabels.map((_, index) =>
                          Array.isArray(metric.barHeights) && metric.barHeights[index] != null
                            ? metric.barHeights[index]
                            : 0.6,
                        )
                      }
                      const max = Math.max(...costValues, 1)
                      return costValues.map((value) => Math.min(1, value / max))
                    })()
                  : []
              const activePercent = metric.badgeKey === 'activePercent' ? computeActivePercent() : null
              const unitPrice = metric.badgeKey === 'unitPrice' ? dataDetails.prix_licence_unitaire : null

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
                        {metric.badgeKey === 'activePercent'
                          ? activePercent != null
                            ? `${activePercent}%`
                            : '—'
                          : metric.badgeKey === 'unitPrice'
                            ? typeof unitPrice === 'number'
                              ? `${unitPrice.toLocaleString('fr-FR')} €`
                              : '—'
                            : badgeLabel
                              ? badgeValue
                              : metric.badgeText}
                      </span>
                      {metric.badgeKey === 'activePercent' ? (
                        <span className="metrics-stat__label">Utilisateurs actifs / 90j</span>
                      ) : metric.badgeKey === 'unitPrice' ? (
                        <span className="metrics-stat__label">Prix licence unitaire</span>
                      ) : badgeLabel ? (
                        <span className="metrics-stat__label">{badgeLabel}</span>
                      ) : null}
                    </div>

                    {/* ----- VISUEL DU GRAPH ----- */}
                    <div className={`metrics-visual metrics-visual--${metric.accent}`} aria-hidden="true">
                      {metric.chartType === 'bar' ? (
  <>
    <div className="sparkline sparkline-bar sparkline-bar--muted">
      <div className="bar-chart__grid">
        {axisLabels.map((label, index) => {
          const factor = heights[index] ?? 0.6
          const value =
            metric.badgeKey === 'unitPrice' && applicationCosts[index]
              ? applicationCosts[index].prix_licence_unitaire
              : null
          return (
            <div key={label} className="bar-chart__bar-wrapper">
              <div
                className="bar-chart__bar bar-chart__bar--muted"
                style={{ height: `${factor * 100}%` }}
              />
              <span className="bar-chart__label">{label}</span>
              {metric.badgeKey === 'unitPrice' ? (
                <span className="bar-chart__value">{value != null ? `${value.toLocaleString('fr-FR')} €` : '—'}</span>
              ) : null}
            </div>
          )
        })}
      </div>
      <div className="bar-chart__y-axis">
        <span>{metric.badgeKey === 'unitPrice' ? formatCurrency(yAxisMax) : '50€'}</span>
        <span>0€</span>
      </div>
    </div>
  </>
) : (
  <>
    <div className={`sparkline sparkline-${metric.accent} ${metric.title === 'Analyse des usages' ? 'sparkline--disabled' : ''}`}>
      <span className="sparkline__baseline" />
      <span className="sparkline__curve" />
    </div>
    <div className="sparkline-axis">
      {axisLabels.map((label) => (
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
