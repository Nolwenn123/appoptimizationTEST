import './Chat.css'

const SUGGESTIONS = [
  'Que se passerait-il si on fusionnait l’application Jira avec Trello ?',
  'Est-ce que le faible nombre d’utilisateurs de Trello suffit à justifier une suppression ?',
  'L’IA peut-elle suggérer un plan de transition pour remplacer cet outil ?',
]

export function Chat() {
  return (
    <div className="chat-page">
      <section className="chat-hero">
        <h1>Posez une question à l&rsquo;IA</h1>
        <ul className="chat-suggestions" aria-label="Exemples de questions">
          {SUGGESTIONS.map((suggestion) => (
            <li key={suggestion}>
              <em>&ldquo;{suggestion}&rdquo;</em>
            </li>
          ))}
        </ul>
      </section>

      <div className="chat-input">
        <input type="text" placeholder="Posez votre question" aria-label="Posez votre question" />
        <button type="button" aria-label="Envoyer la question" disabled>
          <span className="icon-plane" aria-hidden="true" />
        </button>
      </div>

      <p className="chat-notice">
        Pensez à télécharger le contenu de vos discussions. Une fois la page rechargée, le contenu sera perdu.
      </p>
    </div>
  )
}
