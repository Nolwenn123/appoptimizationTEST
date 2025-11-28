import { Link } from 'react-router-dom'
import './404.css'

export function NotFound() {
  return (
    <div className="notfound-page">
      <h1>404 — Page non trouvée</h1>
      <p>La page demandée est introuvable.</p>
      <p>
        <Link to="/">Retour à l'accueil</Link>
      </p>
    </div>
  )
}

export default NotFound
