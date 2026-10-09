/**
 * Fill-in-the-blank bank (50 questions) — Learning Center.
 * type: 'blank' — answers is an array of accepted strings (normalized on check).
 */

export const FILL_BLANK_50_MODULE = {
  id: 'fill-blank-50',
  title: 'Textes à trous (50 questions)',
  icon: '✍️',
  color: 'ee',
  description: 'Complète les phrases : connecteurs, accords, modes, homophones, conjugaison.',
  lessons: [
    {
      id: 'fill-blank-50-p1',
      title: 'Textes à trous — Connecteurs logiques',
      minutes: 15,
      theory: [
        'Lis la phrase entière avant de remplir le trou.',
        'Une ou plusieurs réponses peuvent être acceptées (synonymes).',
        'Après validation, lis l\'explication pour comprendre la règle.',
      ],
      examples: [
        { bad: 'Laisser le trou vide et passer', good: 'Proposer une forme, puis vérifier la règle' },
      ],
      quiz: [
        {
          type: 'blank',
          q: 'Il a beaucoup travaillé ; ________, ses résultats restent faibles.',
          answers: ['toutefois', 'néanmoins', 'cependant'],
          explain: 'Correct : toutefois / néanmoins / cependant marquent une opposition restrictive. Incorrect : des connecteurs de cause (car) ou de conséquence (donc) ne conviennent pas ici.',
        },
        {
          type: 'blank',
          q: 'La pollution augmente. ________, il faut agir rapidement.',
          answers: ['c\'est pourquoi', 'c’est pourquoi', 'par conséquent', 'donc'],
          explain: 'Correct : c\'est pourquoi / par conséquent / donc expriment la conséquence. Incorrect : car / parce que introduisent une cause.',
        },
        {
          type: 'blank',
          q: '________ le coût soit élevé, cet investissement est rentable.',
          answers: ['bien que', 'quoique'],
          explain: 'Correct : bien que / quoique + subjonctif = concession. Incorrect : parce que (cause) ou afin que (but).',
        },
        {
          type: 'blank',
          q: 'Mangez plus de fruits. ________, buvez suffisamment d\'eau.',
          answers: ['de plus', 'en outre', 'par ailleurs'],
          explain: 'Correct : de plus / en outre / par ailleurs ajoutent un argument. Incorrect : toutefois (opposition).',
        },
        {
          type: 'blank',
          q: '________ réglementer l\'usage de l\'IA, les risques diminueront.',
          answers: ['à condition de', 'a condition de'],
          explain: 'Correct : à condition de pose une condition. Incorrect : bien que (concession) ou parce que (cause).',
        },
        {
          type: 'blank',
          q: 'Plusieurs villes ont banni les voitures polluantes, ________ Lyon et Bordeaux.',
          answers: ['notamment', 'par exemple'],
          explain: 'Correct : notamment / par exemple illustrent. Incorrect : néanmoins (opposition).',
        },
        {
          type: 'blank',
          q: '________, la réforme répond aux attentes écologiques.',
          answers: ['en somme', 'en conclusion', 'pour résumer'],
          explain: 'Correct : en somme / en conclusion / pour résumer synthétisent. Incorrect : de plus (ajout).',
        },
        {
          type: 'blank',
          q: 'Il n\'a pas refusé par orgueil, ________ par pudeur.',
          answers: ['mais plutôt'],
          explain: 'Correct : mais plutôt corrige la cause. Incorrect : car (simple cause) ou donc (conséquence).',
        },
        {
          type: 'blank',
          q: '________ les réserves d\'eau diminuent, il faut économiser.',
          answers: ['vu que', 'puisque', 'étant donné que', 'etant donné que'],
          explain: 'Correct : vu que / puisque / étant donné que = cause admise. Incorrect : afin que (but).',
        },
        {
          type: 'blank',
          q: '________ l\'exercice renforce le corps, l\'étude stimule la mémoire.',
          answers: ['de même que', 'tout comme'],
          explain: 'Correct : de même que / tout comme = comparaison. Incorrect : parce que (cause).',
        },
      ],
    },
    {
      id: 'fill-blank-50-p2',
      title: 'Textes à trous — Accords du participe passé',
      minutes: 15,
      theory: [
        'Lis la phrase entière avant de remplir le trou.',
        'Une ou plusieurs réponses peuvent être acceptées (synonymes).',
        'Après validation, lis l\'explication pour comprendre la règle.',
      ],
      examples: [
        { bad: 'Laisser le trou vide et passer', good: 'Proposer une forme, puis vérifier la règle' },
      ],
      quiz: [
        {
          type: 'blank',
          q: 'Les lettres que j\'ai ________ (écrire) sont parties ce matin.',
          answers: ['écrites', 'ecrites'],
          explain: 'Correct : écrites — COD « que » (= les lettres) avant avoir → accord fém. pluriel.',
        },
        {
          type: 'blank',
          q: 'Elle s\'est ________ (laver) les mains.',
          answers: ['lavé', 'lave'],
          explain: 'Correct : lavé invariable — COD « les mains » après ; se = COI.',
        },
        {
          type: 'blank',
          q: 'Elles se sont ________ (voir) au marché.',
          answers: ['vues'],
          explain: 'Correct : vues — se = COD avant le verbe → accord.',
        },
        {
          type: 'blank',
          q: 'Ils se sont ________ (téléphoner) hier.',
          answers: ['téléphoné', 'telephone'],
          explain: 'Correct : téléphoné invariable — téléphoner à → se = COI.',
        },
        {
          type: 'blank',
          q: 'La chanson que j\'ai ________ (entendre) chanter était magnifique.',
          answers: ['entendu'],
          explain: 'Correct : entendu invariable — la chanson subit l\'action de l\'infinitif.',
        },
        {
          type: 'blank',
          q: 'La comédienne que j\'ai ________ (entendre) jouer était formidable.',
          answers: ['entendue'],
          explain: 'Correct : entendue — la comédienne fait l\'action de jouer → accord avec le COD.',
        },
        {
          type: 'blank',
          q: 'Elle s\'est ________ (rendre) compte de son erreur.',
          answers: ['rendu'],
          explain: 'Correct : rendu invariable — « compte » est le COD placé après.',
        },
        {
          type: 'blank',
          q: 'Les efforts que ce travail a ________ (exiger) étaient énormes.',
          answers: ['exigés', 'exiges'],
          explain: 'Correct : exigés — COD « que » (= efforts) avant avoir.',
        },
        {
          type: 'blank',
          q: 'Elle s\'est ________ (tordre) la cheville.',
          answers: ['tordu'],
          explain: 'Correct : tordu invariable — COD « la cheville » après le verbe.',
        },
        {
          type: 'blank',
          q: 'Sa cheville, il se l\'est ________ (tordre).',
          answers: ['tordue'],
          explain: 'Correct : tordue — le pronom « l\' » (= cheville) est COD avant le verbe.',
        },
      ],
    },
    {
      id: 'fill-blank-50-p3',
      title: 'Textes à trous — Subjonctif et indicatif',
      minutes: 15,
      theory: [
        'Lis la phrase entière avant de remplir le trou.',
        'Une ou plusieurs réponses peuvent être acceptées (synonymes).',
        'Après validation, lis l\'explication pour comprendre la règle.',
      ],
      examples: [
        { bad: 'Laisser le trou vide et passer', good: 'Proposer une forme, puis vérifier la règle' },
      ],
      quiz: [
        {
          type: 'blank',
          q: 'Il faut que vous ________ (finir) vos devoirs.',
          answers: ['finissiez'],
          explain: 'Correct : finissiez — il faut que → subjonctif (2e groupe, vous).',
        },
        {
          type: 'blank',
          q: 'Je doute qu\'elle ________ (venir) demain.',
          answers: ['vienne'],
          explain: 'Correct : vienne — doute → subjonctif.',
        },
        {
          type: 'blank',
          q: 'Je ne pense pas qu\'il ________ (avoir) raison.',
          answers: ['ait'],
          explain: 'Correct : ait — penser à la négative → subjonctif.',
        },
        {
          type: 'blank',
          q: 'Bien qu\'il ________ (être) fatigué, il continue.',
          answers: ['soit'],
          explain: 'Correct : soit — bien que → subjonctif.',
        },
        {
          type: 'blank',
          q: 'J\'espère qu\'il ________ (réussir) l\'examen.',
          answers: ['réussira', 'reussira', 'réussit', 'reussit'],
          explain: 'Correct : réussira / réussit — espérer affirmatif → indicatif (pas le subjonctif).',
        },
        {
          type: 'blank',
          q: 'Pour que le projet ________ (avancer), il faut collaborer.',
          answers: ['avance'],
          explain: 'Correct : avance — pour que → subjonctif.',
        },
        {
          type: 'blank',
          q: 'Il est important que nous ________ (prendre) une décision.',
          answers: ['prenions'],
          explain: 'Correct : prenions — nécessité / jugement → subjonctif.',
        },
        {
          type: 'blank',
          q: 'Je suis sûr qu\'il ________ (comprendre) la situation.',
          answers: ['comprend'],
          explain: 'Correct : comprend — certitude → indicatif.',
        },
        {
          type: 'blank',
          q: 'Quoiqu\'elle ________ (être) malade, elle travaille.',
          answers: ['soit'],
          explain: 'Correct : soit — quoique → subjonctif.',
        },
        {
          type: 'blank',
          q: 'C\'est le seul livre que je ________ (pouvoir) trouver.',
          answers: ['puisse'],
          explain: 'Correct : puisse — le seul que → souvent subjonctif.',
        },
      ],
    },
    {
      id: 'fill-blank-50-p4',
      title: 'Textes à trous — Homophones',
      minutes: 15,
      theory: [
        'Lis la phrase entière avant de remplir le trou.',
        'Une ou plusieurs réponses peuvent être acceptées (synonymes).',
        'Après validation, lis l\'explication pour comprendre la règle.',
      ],
      examples: [
        { bad: 'Laisser le trou vide et passer', good: 'Proposer une forme, puis vérifier la règle' },
      ],
      quiz: [
        {
          type: 'blank',
          q: 'Il ________ (a/à) oublié son rendez-vous.',
          answers: ['a'],
          explain: 'Correct : a = verbe avoir. « à » est la préposition.',
        },
        {
          type: 'blank',
          q: 'Vas-tu à Paris ________ (ou/où) à Lyon ?',
          answers: ['ou'],
          explain: 'Correct : ou = conjonction de choix. « où » marque le lieu.',
        },
        {
          type: 'blank',
          q: 'La ville ________ (ou/où) il habite est calme.',
          answers: ['où'],
          explain: 'Correct : où = lieu/moment. « ou » sans accent est la conjonction de choix.',
        },
        {
          type: 'blank',
          q: '________ (Son/Sont) frère est arrivé hier.',
          answers: ['son'],
          explain: 'Correct : son = déterminant possessif. « sont » = verbe être.',
        },
        {
          type: 'blank',
          q: '________ (Ces/Ses) documents appartiennent à l\'entreprise.',
          answers: ['ces'],
          explain: 'Correct : ces = démonstratif. « ses » = possessif.',
        },
        {
          type: 'blank',
          q: '________ (On/Ont) a tous besoin de repos.',
          answers: ['on'],
          explain: 'Correct : on = pronom indéfini. « ont » = verbe avoir.',
        },
        {
          type: 'blank',
          q: '________ (C\'est/S\'est) un excellent résultat.',
          answers: ['c\'est', 'c’est'],
          explain: 'Correct : c\'est = ce + est. « s\'est » est une forme pronominale.',
        },
        {
          type: 'blank',
          q: 'Il ________ (et/est) motivé pour réussir.',
          answers: ['est'],
          explain: 'Correct : est = verbe être. « et » est la conjonction de coordination.',
        },
        {
          type: 'blank',
          q: 'Il y a une ________ (tache/tâche) sur le mur.',
          answers: ['tache'],
          explain: 'Correct : tache = salissure. « tâche » (avec accent) = travail à faire.',
        },
        {
          type: 'blank',
          q: 'J\'entends des ________ (voix/voies) dans la nuit.',
          answers: ['voix'],
          explain: 'Correct : voix = sons. « voies » = chemins / routes.',
        },
      ],
    },
    {
      id: 'fill-blank-50-p5',
      title: 'Textes à trous — Conjugaison (temps)',
      minutes: 15,
      theory: [
        'Lis la phrase entière avant de remplir le trou.',
        'Une ou plusieurs réponses peuvent être acceptées (synonymes).',
        'Après validation, lis l\'explication pour comprendre la règle.',
      ],
      examples: [
        { bad: 'Laisser le trou vide et passer', good: 'Proposer une forme, puis vérifier la règle' },
      ],
      quiz: [
        {
          type: 'blank',
          q: 'Demain, je ________ (partir) tôt.',
          answers: ['partirai'],
          explain: 'Correct : partirai — futur simple.',
        },
        {
          type: 'blank',
          q: 'Si j\'avais le temps, je ________ (venir).',
          answers: ['viendrais'],
          explain: 'Correct : viendrais — conditionnel présent (hypothèse).',
        },
        {
          type: 'blank',
          q: 'Quand j\'________ (être) petit, je jouais dehors.',
          answers: ['étais', 'etais'],
          explain: 'Correct : étais — imparfait (habitude / description passée).',
        },
        {
          type: 'blank',
          q: 'Vous ________ (courir) le marathon dimanche prochain.',
          answers: ['courrez'],
          explain: 'Correct : courrez — futur de courir (double r).',
        },
        {
          type: 'blank',
          q: 'Il ________ (falloir) patienter encore un peu.',
          answers: ['faudra'],
          explain: 'Correct : faudra — futur de falloir.',
        },
        {
          type: 'blank',
          q: 'Nous ________ (manger) ensemble quand tu as appelé.',
          answers: ['mangions'],
          explain: 'Correct : mangions — imparfait (action en cours / cadre).',
        },
        {
          type: 'blank',
          q: 'J\'________ (envoyer) le dossier dès que possible.',
          answers: ['enverrai'],
          explain: 'Correct : enverrai — futur irrégulier (enverr-).',
        },
        {
          type: 'blank',
          q: 'Ils ________ (pouvoir) vous aider si vous le demandiez.',
          answers: ['pourraient'],
          explain: 'Correct : pourraient — conditionnel de pouvoir.',
        },
        {
          type: 'blank',
          q: 'Tu ________ (savoir) la vérité un jour.',
          answers: ['sauras'],
          explain: 'Correct : sauras — futur de savoir.',
        },
        {
          type: 'blank',
          q: 'Il ________ (pleuvoir) demain selon la météo.',
          answers: ['pleuvra'],
          explain: 'Correct : pleuvra — futur de pleuvoir.',
        },
      ],
    },
  ],
}
