import LegalPageShell from '../../components/legal/LegalPageShell'

export default function TermsOfService() {
  return (
    <LegalPageShell eyebrow="Conditions" title="Conditions d'utilisation" updatedAt="27 juillet 2026">
      <h2>1. Un service gratuit et indépendant</h2>
      <p>
        TCF 41-Day Challenge est un service gratuit, sans abonnement ni publicité. Il n'est pas affilié à France
        Éducation International ni à aucun organisme officiel administrant le TCF Canada. Il s'agit d'un outil
        d'entraînement indépendant.
      </p>

      <h2>2. Nature des corrections IA</h2>
      <p>
        Les scores, niveaux CECRL et corrections fournis sur cette plateforme sont générés par des modèles
        d'intelligence artificielle (Groq et/ou Google Gemini) à titre indicatif et pédagogique. Ils constituent une
        estimation destinée à t'aider à progresser, mais ne remplacent en aucun cas une évaluation officielle et ne
        garantissent pas ton résultat au véritable examen TCF Canada.
      </p>

      <h2>3. Ton compte</h2>
      <p>
        Tu es responsable de la confidentialité de tes identifiants. Un compte peut être suspendu en cas d'usage
        abusif (spam, tentative de contournement des quotas d'évaluation, comportement nuisant aux autres
        utilisateurs).
      </p>

      <h2>4. Contenu que tu soumets</h2>
      <p>
        Les rédactions et enregistrements que tu soumets restent ta propriété. En les soumettant, tu nous autorises
        uniquement à les transmettre à nos fournisseurs d'IA pour générer ta correction, et à les stocker pour te
        permettre d'y accéder à nouveau.
      </p>

      <h2>5. Disponibilité du service</h2>
      <p>
        Le service repose en partie sur des quotas gratuits de fournisseurs d'IA tiers. En cas de forte demande, une
        correction peut être temporairement retardée ; tu es notifié dès qu'elle est disponible. Nous faisons de
        notre mieux pour maintenir un service fiable, sans garantie de disponibilité continue.
      </p>

      <h2>6. Modifications</h2>
      <p>
        Ces conditions peuvent évoluer. Les changements importants seront annoncés sur la plateforme.
      </p>

      <h2>7. Contact</h2>
      <p>
        Des questions ? Écris-nous à{' '}
        <a href="mailto:support@tcfchallenge.ca" className="font-medium text-brand-600 hover:underline dark:text-brand-300">
          support@tcfchallenge.ca
        </a>.
      </p>
    </LegalPageShell>
  )
}
