import LegalPageShell from '../../components/legal/LegalPageShell'

export default function PrivacyPolicy() {
  return (
    <LegalPageShell eyebrow="Confidentialité" title="Politique de confidentialité" updatedAt="27 juillet 2026">
      <p>
        TCF 41-Day Challenge est une plateforme gratuite et non commerciale. Cette page explique quelles données
        nous collectons, pourquoi, et comment elles sont protégées.
      </p>

      <h2>Ce que nous collectons</h2>
      <ul>
        <li>Ton email et ton nom, pour créer et sécuriser ton compte.</li>
        <li>Tes réponses aux séries CO/CE (scores, temps, difficulté).</li>
        <li>Le texte de tes rédactions EE et leurs corrections générées par IA.</li>
        <li>Tes enregistrements audio EO, transcrits et évalués par IA.</li>
        <li>Ta progression dans le défi (jours complétés, séries, série de jours consécutifs).</li>
      </ul>

      <h2>Comment tes données sont utilisées</h2>
      <p>
        Tes rédactions et enregistrements sont envoyés à des fournisseurs d'IA (Groq et/ou Google Gemini) uniquement
        pour générer ta correction — ils ne sont jamais utilisés à des fins publicitaires, ni vendus à des tiers, ni
        utilisés pour entraîner des modèles sans ton consentement explicite. Tes enregistrements audio sont stockés
        de façon sécurisée et ne sont accessibles qu'à toi et, si nécessaire, à l'équipe technique pour le support.
      </p>

      <h2>Qui peut voir tes données</h2>
      <p>
        Toi seul(e) peux voir tes rédactions, tes scores et tes enregistrements. Les administrateurs de la
        plateforme peuvent voir un résumé de ton activité (scores, dates, jours complétés) à des fins de support et
        de suivi pédagogique, mais pas le contenu détaillé de tes rédactions sans ton accord.
      </p>

      <h2>Suppression de ton compte</h2>
      <p>
        Tu peux supprimer ton compte à tout moment depuis ton profil. Cette action supprime définitivement tes
        données personnelles, tes rédactions, tes enregistrements et ton historique de progression — elle ne peut
        pas être annulée.
      </p>

      <h2>Cookies</h2>
      <p>
        Nous utilisons uniquement des cookies techniques nécessaires à ta connexion (session d'authentification).
        Aucun cookie publicitaire ou de tracking tiers n'est utilisé.
      </p>

      <h2>Nous contacter</h2>
      <p>
        Pour toute question sur tes données ou pour exercer ton droit d'accès, de rectification ou de suppression,
        écris-nous à <a href="mailto:support@tcfchallenge.ca" className="font-medium text-brand-600 hover:underline dark:text-brand-300">support@tcfchallenge.ca</a>.
      </p>
    </LegalPageShell>
  )
}
