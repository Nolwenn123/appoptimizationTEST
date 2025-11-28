import './Settings.css'

const SETTINGS_ITEMS = [
  {
    icon: 'calendar',
    label: "Journal d’évènements",
  },
  {
    icon: 'spark',
    label: 'Régénérer l’analyse actuelle',
    tone: 'danger',
  },
]

export function Settings() {
  return (
    <div className="settings-page">
      <section className="settings-card">
        <h1>Paramètres</h1>
        <ul className="settings-list">
          {SETTINGS_ITEMS.map((item) => (
            <li key={item.label} className={item.tone ? `is-${item.tone}` : ''}>
              <div className={`settings-icon icon-${item.icon}`} aria-hidden="true" />
              <span className="settings-item-title">{item.label}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
