/**
 * readingRecommendations.js
 * ─────────────────────────────────────────────────────────────────────────────
 * 100% FREE resources only — this is a free platform for students.
 * Every URL here is accessible without payment, login walls, or purchase.
 *
 * Last verified: August 2026
 *
 * Two catalogues:
 *
 *  1. TCF_GUIDES   — Free TCF-Canada EE methodology, sample subjects,
 *                    corrected models, and official resources.
 *
 *  2. FRENCH_RESOURCES — Free online tools, platforms, and courses
 *                        to progress from B1 to C2 in French writing.
 *
 * Band mapping logic:
 *   Every resource has a `bands` array listing CECRL levels for which
 *   it is recommended. getRecommendations(band) filters both catalogues
 *   and returns the most relevant subset.
 *
 * Resource fields:
 *   id          — unique slug
 *   title       — full title shown to user
 *   author      — who made it
 *   type        — 'website' | 'pdf' | 'video' | 'course' | 'tool'
 *   format      — display label: 'Site web' | 'PDF gratuit' | 'Vidéo' | 'Cours en ligne' | 'Outil'
 *   level       — CECRL levels the resource covers
 *   bands       — CECRL bands for which it is recommended
 *   url         — direct link (verified free, no paywall)
 *   description — one paragraph in French explaining what it is and why it helps
 *   highlights  — 3 specific bullet points (concrete, not marketing fluff)
 *   badge       — short pill: '100% Gratuit' | 'Officiel FEI' | 'Sujets réels' | etc.
 *   coverEmoji  — emoji (no external image dependency)
 */

// ─── 1. TCF / EE Free Guides ──────────────────────────────────────────────────
export const TCF_GUIDES = [
  {
    id: 'fei-officiel-exemples',
    title: 'Exemples officiels TCF — France Éducation International',
    author: 'France Éducation International (FEI)',
    type: 'website',
    format: 'Site officiel',
    level: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    bands: ['A1 non atteint', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    url: 'https://www.france-education-international.fr/en/test/tcf-canada',
    description:
      'Le site officiel de France Éducation International — l\'organisme qui crée et corrige le TCF Canada. Il publie gratuitement des exemples de sujets d\'expression écrite, des guides candidats et les critères d\'évaluation officiels. C\'est la source la plus fiable qui existe : ce sont exactement les mêmes examinateurs qui noteront ta copie le jour J.',
    highlights: [
      'Exemples de sujets officiels pour les 3 tâches EE',
      'Critères d\'évaluation exacts utilisés par les correcteurs FEI',
      'Manuel du candidat téléchargeable gratuitement',
    ],
    badge: 'Officiel FEI',
    coverEmoji: '🏛️',
  },
  {
    id: 'tcfca-sujets-actualite',
    title: 'Sujets d\'actualité EE — Archives mensuelles 2022–2025',
    author: 'tcf-canada.ca',
    type: 'website',
    format: 'Site web',
    level: ['A2', 'B1', 'B2', 'C1', 'C2'],
    bands: ['A2', 'B1', 'B2', 'C1', 'C2'],
    url: 'https://tcf-canada.ca/expression-ecrite-sujets-dactualites/',
    description:
      'Des dizaines de vrais sujets d\'expression écrite classés par mois depuis 2022 — gratuits, sans inscription. Ces sujets sont tirés de vraies sessions d\'examen et reviennent régulièrement. C\'est la meilleure source pour s\'entraîner sur du matériel authentique. Consulte les archives de plusieurs mois pour voir les thèmes récurrents.',
    highlights: [
      'Archives de vrais sujets EE depuis 2022, organisés par mois',
      'Sujets des 3 tâches incluant la Tâche 3 (argumentation)',
      'Accès gratuit sans inscription — ouvrir et s\'entraîner immédiatement',
    ],
    badge: 'Sujets réels',
    coverEmoji: '📅',
  },
  {
    id: 'tcfenligne-guide-gratuit',
    title: 'Guide EE TCF Canada — Conseils, Structures et Modèles',
    author: 'tcfenligne.com',
    type: 'website',
    format: 'Site web',
    level: ['A2', 'B1', 'B2', 'C1', 'C2'],
    bands: ['A1 non atteint', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    url: 'https://www.tcfenligne.com/tcf-canada-expression-ecrite/',
    description:
      'Une page de référence gratuite avec la structure complète pour chaque tâche EE, des formules de politesse, des phrases types et des exemples de productions annotées de niveau C1–C2. Parfait pour comprendre ce que cherchent les correcteurs et apprendre les formules indispensables pour chaque type de texte.',
    highlights: [
      'Structure pas-à-pas pour les 3 tâches (Tâche 1 : courriel, Tâche 2 : récit, Tâche 3 : argumentation)',
      'Formules de politesse et connecteurs logiques prêts à l\'emploi',
      'Exemples de productions de niveau C1–C2 annotées gratuitement',
    ],
    badge: '100% Gratuit',
    coverEmoji: '📋',
  },
  {
    id: 'globalexam-exemples-corriges',
    title: 'Exemples Corrigés TCF EE — Sujets Zéro FEI',
    author: 'GlobalExam (sujets FEI)',
    type: 'website',
    format: 'Site web',
    level: ['A2', 'B1', 'B2'],
    bands: ['A1 non atteint', 'A1', 'A2', 'B1'],
    url: 'https://global-exam.com/blog/fr/exemple-dexpression-ecrite-du-tcf-et-corrige/',
    description:
      'GlobalExam publie gratuitement les "sujets zéro" de France Éducation International — ce sont des sujets officiels publiés par FEI eux-mêmes pour illustrer le format de l\'examen. Chaque sujet est accompagné d\'un corrigé commenté. Idéal pour les débutants qui veulent d\'abord comprendre le format avant de s\'entraîner.',
    highlights: [
      'Sujets zéro officiels publiés par FEI avec corrigés',
      'Commentaires sur ce qui est bien et ce qui est à éviter',
      'Explications sur la structure attendue pour chaque tâche',
    ],
    badge: '100% Gratuit',
    coverEmoji: '✅',
  },
  {
    id: 'prepmontcf-sujets',
    title: 'Sujets EE par session — Archives 2022 à 2025',
    author: 'prepmontcfca.com',
    type: 'website',
    format: 'Site web',
    level: ['B1', 'B2', 'C1', 'C2'],
    bands: ['B1', 'B2', 'C1', 'C2'],
    url: 'https://prepmontcfca.com/sujets-expression-ecrite/',
    description:
      'Un deuxième site avec des archives de sujets réels classés par session d\'examen (2022, 2023, 2024, 2025). Très utile pour pratiquer en conditions réelles avec des sujets différents de ceux de l\'autre archive. Plus tu pratiques sur des sujets variés, plus tu t\'habitues aux formulations et aux thèmes de la Tâche 3.',
    highlights: [
      'Archives complètes de sessions réelles d\'examen par année',
      'Sujets Tâche 3 pour pratiquer l\'argumentation sur des thèmes variés',
      'Accès direct sans inscription ni paiement',
    ],
    badge: 'Sujets réels',
    coverEmoji: '🗂️',
  },
  {
    id: 'francaisavecpierre-pdf-sujets',
    title: 'PDF Gratuit — 30 Sujets pour l\'EE et l\'EO du TCF',
    author: 'Français avec Pierre',
    type: 'pdf',
    format: 'PDF gratuit',
    level: ['A2', 'B1', 'B2', 'C1'],
    bands: ['A2', 'B1', 'B2', 'C1'],
    url: 'https://www.francaisavecpierre.com/exemple-tcf/',
    description:
      'Un PDF gratuit avec 30 sujets d\'entraînement pour l\'expression écrite et orale du TCF, téléchargeable sans achat. La page contient aussi une explication détaillée du format de chaque tâche EE avec des exemples concrets. Très bien pour s\'entraîner en hors-ligne une fois le PDF téléchargé.',
    highlights: [
      '30 sujets d\'entraînement EE et EO téléchargeables gratuitement',
      'Explications du format et des attentes pour chaque tâche',
      'Utilisable hors-ligne une fois téléchargé',
    ],
    badge: 'PDF Gratuit',
    coverEmoji: '📥',
  },
  {
    id: 'objectifcanada-blog',
    title: 'Blog TCF Canada — Méthodologie et Conseils d\'Examinateurs',
    author: 'objectifcanada-tcf.com',
    type: 'website',
    format: 'Blog gratuit',
    level: ['A2', 'B1', 'B2', 'C1'],
    bands: ['A1 non atteint', 'A1', 'A2', 'B1', 'B2', 'C1'],
    url: 'https://objectifcanada-tcf.com/fr/news/tcf',
    description:
      'Un blog gratuit avec des articles réguliers sur la méthodologie du TCF Canada — erreurs fréquentes, stratégies de temps, structures à utiliser pour chaque tâche. Lecture idéale pendant les pauses entre deux séances de pratique. Les articles sont écrits par des personnes qui connaissent bien les critères d\'évaluation FEI.',
    highlights: [
      'Articles sur les erreurs les plus fréquentes à éviter',
      'Conseils de gestion du temps pour les 60 minutes de l\'épreuve',
      'Mis à jour régulièrement avec les tendances 2025–2026',
    ],
    badge: 'Blog gratuit',
    coverEmoji: '📰',
  },
  {
    id: 'tcfca-guide-ee',
    title: 'Guide EE TCF Canada 2026 — Conseils pratiques et exemples corrigés',
    author: 'tcfca.com',
    type: 'website',
    format: 'Site web',
    level: ['A2', 'B1', 'B2', 'C1', 'C2'],
    bands: ['A2', 'B1', 'B2', 'C1', 'C2'],
    url: 'https://www.tcfca.com/se-preparer/tcf-canada-expression-ecrite/',
    description:
      'La page de préparation EE de tcfca.com est gratuite et très complète : critères d\'évaluation par niveau, erreurs à éviter absolument (hors sujet, non-respect du nombre de mots, absence de nuance en Tâche 3), et exemples de productions pour chaque tâche. Un passage obligatoire avant de commencer à s\'entraîner.',
    highlights: [
      'Critères exacts d\'évaluation par niveau CECRL pour chaque tâche',
      'Liste des erreurs éliminatoires (hors sujet, nombre de mots, etc.)',
      'Exemples de productions annotées pour les 3 tâches',
    ],
    badge: '100% Gratuit',
    coverEmoji: '🎯',
  },
]

// ─── 2. Free French progression resources (B1 → C2) ──────────────────────────
export const FRENCH_RESOURCES = [
  {
    id: 'tv5monde-apprendre',
    title: 'TV5MONDE — Apprendre le Français (A1 à C2)',
    author: 'TV5MONDE / France Éducation International',
    type: 'website',
    format: 'Cours en ligne',
    level: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    bands: ['A1 non atteint', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    url: 'https://apprendre.tv5monde.com/fr',
    description:
      'La plateforme officielle de TV5MONDE, développée en collaboration avec France Éducation International. Plus de 4 000 exercices interactifs à partir de vraies vidéos en français — tous niveaux A1 à C2, tout gratuit. Elle prépare aussi spécifiquement au TCF. C\'est l\'une des ressources les plus complètes et les plus fiables disponibles gratuitement sur internet pour améliorer son expression écrite.',
    highlights: [
      'Plus de 4 000 exercices interactifs basés sur de vraies vidéos françaises',
      'Préparation spécifique au TCF intégrée — produite avec FEI',
      '100% gratuit, sans inscription obligatoire, disponible sur mobile et web',
    ],
    badge: '100% Gratuit',
    coverEmoji: '📺',
  },
  {
    id: 'rfi-savoirs',
    title: 'RFI Savoirs — Exercices de Français B1–C1',
    author: 'Radio France Internationale',
    type: 'website',
    format: 'Site web',
    level: ['B1', 'B2', 'C1'],
    bands: ['B1', 'B2', 'C1', 'C2'],
    url: 'https://savoirs.rfi.fr/fr/apprendre-enseigner/langue-francaise',
    description:
      'RFI Savoirs est la plateforme pédagogique de Radio France Internationale. Elle propose des exercices de compréhension écrite et orale à partir de vraies émissions de radio françaises. Idéal pour s\'immerger dans un français authentique, enrichir son vocabulaire sur des thèmes d\'actualité (politique, environnement, société) — exactement les thèmes de la Tâche 3 du TCF.',
    highlights: [
      'Exercices à partir de vraies émissions RFI sur des thèmes d\'actualité',
      'Vocabulaire de B1 à C1 sur des sujets sociétaux (Tâche 3)',
      '100% gratuit — produit par des professeurs de FLE certifiés',
    ],
    badge: '100% Gratuit',
    coverEmoji: '📻',
  },
  {
    id: 'coursera-b1-b2-paris-saclay',
    title: 'Cours Gratuit : Étudier en France — Français B1/B2',
    author: 'Université Paris-Saclay (Coursera)',
    type: 'course',
    format: 'Cours en ligne',
    level: ['B1', 'B2'],
    bands: ['A2', 'B1', 'B2'],
    url: 'https://www.coursera.org/learn/etudier-en-france',
    description:
      'Un cours universitaire gratuit créé par l\'Université Paris-Saclay et accessible sur Coursera. Plus de 700 000 inscrits. Il cible le niveau B1/B2 avec des vidéos de cours, des textes authentiques et des exercices d\'écriture. Il est auditable gratuitement (sans certificat). Parfait pour progresser structurellement de A2/B1 vers B2 avec une progression pédagogique rigoureuse.',
    highlights: [
      'Cours universitaire structuré B1/B2 — 700 000+ inscrits sur Coursera',
      'Exercices d\'écriture guidés avec feedback progressif',
      'Auditable gratuitement sans frais ni carte bancaire',
    ],
    badge: 'Gratuit (audit)',
    coverEmoji: '🎓',
  },
  {
    id: 'bonpatron-correcteur',
    title: 'BonPatron — Correcteur Grammatical Français Gratuit',
    author: 'bonpatron.com',
    type: 'tool',
    format: 'Outil',
    level: ['A2', 'B1', 'B2', 'C1', 'C2'],
    bands: ['A1 non atteint', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    url: 'https://bonpatron.com',
    description:
      'BonPatron est un correcteur grammatical français spécialisé dans la détection des erreurs de français langue étrangère — contrairement aux correcteurs généraux, il comprend les erreurs typiques des apprenants de FLE. Colle ta rédaction avant de la soumettre pour vérifier les accords, la conjugaison et l\'orthographe. Utilisation gratuite en ligne, sans inscription.',
    highlights: [
      'Détecte les erreurs typiques des apprenants FLE (pas seulement des natifs)',
      'Explique chaque erreur détectée avec une règle grammaticale',
      'Gratuit, en ligne, sans inscription — fonctionne immédiatement',
    ],
    badge: 'Outil gratuit',
    coverEmoji: '🔍',
  },
  {
    id: 'conjugueur-reverso',
    title: 'Conjugueur Reverso — Tous les Temps, Tous les Verbes',
    author: 'Reverso',
    type: 'tool',
    format: 'Outil',
    level: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    bands: ['A1 non atteint', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    url: 'https://conjugueur.reverso.net/conjugaison-francais.html',
    description:
      'Le conjugueur de Reverso donne en quelques secondes la conjugaison complète de n\'importe quel verbe français dans tous les temps et modes. Totalement gratuit. Quand tu rédiges une tâche et que tu doutes d\'une forme verbale (subjonctif, conditionnel passé, futur antérieur), c\'est le réflexe à avoir avant de soumettre.',
    highlights: [
      'Conjugaison complète de tout verbe français dans tous les temps',
      'Inclut les verbes irréguliers et les temps les plus piégeux (subjonctif, conditionnel)',
      'Gratuit, instantané — pas d\'inscription requise',
    ],
    badge: 'Outil gratuit',
    coverEmoji: '📖',
  },
  {
    id: 'cnrtl-synonymes',
    title: 'CNRTL — Dictionnaire des Synonymes et Définitions',
    author: 'Centre National de Ressources Textuelles et Lexicales (CNRS)',
    type: 'tool',
    format: 'Outil',
    level: ['B1', 'B2', 'C1', 'C2'],
    bands: ['B1', 'B2', 'C1', 'C2'],
    url: 'https://www.cnrtl.fr/synonymie/',
    description:
      'Le CNRTL est la ressource lexicale de référence du CNRS français. Son dictionnaire de synonymes est idéal pour enrichir son vocabulaire et éviter les répétitions dans ses rédactions — un des critères clés de la compétence lexicale au TCF. Quand tu utilises un mot basique, cherche son synonyme plus précis ici pour viser un meilleur score lexical.',
    highlights: [
      'Synonymes précis et nuancés par registre de langue (soutenu, courant, familier)',
      'Produit par le CNRS — la source la plus académique disponible gratuitement',
      'Idéal pour remplacer les mots trop simples et enrichir ton lexique EE',
    ],
    badge: 'Outil gratuit',
    coverEmoji: '📚',
  },
  {
    id: 'inner-french-podcast',
    title: 'Inner French — Podcast et Vidéos B1 à C1',
    author: 'Hugo Cotton (Inner French)',
    type: 'video',
    format: 'Vidéo / Podcast',
    level: ['B1', 'B2', 'C1'],
    bands: ['B1', 'B2', 'C1'],
    url: 'https://www.youtube.com/@InnerFrench',
    description:
      'Inner French est une chaîne YouTube et un podcast 100% gratuit animé par un professeur de FLE. Les épisodes sont en français naturel, à vitesse modérée, sur des sujets de société — exactement les thèmes de la Tâche 3. Écouter régulièrement te permet d\'acquérir des arguments, du vocabulaire thématique et des tournures de phrases avancées que tu pourras réutiliser à l\'écrit.',
    highlights: [
      'Podcast en français naturel sur des thèmes de société (Tâche 3)',
      'Niveau B1 à C1 — vitesse ajustée pour les apprenants avancés',
      '100% gratuit sur YouTube et plateformes de podcast',
    ],
    badge: '100% Gratuit',
    coverEmoji: '🎧',
  },
  {
    id: 'bescherelle-en-ligne',
    title: 'leconjugueur.com — Conjugaison et Règles de Grammaire',
    author: 'leconjugueur.com',
    type: 'tool',
    format: 'Outil',
    level: ['A2', 'B1', 'B2', 'C1', 'C2'],
    bands: ['A1 non atteint', 'A1', 'A2', 'B1', 'B2'],
    url: 'https://leconjugueur.lefigaro.fr',
    description:
      'La version en ligne du Bescherelle — le conjugueur de référence — accessible gratuitement via Le Figaro. Conjugaisons, règles d\'accord, exceptions. Quand tu hésites sur une terminaison ou un accord de participe passé, c\'est ici que tu vérifies. Rapide et fiable, sans publicités intrusives.',
    highlights: [
      'Équivalent en ligne du Bescherelle — 100% gratuit',
      'Règles d\'accord des participes passés expliquées clairement',
      'Accès direct sans inscription — résultat en moins de 5 secondes',
    ],
    badge: 'Outil gratuit',
    coverEmoji: '🔤',
  },
]

/**
 * getRecommendations(cefrBand)
 * ──────────────────────────────
 * Returns curated FREE resources for the user's current CECRL band.
 *
 * Counts:
 *   - Up to 4 TCF guides (always include the FEI official site first)
 *   - Up to 3 French progression resources
 *
 * Ordering: FEI official always first in guides. Then band-matched resources.
 */
export function getRecommendations(cefrBand) {
  // Guides: FEI official first, then band-matched
  const feiFirst = TCF_GUIDES.filter(r => r.id === 'fei-officiel-exemples')
  const otherGuides = TCF_GUIDES
    .filter(r => r.id !== 'fei-officiel-exemples' && r.bands.includes(cefrBand))
  const guides = [...feiFirst, ...otherGuides].slice(0, 4)

  // Resources: TV5Monde first (works for all levels), then band-matched
  const tv5First = FRENCH_RESOURCES.filter(r => r.id === 'tv5monde-apprendre')
  const otherResources = FRENCH_RESOURCES
    .filter(r => r.id !== 'tv5monde-apprendre' && r.bands.includes(cefrBand))
  const resources = [...tv5First, ...otherResources].slice(0, 3)

  return { guides, resources }
}
