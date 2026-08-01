/**
 * readingRecommendations.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Curated reading and textbook recommendations shown after every EE correction.
 *
 * Two catalogues:
 *
 *  1. TCF_GUIDES   — TCF-Canada-specific preparation guides and methodology
 *                    resources. Recommended based on the user's current
 *                    CECRL band so they always get something actionable.
 *
 *  2. FRENCH_TEXTBOOKS — General French-language progression textbooks
 *                        (B1→C2 journey). Recommended based on band so the
 *                        user knows exactly which book level to buy next.
 *
 * Each resource has:
 *   id          — unique slug
 *   title       — full title
 *   author      — author / publisher
 *   type        — 'guide' | 'textbook' | 'website' | 'video'
 *   format      — 'PDF' | 'Print' | 'Online' | 'Print+PDF' | 'App'
 *   level       — CECRL levels this resource targets (array)
 *   bands       — which score bands trigger a recommendation (array of
 *                 CECRL strings — a user at this band gets this resource)
 *   url         — where to buy/access it
 *   price       — display string (null = free)
 *   description — one paragraph pitch in French
 *   highlights  — 3 bullet-point strengths
 *   badge       — short pill label ('Bestseller', 'Gratuit', 'Officiel'…)
 *   coverEmoji  — emoji representing the book/resource (no image deps)
 */

// ─── TCF / EE-specific guides ─────────────────────────────────────────────────
export const TCF_GUIDES = [
  {
    id: 'maitrisez-ee-tcfca',
    title: 'Maîtrisez l\'Expression Écrite du TCF Canada',
    author: 'Experts tcfca.com',
    type: 'guide',
    format: 'PDF',
    level: ['B1', 'B2', 'C1', 'C2'],
    bands: ['B1', 'B2', 'C1', 'C2', 'A2'],
    url: 'https://www.tcfca.com/tcf-canada-sujets/expression-ecrite/',
    price: 'Payant',
    description:
      'Le guide de référence pour l\'EE du TCF Canada, conçu par des examinateurs officiels. Plus de 100 modèles de réponses pour les 3 tâches, une méthodologie éprouvée pour structurer tes idées et des techniques de correcteurs pour maximiser ton score. Accès PDF instantané après achat.',
    highlights: [
      '+100 modèles de réponses basés sur de vrais sujets d\'examen',
      'Méthodologie d\'examinateurs pour structurer tes textes',
      'Couvre les 3 tâches : Message, Récit, Analyse argumentative',
    ],
    badge: 'Bestseller',
    coverEmoji: '📘',
  },
  {
    id: 'maitriser-tcf-idees',
    title: 'Maîtriser le TCF Canada — Idées pour l\'EE et l\'EO Tâche 3',
    author: 'Examinateur TCF Canada (tcfca.com)',
    type: 'guide',
    format: 'PDF',
    level: ['B2', 'C1', 'C2'],
    bands: ['B2', 'C1', 'C2'],
    url: 'https://www.tcfca.com/tcf-canada-sujets/l/maitriser-le-tcf-canada-des-idees-pour-lexpression-ecrite-et-orale-tache-3/',
    price: 'Payant',
    description:
      'Créé par un examinateur TCF, ce livre unique fournit des centaines d\'idées, d\'arguments et d\'exemples concrets pour la Tâche 3 — la plus redoutée. Des centaines d\'apprenants ont obtenu C1 et C2 grâce à ce guide. Idéal si tu bloques sur l\'argumentation.',
    highlights: [
      'Focus exclusif sur la Tâche 3 (argumentation)',
      'Centaines d\'arguments et idées classées par thèmes',
      'Aide à construire des textes C1/C2 sans blocage',
    ],
    badge: 'Tâche 3',
    coverEmoji: '🧠',
  },
  {
    id: 'tcfenligne-pratique',
    title: 'TCF en Ligne — Entraînement EE avec exemples C1/C2',
    author: 'tcfenligne.com',
    type: 'website',
    format: 'Online',
    level: ['A2', 'B1', 'B2', 'C1', 'C2'],
    bands: ['A1 non atteint', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    url: 'https://www.tcfenligne.com/tcf-canada-expression-ecrite/',
    price: null,
    description:
      'La plateforme tcfenligne.com propose des exemples détaillés pour chaque tâche de l\'EE, avec des modèles de niveau C1 et C2 et des conseils pratiques. Gratuit pour l\'essentiel. Idéal pour lire des rédactions modèles et comprendre ce que cherchent les correcteurs.',
    highlights: [
      'Exemples de productions écrites avec annotations',
      'Conseils pratiques pour chaque type de tâche',
      'Modèles de niveau C1–C2 accessibles gratuitement',
    ],
    badge: 'Gratuit',
    coverEmoji: '💻',
  },
  {
    id: 'passtcf-livre-corrige',
    title: 'Livre TCF Canada Expression Écrite avec Corrigés',
    author: 'passtcfcanada.com',
    type: 'guide',
    format: 'PDF',
    level: ['A2', 'B1', 'B2'],
    bands: ['A1 non atteint', 'A1', 'A2', 'B1'],
    url: 'https://passtcfcanada.com/telechargez-votre-livre-tcf-canada-expression-ecrite-avec-corriges/',
    price: 'Payant',
    description:
      'Un livre pratique avec des exercices corrigés pour les candidats débutant leur préparation à l\'EE. Couvre les 3 tâches avec des astuces, des exemples de rédactions annotées et des rappels sur le format de l\'épreuve. Bon point de départ avant de passer aux guides avancés.',
    highlights: [
      'Exercises corrigés pour les 3 tâches',
      'Astuces pratiques pour chaque type de texte',
      'Rappels clairs sur le format et les critères de notation',
    ],
    badge: 'Débutants',
    coverEmoji: '📝',
  },
  {
    id: 'objectifcanada-articles',
    title: 'Articles de préparation TCF Canada — Objectif Canada',
    author: 'objectifcanada-tcf.com',
    type: 'website',
    format: 'Online',
    level: ['A2', 'B1', 'B2', 'C1'],
    bands: ['A1 non atteint', 'A1', 'A2', 'B1', 'B2', 'C1'],
    url: 'https://objectifcanada-tcf.com/fr/news/tcf',
    price: null,
    description:
      'Un blog dédié à la préparation du TCF Canada, avec des articles sur la méthodologie de chaque épreuve, des analyses des critères d\'évaluation et des conseils d\'examinateurs. Lecture idéale pendant les pauses entre les séances de pratique.',
    highlights: [
      'Articles méthodologiques sur toutes les épreuves du TCF',
      'Analyses des critères de notation FEI',
      'Conseils régulièrement mis à jour pour 2025–2026',
    ],
    badge: 'Blog gratuit',
    coverEmoji: '📰',
  },
  {
    id: 'tef-canada-150-topics',
    title: 'TEF/TCF Canada Expression Écrite — 150 Topics to Succeed',
    author: 'Jean K. Mathieu',
    type: 'guide',
    format: 'Print+PDF',
    level: ['B1', 'B2', 'C1'],
    bands: ['B1', 'B2', 'C1'],
    url: 'https://www.goodreads.com/author/list/18945217.Jean_K_Mathieu',
    price: 'Payant',
    description:
      'Un livre axé sur les sujets les plus fréquents à l\'EE : 150 thèmes avec des arguments, du vocabulaire clé et des structures de phrases adaptées à chaque tâche. Très utile pour ne jamais se retrouver sans idées le jour de l\'examen.',
    highlights: [
      '150 sujets couvrant les thèmes les plus fréquents',
      'Arguments et vocabulaire organisés par thème',
      'Structures de phrases réutilisables aux niveaux B1–C1',
    ],
    badge: 'Incontournable',
    coverEmoji: '🎯',
  },
]

// ─── General French progression textbooks (B1 → C2) ──────────────────────────
export const FRENCH_TEXTBOOKS = [
  {
    id: 'grammaire-progressive-intermediaire',
    title: 'Grammaire Progressive du Français — Niveau Intermédiaire (A2–B1)',
    author: 'Maïa Grégoire — CLE International',
    type: 'textbook',
    format: 'Print+PDF',
    level: ['A2', 'B1'],
    bands: ['A1 non atteint', 'A1', 'A2', 'B1'],
    url: 'https://www.amazon.com/Grammaire-progressive-francais-Nouvelle-intermediaire/dp/2090381035',
    price: '~18 €',
    description:
      'La référence mondiale pour la grammaire française. 52 chapitres couvrant les niveaux A2 et B1, organisés en leçon à gauche et exercices à droite. Utilisé dans des milliers d\'écoles de langues. Si tu fais des erreurs récurrentes de grammaire dans tes rédactions, commence ici.',
    highlights: [
      '52 chapitres organisés par point de grammaire',
      'Organisation claire : leçon + exercices sur chaque double page',
      'Corrigés inclus pour travailler en autonomie',
    ],
    badge: 'Référence mondiale',
    coverEmoji: '📗',
    isbn: '9782090381030',
  },
  {
    id: 'grammaire-progressive-avance',
    title: 'Grammaire Progressive du Français — Niveau Avancé (B1–B2)',
    author: 'Michèle Boularès & Jean-Louis Frérot — CLE International',
    type: 'textbook',
    format: 'Print',
    level: ['B1', 'B2'],
    bands: ['B1', 'B2'],
    url: 'https://www.amazon.com/Grammaire-progressive-francais-Corrig%C3%A9s-avanc%C3%A9/dp/2090381981',
    price: '~20 €',
    description:
      'La suite logique pour passer de B1 à B2. 72 chapitres sur les points de grammaire avancés — subjonctif, conditionnel, concordance des temps, nominalisation. Comprend 180 tests auto-correctifs et un CD audio. Exactement ce qu\'il faut pour éliminer les erreurs grammaticales qui plombent la note EE.',
    highlights: [
      '72 chapitres pour les niveaux B1 et B2',
      '180 tests auto-correctifs + CD audio',
      'Focus sur les structures avancées les plus testées',
    ],
    badge: 'B1→B2',
    coverEmoji: '📙',
    isbn: '9782090381979',
  },
  {
    id: 'grammaire-progressive-perfectionnement',
    title: 'Grammaire Progressive du Français — Perfectionnement (B2–C2)',
    author: 'Maïa Grégoire — CLE International',
    type: 'textbook',
    format: 'Print',
    level: ['B2', 'C1', 'C2'],
    bands: ['B2', 'C1', 'C2'],
    url: 'https://www.amazon.com/Grammaire-progressive-francais-perfectionnement-couverture/dp/2090382090',
    price: '~22 €',
    description:
      'Le niveau perfectionnement de la série Grammaire Progressive : 600 exercices pour maîtriser les structures C1 et C2. Couvre la stylistique, la syntaxe complexe et les registres de langue. Indispensable si tu vises un score EE de 14+ et que tes correcteurs te signalent des erreurs de registre ou de syntaxe avancée.',
    highlights: [
      '600 exercices de niveau C1–C2',
      'Stylistique, syntaxe complexe et registres de langue',
      'Corrigés intégrés pour l\'auto-apprentissage',
    ],
    badge: 'B2→C2',
    coverEmoji: '📕',
    isbn: '9782090382099',
  },
  {
    id: 'alter-ego-plus-b2',
    title: 'Alter Ego+ 4 — Méthode de Français B2',
    author: 'Annie Berthet & al. — Hachette FLE',
    type: 'textbook',
    format: 'Print',
    level: ['B2'],
    bands: ['B1', 'B2'],
    url: 'https://www.amazon.com/Alter-EGO-Plus-Francais-Etrangere/dp/2011558123',
    price: '~28 €',
    description:
      'La méthode de français la plus utilisée au monde pour les niveaux adultes. Alter Ego+ 4 (B2) propose 8 dossiers thématiques avec documents authentiques, activités d\'écriture guidées et préparation au DELF B2. L\'approche actionnelle t\'apprend à écrire comme on écrit vraiment en France — pas seulement à répondre à un examen.',
    highlights: [
      '8 dossiers thématiques avec documents authentiques',
      'Activités d\'écriture guidées progressives',
      'Préparation intégrée au DELF B2',
    ],
    badge: 'Méthode complète',
    coverEmoji: '🌍',
    isbn: '9782011558121',
  },
  {
    id: 'alter-ego-5-c1-c2',
    title: 'Alter Ego 5 — Méthode de Français C1→C2',
    author: 'Catherine Dollez & Michel Guilloux — Hachette FLE',
    type: 'textbook',
    format: 'Print',
    level: ['C1', 'C2'],
    bands: ['C1', 'C2', 'B2'],
    url: 'https://www.amazon.com/Alter-Ego-Methode-Francais-French/dp/2011557976',
    price: '~32 €',
    description:
      'Alter Ego 5 est la méthode de référence pour les apprenants ayant déjà le niveau B2. 12 dossiers thématiques sur des problématiques sociétales, des documents authentiques variés et 6 entraînements complets au DALF C1. Si tu as obtenu entre 10 et 17 à l\'EE, ce livre est ta prochaine étape pour franchir le cap C2.',
    highlights: [
      '12 dossiers sur des thèmes sociétaux contemporains',
      '6 entraînements complets au DALF C1',
      'Documents écrits et oraux 100% authentiques',
    ],
    badge: 'B2→C1/C2',
    coverEmoji: '⭐',
    isbn: '9782011557971',
  },
  {
    id: 'bescherelle-conjugaison',
    title: 'Bescherelle — La Conjugaison pour Tous',
    author: 'Éditions Hatier / Hurtubise (Canada)',
    type: 'textbook',
    format: 'Print',
    level: ['A2', 'B1', 'B2', 'C1', 'C2'],
    bands: ['A1 non atteint', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    url: 'https://www.amazon.com/Bescherelle-conjugaison-nouvelle-%C3%A9dition/dp/B07BBZH33Y',
    price: '~10 €',
    description:
      'L\'outil de référence absolu pour la conjugaison française — 10 000 verbes sur 104 tableaux. Garde-le toujours à portée de main quand tu rédiges. Si les correcteurs signalent des erreurs de conjugaison dans tes rédactions, c\'est le premier outil à acquérir. Édition canadienne disponible chez Hurtubise.',
    highlights: [
      '10 000 verbes français sur 104 tableaux de conjugaison',
      'Référence de tous les temps et modes',
      'Édition canadienne disponible (Hurtubise)',
    ],
    badge: 'Essentiel',
    coverEmoji: '🔴',
    isbn: '9782218953057',
  },
]

/**
 * getRecommendations(cefrBand)
 * ──────────────────────────────
 * Returns a curated set of recommendations for a given CECRL band.
 * Always returns at least 1 TCF guide + 1 textbook, never more than
 * 3 guides + 2 textbooks (to keep the panel digestible).
 *
 * Priority order:
 *  - Resources whose `bands` array includes the user's current band first
 *  - Then universal resources (all bands)
 *  - Trim to max counts
 */
export function getRecommendations(cefrBand) {
  const matchGuides = TCF_GUIDES.filter((r) => r.bands.includes(cefrBand))
  const matchBooks  = FRENCH_TEXTBOOKS.filter((r) => r.bands.includes(cefrBand))

  // Always include the free web resource and at least one paid guide
  const guides = matchGuides.slice(0, 3)
  const books  = matchBooks.slice(0, 2)

  return { guides, books }
}
