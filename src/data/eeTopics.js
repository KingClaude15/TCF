// Original TCF Canada-style Expression Écrite prompts, written from scratch
// (not copied from any third-party prep site). Word-count ranges follow the
// official France Éducation International task specifications:
//   Tâche 1 — message descriptif/explicatif : 60–120 mots
//   Tâche 2 — article de blog / compte rendu : 120–150 mots
//   Tâche 3 — texte argumentatif à partir de 2 documents : 120–180 mots
const TASK_SPECS = {
  1: { minWords: 60, maxWords: 120, label: 'Tâche 1 — Message' },
  2: { minWords: 120, maxWords: 150, label: 'Tâche 2 — Article / compte rendu' },
  3: { minWords: 120, maxWords: 180, label: 'Tâche 3 — Texte argumentatif' },
}

const TACHE_1_PROMPTS = [
  "Vous venez d'emménager dans un nouveau quartier. Écrivez un message à un(e) ami(e) pour décrire votre logement et votre nouveau quartier (pièces, environs, transports).",
  "Un(e) collègue francophone rejoint votre équipe la semaine prochaine. Écrivez-lui un message pour vous présenter et lui expliquer comment se déroule une journée type au bureau.",
  "Vous avez adopté un animal de compagnie récemment. Écrivez un message à un(e) ami(e) pour lui présenter votre nouveau compagnon et raconter les premiers jours ensemble.",
  "Votre ami(e) cherche une salle de sport dans votre ville. Écrivez-lui un message pour lui recommander celle que vous fréquentez, en donnant des détails utiles (tarifs, horaires, équipements).",
  "Vous organisez une sortie en groupe ce week-end. Écrivez un message à vos amis pour leur proposer le programme (lieu, heure, activités prévues).",
  "Un ami francophone va visiter votre ville pour la première fois. Écrivez-lui un message pour lui suggérer un itinéraire de découverte sur une journée.",
  "Vous avez trouvé un covoiturage pour un long trajet. Écrivez un message au conducteur/à la conductrice pour confirmer les détails du trajet et poser vos questions.",
  "Votre appartement a un problème (chauffage, plomberie, etc.). Écrivez un message à votre propriétaire pour décrire le problème et demander une intervention rapide.",
  "Vous venez de terminer une formation professionnelle. Écrivez un message à un(e) ami(e) pour lui raconter ce que vous avez appris et si vous recommanderiez cette formation.",
  "Vous organisez le repas d'anniversaire d'un(e) collègue. Écrivez un message à l'équipe pour donner les informations pratiques (lieu, date, participation financière).",
  "Vous cherchez un(e) colocataire pour votre appartement. Rédigez un message décrivant le logement et le profil de colocataire que vous recherchez.",
  "Un ami vous a prêté un livre qui vous a beaucoup plu. Écrivez-lui un message pour le remercier et lui donner votre avis sur le livre.",
  "Vous venez de réserver des vacances. Écrivez un message à votre famille pour annoncer la destination et le programme prévu.",
  "Votre voisin fait trop de bruit le soir. Écrivez-lui un message poli pour aborder le sujet et proposer une solution.",
]

const TACHE_2_PROMPTS = [
  "Vous avez suivi un cours en ligne pour apprendre une nouvelle compétence. Rédigez un article de blog racontant cette expérience : ce que vous avez appris, les difficultés rencontrées et ce que vous en retenez.",
  "Vous avez participé à une action bénévole dans votre communauté (nettoyage, collecte, aide aux personnes âgées, etc.). Rédigez un article de blog pour partager cette expérience et encourager vos lecteurs à s'impliquer.",
  "Vous avez changé une habitude importante de votre quotidien (alimentation, sport, mode de transport). Rédigez un article de blog expliquant pourquoi et comment vous avez opéré ce changement.",
  "Vous avez déménagé dans une nouvelle ville récemment. Rédigez un article de blog racontant votre installation et vos premières impressions.",
  "Vous avez assisté à un événement culturel marquant (concert, exposition, festival). Rédigez un article de blog pour en parler et donner votre avis.",
  "Vous avez commencé un nouveau travail il y a un mois. Rédigez un article de blog pour raconter cette transition professionnelle et ce que vous en avez appris jusqu'à présent.",
  "Vous avez voyagé seul(e) pour la première fois. Rédigez un article de blog sur cette expérience : préparatifs, moments forts, conseils pour d'autres voyageurs solo.",
  "Vous avez appris une langue étrangère par vous-même, sans cours formel. Rédigez un article de blog décrivant votre méthode et vos progrès.",
  "Vous avez testé le télétravail pendant plusieurs mois. Rédigez un article de blog présentant les avantages et les inconvénients que vous avez constatés.",
  "Vous avez participé à une compétition sportive amateur. Rédigez un article de blog racontant votre préparation et le déroulement de l'événement.",
  "Vous avez suivi un régime alimentaire particulier pendant un certain temps. Rédigez un article de blog pour partager votre expérience et vos résultats.",
  "Vous avez accueilli un membre de votre famille venu s'installer chez vous temporairement. Rédigez un article de blog sur cette cohabitation.",
  "Vous avez utilisé une application pour mieux gérer votre temps ou vos finances. Rédigez un article de blog pour recommander (ou déconseiller) cet outil.",
]

const TACHE_3_PROMPTS = [
  {
    theme: 'Le télétravail généralisé',
    doc1: "De plus en plus d'entreprises adoptent le télétravail à temps plein. Les salariés gagnent du temps de trajet et peuvent mieux organiser leur journée. Plusieurs études montrent une hausse de la productivité et une baisse du stress lié aux transports.",
    doc2: "Le télétravail généralisé isole les employés et fragilise l'esprit d'équipe. Les échanges informels, souvent à l'origine des meilleures idées, disparaissent. Certains managers constatent aussi une difficulté croissante à évaluer l'engagement réel de leurs équipes.",
  },
  {
    theme: "L'intelligence artificielle dans l'éducation",
    doc1: "Les outils d'intelligence artificielle permettent d'adapter l'enseignement au rythme de chaque élève. Ils offrent une correction immédiate et libèrent du temps aux enseignants pour un accompagnement plus personnalisé.",
    doc2: "L'usage massif de l'IA à l'école risque d'affaiblir l'esprit critique des élèves, qui s'habituent à obtenir des réponses toutes faites. De plus, la fracture numérique entre familles favorisées et défavorisées pourrait s'aggraver.",
  },
  {
    theme: 'Les compléments alimentaires',
    doc1: "Bien utilisés, les compléments alimentaires permettent de pallier certaines carences, notamment chez les personnes ayant un régime restrictif. Ils sont pratiques et facilement accessibles en pharmacie ou en supermarché.",
    doc2: "De nombreux compléments alimentaires n'ont pas d'effet démontré scientifiquement et peuvent même présenter des risques en cas de surdosage. Les spécialistes recommandent de privilégier une alimentation équilibrée plutôt que ces produits.",
  },
  {
    theme: 'La semaine de quatre jours',
    doc1: "Plusieurs entreprises ayant testé la semaine de quatre jours rapportent une hausse de la motivation et une baisse de l'absentéisme. Les salariés apprécient ce temps supplémentaire pour leur vie personnelle.",
    doc2: "Réduire la semaine à quatre jours peut créer une surcharge de travail sur les jours restants et compliquer l'organisation dans les secteurs qui nécessitent une présence continue, comme la santé ou le commerce.",
  },
  {
    theme: 'Les logements meublés de courte durée (type Airbnb)',
    doc1: "La location de courte durée permet à des propriétaires de rentabiliser un bien et offre aux voyageurs plus de flexibilité et de convivialité qu'un hôtel classique.",
    doc2: "Dans certains centres-villes, la multiplication des locations de courte durée fait grimper les loyers et réduit l'offre de logements disponibles pour les habitants permanents.",
  },
  {
    theme: "L'apprentissage d'un instrument de musique à l'âge adulte",
    doc1: "Apprendre un instrument à l'âge adulte stimule la mémoire et la concentration. C'est aussi un excellent moyen de gérer le stress et de rencontrer d'autres passionnés lors de cours collectifs.",
    doc2: "Beaucoup d'adultes abandonnent rapidement faute de temps pour pratiquer régulièrement. Sans la discipline imposée dès l'enfance, la progression est plus lente, ce qui peut décourager les débutants.",
  },
  {
    theme: 'Les compétitions de jeux vidéo (e-sport)',
    doc1: "L'e-sport est devenu une discipline reconnue qui développe la réactivité, la stratégie et le travail d'équipe. Il attire aujourd'hui des millions de spectateurs et génère une véritable économie.",
    doc2: "La pratique intensive de l'e-sport peut entraîner une sédentarité excessive et des troubles du sommeil chez les jeunes joueurs, sans garantie de débouchés professionnels stables.",
  },
  {
    theme: 'La suppression progressive de la monnaie en espèces',
    doc1: "Les paiements numériques sont plus rapides, plus sûrs contre le vol, et facilitent le suivi des dépenses personnelles. De nombreux commerces s'orientent déjà vers le tout-numérique.",
    doc2: "Supprimer l'argent liquide pénalise les personnes âgées ou peu familières avec la technologie, et pose des questions sur la protection de la vie privée liée au traçage des transactions.",
  },
]

function buildTopics() {
  const topics = []
  let n = 1

  TACHE_1_PROMPTS.forEach((prompt) => {
    topics.push({
      number: n++,
      taskType: 1,
      taskLabel: TASK_SPECS[1].label,
      minWords: TASK_SPECS[1].minWords,
      maxWords: TASK_SPECS[1].maxWords,
      prompt,
    })
  })

  TACHE_2_PROMPTS.forEach((prompt) => {
    topics.push({
      number: n++,
      taskType: 2,
      taskLabel: TASK_SPECS[2].label,
      minWords: TASK_SPECS[2].minWords,
      maxWords: TASK_SPECS[2].maxWords,
      prompt,
    })
  })

  TACHE_3_PROMPTS.forEach(({ theme, doc1, doc2 }) => {
    topics.push({
      number: n++,
      taskType: 3,
      taskLabel: TASK_SPECS[3].label,
      minWords: TASK_SPECS[3].minWords,
      maxWords: TASK_SPECS[3].maxWords,
      prompt:
        `${theme} : pour ou contre ?\n\n` +
        `Partie 1 : présentez les deux opinions avec vos propres mots (40 à 60 mots).\n` +
        `Partie 2 : donnez votre position sur le thème général (80 à 120 mots).\n\n` +
        `Document 1 :\n${doc1}\n\nDocument 2 :\n${doc2}`,
    })
  })

  return topics
}

export const EE_TOPICS = buildTopics()
export const TCF_TASK_SPECS = TASK_SPECS

export function getTopicByNumber(n) {
  return EE_TOPICS.find((t) => t.number === Number(n))
}
