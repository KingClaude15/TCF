/**
 * Expands short quiz/drill explanations into a structured pedagogical block
 * for the Learning Center (shown only after the student answers).
 */

const RULE_BANK = [
  // More specific rules first to avoid broad keyword collisions (e.g. "plur" matching everything).
  {
    keys: ['subjonctif', 'subj', 'bien que', 'quoique', 'il faut que', 'pour que', 'afin que', 'avant que', 'pourvu que', 'à condition que', 'doute', 'crains', 'souhaite', 'indispensable', 'nécessaire', 'essentiel', 'dommage'],
    title: 'Subjonctif vs indicatif',
    detail:
      'Le subjonctif exprime le doute, le souhait, la nécessité, la concession ou le but. ' +
      'Repère le déclencheur (il faut que, bien que, je ne pense pas que, pour que…). ' +
      'L’indicatif sert plutôt à présenter un fait comme certain (il est évident que, je sais que, il est clair que).',
    tip: 'Astuce : transforme la phrase avec « que je sois / que tu fasses ». Si le sens reste un ordre, un doute ou un souhait → subjonctif.',
  },
  {
    keys: ['imparfait', 'passé composé', 'plus-que-parfait', 'pqp', 'habitude', 'antériorité', 'arrière-plan'],
    title: 'Temps du passé',
    detail:
      'Imparfait = cadre, description, habitude. Passé composé = fait ponctuel achevé. ' +
      'Plus-que-parfait = action déjà terminée avant une autre action passée. ' +
      'Les marqueurs aident : chaque matin / soudain / hier / quand + PC / déjà.',
    tip: 'Relis la phrase en te demandant : « est-ce un décor ou un événement ? » puis « y a-t-il une action encore plus ancienne ? ».',
  },
  {
    keys: [
      'homophone',
      'ou bien', 'verbe être', 'verbe avoir', 'conjonction', 'coordination',
      'possessif', 'démonstratif',
      'remplace par « était »', 'remplace par « avait »', 'remplace par « ou bien »',
      'remplace par « étaient »', 'c’est →', 's’est →',
      'et » coordonne', 'est » est le verbe', 'ou » exprime', 'où » interroge',
      'a » est le verbe', 'à » est la préposition', 'sont » est le verbe',
      'son » est le', 'ces »', 'ses »',
    ],
    title: 'Homophones grammaticaux',
    detail:
      'Ce sont des mots qui se prononcent pareil mais s’écrivent différemment. ' +
      'Pour choisir : teste la substitution. ' +
      'ou → « ou bien » ; où = lieu/moment ; a → « avait » ; à = préposition ; ' +
      'est → « était » ; et = coordination ; sont → « étaient » ; son = possessif ; ' +
      'on → « l’on » ; ont = verbe avoir.',
    tip: 'En relecture EE, contrôle systématiquement a/à, et/est, on/ont, ou/où : ce sont les fautes les plus visibles et les plus pénalisées.',
  },
  {
    keys: [
      'participe passé', 'cod avant', 'être +', 'avec avoir', 's’est ', 'est allée', 'est parti',
      'les lettres que', 'que j’ai écrit', 'que j’ai fait', 'accord du participe',
      'cod fém', 'cod = les', 'être + elle', 'être + nous', 'pas d’accord', 'partie', 'faites', 'arrivés',
      'qu’ils ont', 'que j’ai', 's’est ___ les',
    ],
    title: 'Accord du participe passé',
    detail:
      'Avec être, le participe s’accorde avec le sujet (elle est allée). ' +
      'Avec avoir, il s’accorde seulement si le COD est placé avant le verbe (les lettres que j’ai écrites). ' +
      'Aux pronominaux, vérifie si le pronom est COD ou COI.',
    tip: 'Pose la question « quoi / qui ? » juste avant le verbe : si la réponse est avant le verbe → souvent accord.',
  },
  {
    keys: [
      'pluriel de', 'genre et pluriel', 'travaux', 'journaux', 'chevaux', 'problème est masculin',
      'un grand erreur', 'des chevals', 'pluriel irrégulier',
    ],
    title: 'Genre et pluriel des noms',
    detail:
      'Le genre (masculin / féminin) des noms doit être mémorisé : un problème, une erreur, un journal… ' +
      'Certains pluriels sont irréguliers : travail → travaux, journal → journaux, cheval → chevaux, œil → yeux. ' +
      'L’article et l’adjectif s’accordent en genre et en nombre avec le nom.',
    tip: 'Pour les noms en -al / -ail, vérifie s’ils font -aux au pluriel (travail, journal, cheval) ou s’ils restent réguliers (récital → récitals).',
  },
  {
    keys: [
      'adjectif', 'mesures strict', 'restée calme', 'bleu foncé', 'couleur composée',
      'accord de l’adjectif', 'féminin pluriel →', 'elle est restée', 'strictes', 'calme',
    ],
    title: 'Accord de l’adjectif',
    detail:
      'L’adjectif s’accorde en genre et en nombre avec le nom qu’il qualifie. ' +
      'Quand plusieurs noms de genres différents sont qualifiés, on met souvent le masculin pluriel. ' +
      'Les couleurs composées (bleu foncé, vert clair) restent généralement invariables.',
    tip: 'Identifie le nom « chef de file » de l’adjectif, puis applique genre + nombre. Pour les couleurs, demande-toi si c’est un simple adjectif ou une locution figée.',
  },
  {
    keys: [
      'sujet–verbe', 'antécédent', 'la majorité', 'peu d’', 'c’est nous qui',
      'ce sont eux qui', 'accord sujet', 'accord sujet–verbe',
    ],
    title: 'Accord sujet–verbe',
    detail:
      'Le verbe s’accorde en personne et en nombre avec son sujet. ' +
      'Avec « qui », le verbe s’accorde avec l’antécédent (c’est nous qui sommes…). ' +
      'Attention aux sujets collectifs (la majorité + singulier) et aux expressions comme « peu de + pluriel ».',
    tip: 'Repère le vrai sujet (parfois éloigné ou inversé) avant de conjuguer. Avec « qui », remplace mentalement par l’antécédent.',
  },

  {
    keys: ['dont', 'lequel', 'laquelle', 'auquel', 'duquel', 'relatif', 'pronom relatif'],
    title: 'Pronoms relatifs',
    detail:
      'qui = sujet de la relative. que = COD. dont = complément introduit par de. ' +
      'où = lieu ou moment. lequel / auquel / duquel après une préposition. ' +
      'Évite de doubler (dont + de, où + y).',
    tip: 'Réécris la relative en deux phrases : la préposition qui apparaît guide le choix du relatif.',
  },
  {
    keys: [' lui ', 'leur', 'cod', 'coi', 'pronom', ' en ', ' y '],
    title: 'Pronoms personnels (COD, COI, en, y)',
    detail:
      'COD : le / la / les. COI personne : lui / leur. ' +
      'en remplace de + nom (quantité ou complément). y remplace à + lieu ou à + chose. ' +
      'Ordre habituel : me/te/nous/vous + le/la/les + lui/leur + y + en. Ne répète pas le nom déjà pronominalisé.',
    tip: 'Si tu as déjà mis le / la / en / y, supprime le groupe nominal correspondant dans la phrase.',
  },
  {
    keys: ['préposition', 's’intéresser', 'dépendre', 'réussir à', 'refuser de', 'remercier'],
    title: 'Prépositions',
    detail:
      'Beaucoup de verbes imposent une préposition fixe : s’intéresser à, dépendre de, réussir à + infinitif, ' +
      'refuser de, remercier de, participer à. Les pays : en + féminin / en + voyelle, au / aux + masculin.',
    tip: 'Apprends les verbes par paires (verbe + préposition) comme du vocabulaire, pas comme des exceptions isolées.',
  },
  {
    keys: ['passif', 'été ', 'sera ', 'par le'],
    title: 'Voix passive',
    detail:
      'Passif = être + participe passé. Le participe s’accorde avec le nouveau sujet. ' +
      'L’agent s’introduit souvent par « par ». Utile en EE pour varier le style et rester neutre.',
    tip: 'Repère le COD de la phrase active : il devient sujet du passif, d’où l’accord.',
  },
  {
    keys: ['connecteur', 'cependant', 'toutefois', 'néanmoins', 'certes', 'par conséquent', 'malgré', 'concession'],
    title: 'Connecteurs logiques',
    detail:
      'Les connecteurs organisent l’argumentation : ajout, opposition, cause, conséquence, concession, conclusion. ' +
      'Malgré + nom ; bien que + subjonctif. Évite de répéter toujours « mais » et « donc ».',
    tip: 'En Tâche 3, prévois au moins un connecteur de concession (certes… mais / toutefois) pour nuancer.',
  },
  {
    keys: ['nominalisation', 'gérondif', 'participe présent', 'mise en relief', 'c’est… qui', 'impersonnel', 'inversion'],
    title: 'Style avancé (C1)',
    detail:
      'Nominalisation, gérondif, participiales, mise en relief (c’est… qui/que) et tournures impersonnelles ' +
      '(il convient de, il est essentiel que) densifient le texte et élèvent le registre — très valorisés en EE.',
    tip: 'Remplace une phrase verbale vague (« on voit que ça baisse ») par une nominalisation (« on constate une baisse »).',
  },
]

/**
 * @param {string|object|null} explain
 * @param {{ q?: string, options?: string[], answer?: number, picked?: number, correct?: boolean }} ctx
 */
export function expandExplanation(explain, ctx = {}) {
  const summary =
    typeof explain === 'string'
      ? explain
      : explain?.summary || explain?.text || explain?.detail || 'Regarde la bonne réponse et la règle associée.'

  const blob = `${summary} ${ctx.q || ''} ${(ctx.options || []).join(' ')}`.toLowerCase()

  let matched = null
  for (const rule of RULE_BANK) {
    if (rule.keys.some((k) => blob.includes(k.toLowerCase()))) {
      matched = rule
      break
    }
  }

  if (explain && typeof explain === 'object') {
    return {
      summary: explain.summary || explain.text || summary,
      title: explain.title || matched?.title,
      detail: explain.detail || matched?.detail,
      tip: explain.tip || matched?.tip,
      correctAnswer:
        explain.correctAnswer ||
        (ctx.options && ctx.answer != null ? ctx.options[ctx.answer] : undefined),
      yourAnswer: ctx.options && ctx.picked != null ? ctx.options[ctx.picked] : undefined,
      correct: ctx.correct,
    }
  }

  return {
    summary,
    title: matched?.title,
    detail: matched?.detail,
    tip: matched?.tip,
    correctAnswer: ctx.options && ctx.answer != null ? ctx.options[ctx.answer] : undefined,
    yourAnswer: ctx.options && ctx.picked != null ? ctx.options[ctx.picked] : undefined,
    correct: ctx.correct,
  }
}

export function expandDrillExplanation(drill) {
  const base =
    drill.explanation ||
    drill.reason ||
    `On corrige « ${drill.original} » en « ${drill.correction} ».`

  const cat = (drill.category || '').toLowerCase()
  const catDetail = {
    grammaire:
      'Erreur de grammaire : accords, mode, déterminants ou construction de phrase. Relis la règle puis réécris la phrase sans regarder le modèle.',
    conjugaison:
      'Erreur de conjugaison : temps, mode ou personne. Identifie le sujet et le repère temporel (hier, chaque jour, déjà…) avant de conjuguer.',
    orthographe:
      'Erreur d’orthographe (lettres, accents, homophones). Ces fautes se voient immédiatement à la relecture EE : contrôle a/à, et/est, on/ont.',
    syntaxe:
      'Erreur de syntaxe : ordre des mots, relative mal formée, double complément. Simplifie d’abord la phrase, puis réintroduis les compléments.',
    lexique:
      'Choix de mot imprécis ou calque. Cherche un équivalent plus naturel / plus formel adapté au registre de l’épreuve.',
    structure:
      'Problème d’organisation (titre, paragraphes, enchaînement). Une structure claire aide l’examinateur à suivre ton raisonnement.',
    registre:
      'Registre trop familier pour l’EE. Préfère vous, des formules neutres, et évite l’argot ou les tournures orales.',
  }

  const expanded = expandExplanation(base, { q: drill.original })
  return {
    summary: base,
    title: expanded.title || (drill.category ? `Catégorie : ${drill.category}` : 'Correction'),
    detail:
      expanded.detail ||
      catDetail[cat] ||
      'Compare l’original et la correction mot à mot. Demande-toi quelle règle a été appliquée, puis reformule une phrase similaire.',
    tip:
      expanded.tip ||
      'Réécris la phrase corrigée une fois de mémoire, puis invente un exemple proche pour fixer la règle.',
    original: drill.original,
    correction: drill.correction,
  }
}
