export const WORDS_OF_DAY = [
  { word: 'Néanmoins', translation: 'Nevertheless', example: "Néanmoins, il a réussi l'examen malgré la fatigue." },
  { word: "S'épanouir", translation: 'To flourish / thrive', example: "Elle s'épanouit dans son nouveau travail." },
  { word: 'Davantage', translation: 'More / further', example: 'Il faut travailler davantage le vocabulaire.' },
  { word: 'Un enjeu', translation: 'A stake / issue at hand', example: "La maîtrise du français est un enjeu important pour l'immigration." },
  { word: 'Se démarquer', translation: 'To stand out', example: 'Un bon vocabulaire permet de se démarquer à l\u2019écrit.' },
  { word: 'Un atout', translation: 'An asset / advantage', example: 'Le bilinguisme est un atout sur le marché du travail.' },
  { word: 'Aguerri(e)', translation: 'Seasoned / hardened', example: 'Après 40 jours de défi, tu seras un candidat aguerri.' },
  { word: 'Un aboutissement', translation: 'A culmination / outcome', example: 'Cet examen est l\u2019aboutissement de ton travail.' },
  { word: 'Pallier', translation: 'To compensate for / remedy', example: 'Il révise chaque jour pour pallier ses lacunes en grammaire.' },
  { word: 'Une lacune', translation: 'A gap (in knowledge)', example: 'Identifie tes lacunes pour progresser plus vite.' },
  { word: 'Se perfectionner', translation: 'To improve oneself', example: 'Elle continue de se perfectionner en expression écrite.' },
  { word: 'Un défi', translation: 'A challenge', example: 'Ce défi de 41 jours va transformer ton niveau de français.' },
  { word: "D'ores et déjà", translation: 'Already / as of now', example: "Tu peux d'ores et déjà être fier de ta progression." },
  { word: 'Une échéance', translation: 'A deadline', example: "L'échéance de l'examen approche, reste régulier." },
  { word: 'Chevronné(e)', translation: 'Experienced / seasoned', example: 'Un correcteur chevronné remarquera la richesse de ton style.' },
]

export const STUDY_TIPS = [
  "Relis ta production EE à voix haute : les erreurs de syntaxe s'entendent souvent avant de se voir.",
  'Note 3 nouveaux connecteurs logiques chaque jour (cependant, néanmoins, par ailleurs...) et réutilise-les dans ta prochaine rédaction.',
  "Avant d'écouter un extrait CO, lis les questions d'abord : tu sauras exactement quoi repérer.",
  'Chronomètre-toi sur les séries CE — la gestion du temps compte autant que la compréhension.',
  'Varie ton vocabulaire : remplace "bien" et "très" par des adverbes plus précis dans tes écrits.',
  'Fais une liste de tes erreurs récurrentes en EE et relis-la avant chaque nouvelle rédaction.',
  "Écoute les extraits CO une seconde fois après correction pour repérer ce que tu as manqué à l'oreille.",
  "Structure toujours ta tâche 3 en 2 parties distinctes : reformulation, puis argumentation personnelle.",
  'Un texte bien structuré avec des connecteurs simples vaut mieux qu\u2019un texte ambitieux mais confus.',
]

export const MOTIVATIONAL_MESSAGES = [
  'Chaque jour de pratique te rapproche du niveau que tu vises. Continue, la régularité paie toujours.',
  "Les progrès en langue ne sont pas linéaires — un jour difficile ne remet pas en cause ta trajectoire.",
  'Tu n\u2019as pas besoin d\u2019être parfait aujourd\u2019hui, seulement un peu meilleur qu\u2019hier.',
  "L'examen se prépare un jour à la fois. Concentre-toi sur celui d'aujourd'hui.",
  'Ta discipline d\u2019aujourd\u2019hui construit ta confiance le jour de l\u2019examen.',
  "Chaque correction que tu lis attentivement t'évite de refaire la même erreur à l'examen.",
]

/** Deterministic day-of-year index so everyone sees the same "today" pick,
 * and it's stable across refreshes without needing to persist anything. */
export function dayOfYearIndex(poolLength) {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now - start
  const dayOfYear = Math.floor(diff / 86400000)
  return dayOfYear % poolLength
}
