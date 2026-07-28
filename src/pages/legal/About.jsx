import LegalPageShell from '../../components/legal/LegalPageShell'

export default function About() {
  return (
    <LegalPageShell eyebrow="À propos" title="Pourquoi TCF 41-Day Challenge existe">
      <p>
        TCF 41-Day Challenge est né d'un constat simple : se préparer sérieusement au TCF Canada coûte souvent cher —
        cours particuliers, plateformes payantes, corrections d'examinateurs facturées à la rédaction. Beaucoup de
        candidats, notamment ceux qui préparent un projet d'immigration avec un budget serré, n'y ont pas accès.
      </p>

      <p>
        Cette plateforme est <strong>gratuite, et le restera</strong>. Pas d'abonnement, pas de version "premium",
        pas de publicité. L'objectif est simple : donner à chaque candidat un parcours structuré de 41 jours, avec
        de vraies séries d'entraînement CO/CE, des mises en situation EE/EO corrigées par IA, et un suivi de
        progression sérieux — le tout gratuitement.
      </p>

      <h2>Comment ça fonctionne</h2>
      <p>
        Le défi de 41 jours combine quatre compétences évaluées à l'examen officiel : Compréhension Orale,
        Compréhension Écrite, Expression Écrite et Expression Orale. Chaque jour, tu avances dans un parcours
        structuré, et tes rédactions et enregistrements sont corrigés par des modèles d'intelligence artificielle
        selon le barème officiel CECRL, avec un niveau de rigueur volontairement élevé pour refléter les attentes
        réelles de l'examen.
      </p>

      <h2>Pourquoi l'IA</h2>
      <p>
        Faire corriger chaque rédaction et chaque enregistrement par un examinateur humain serait impossible à
        offrir gratuitement à grande échelle. L'IA permet une correction quasi instantanée, disponible à toute
        heure, avec un niveau de détail (grammaire, vocabulaire, structure, prononciation) qu'un retour humain payant
        offre rarement pour ce prix — zéro.
      </p>

      <h2>Ce que ce n'est pas</h2>
      <p>
        Cette plateforme n'est pas affiliée à France Éducation International ni à un organisme officiel du TCF
        Canada. Les scores générés sont des estimations pédagogiques, pas des résultats officiels.
      </p>

      <h2>Une question, une suggestion ?</h2>
      <p>
        Écris-nous à{' '}
        <a href="mailto:support@tcfchallenge.ca" className="font-medium text-brand-600 hover:underline dark:text-brand-300">
          support@tcfchallenge.ca
        </a>{' '}
        — la plateforme évolue avec les retours de ceux qui l'utilisent.
      </p>
    </LegalPageShell>
  )
}
