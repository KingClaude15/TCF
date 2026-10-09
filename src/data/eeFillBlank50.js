/**
 * Fill-in-the-blank bank (50 questions) — detailed explanations.
 * type: 'blank' — answers[] accepted (normalized on check).
 */

export const FILL_BLANK_50_MODULE = {
  id: 'fill-blank-50',
  title: 'Textes à trous (50 questions)',
  icon: '✍️',
  color: 'ee',
  description: 'Complète les phrases : connecteurs, accords, modes, homophones, conjugaison. Explications détaillées après chaque réponse.',
  lessons: [
    {
      id: 'fill-blank-50-p1',
      title: 'Textes à trous — Connecteurs logiques',
      minutes: 18,
      theory: [
        'Lis toute la phrase avant de remplir le trou.',
        'Plusieurs graphies peuvent être acceptées (synonymes).',
        'Après validation, lis toute l\'explication : règle, contrastes et astuce EE.',
      ],
      examples: [
        { bad: 'Répondre trop vite sans lire la fin de la phrase', good: 'Identifier le déclencheur (connecteur, COD avant/après, temps…)' },
      ],
      quiz: [
        {
          type: 'blank',
          q: 'Il a beaucoup travaillé ; ________, ses résultats restent faibles.',
          answers: ['toutefois', 'néanmoins', 'cependant'],
          explain: 'Correct : toutefois, néanmoins ou cependant.\n\nCette phrase oppose deux idées : un effort important (« il a beaucoup travaillé ») et un résultat décevant (« ses résultats restent faibles »). On a besoin d’un connecteur d’opposition / de restriction.\n\n• toutefois / néanmoins / cependant = « malgré cela », « en revanche avec nuance ».\n• Incorrect : donc / c’est pourquoi (conséquence) — le second membre n’est pas le résultat logique du premier, c’est un contraste.\n• Incorrect : car / parce que (cause) — on n’explique pas pourquoi il a travaillé.\n• Incorrect : de plus (ajout) — on n’ajoute pas un argument dans le même sens.\n\nAstuce EE : après un constat positif suivi d’un point faible, pense à toutefois / néanmoins.',
        },
        {
          type: 'blank',
          q: 'La pollution augmente. ________, il faut agir rapidement.',
          answers: ['c\'est pourquoi', 'c’est pourquoi', 'par conséquent', 'donc'],
          explain: 'Correct : c’est pourquoi, par conséquent ou donc.\n\nLe premier énoncé pose un fait (la pollution augmente). Le second en tire une conclusion / une action nécessaire. C’est une relation de conséquence.\n\n• c’est pourquoi = « voilà pourquoi » (très naturel à l’écrit).\n• par conséquent = registre un peu plus soutenu, idéal en Tâche 3.\n• donc = correct aussi, un peu plus oral / neutre.\n• Incorrect : car / parce que / puisque — ils introduisent une cause, alors que la cause est déjà dans la première phrase.\n• Incorrect : bien que / toutefois — opposition, pas déduction.\n\nAstuce : si tu peux remplacer par « alors », c’est souvent une conséquence.',
        },
        {
          type: 'blank',
          q: '________ le coût soit élevé, cet investissement est rentable.',
          answers: ['bien que', 'quoique'],
          explain: 'Correct : bien que ou quoique (+ subjonctif : soit).\n\nOn admet un obstacle (coût élevé) sans annuler la conclusion (investissement rentable). C’est une concession.\n\n• bien que / quoique exigent le subjonctif : « bien que le coût soit élevé ».\n• Incorrect : parce que — ce serait une cause, pas une concession.\n• Incorrect : afin que — exprime un but (« pour que »).\n• Incorrect : si — condition, pas concession.\n\nAstuce EE : concession = « oui, il y a un problème, MAIS… ». Formules utiles : bien que, quoique, même si, certes… mais.',
        },
        {
          type: 'blank',
          q: 'Mangez plus de fruits. ________, buvez suffisamment d\'eau.',
          answers: ['de plus', 'en outre', 'par ailleurs'],
          explain: 'Correct : de plus, en outre ou par ailleurs.\n\nLes deux conseils vont dans le même sens (bonnes habitudes de santé). On ajoute un argument / une recommandation.\n\n• de plus = ajout simple et fréquent.\n• en outre = un peu plus soutenu.\n• par ailleurs = ajoute un autre aspect, toujours dans une logique d’accumulation.\n• Incorrect : toutefois / en revanche — opposition alors qu’il n’y a pas de contraste.\n• Incorrect : c’est pourquoi — ce n’est pas une conséquence du premier conseil.\n\nAstuce : si les deux phrases disent « et aussi », choisis un connecteur d’addition.',
        },
        {
          type: 'blank',
          q: '________ réglementer l\'usage de l\'IA, les risques diminueront.',
          answers: ['à condition de', 'a condition de'],
          explain: 'Correct : à condition de (+ infinitif).\n\nLe résultat (diminution des risques) dépend d’une condition préalable (réglementer). Structure : à condition de + infinitif.\n\n• On pourrait aussi dire « à condition que l’on réglement e » (+ subjonctif), mais ici le trou précède un infinitif → à condition de.\n• Incorrect : bien que — concession, pas condition.\n• Incorrect : parce que — cause, pas condition.\n• Incorrect : afin de — but (« pour réglementer »), alors qu’ici réglementer est la condition du résultat.\n\nAstuce : condition = « seulement si… ». But = « dans le but de… ».',
        },
        {
          type: 'blank',
          q: 'Plusieurs villes ont banni les voitures polluantes, ________ Lyon et Bordeaux.',
          answers: ['notamment', 'par exemple'],
          explain: 'Correct : notamment ou par exemple.\n\nAprès une affirmation générale (« plusieurs villes »), on cite des cas concrets. C’est une illustration.\n\n• notamment = « en particulier » (souvent pour 1 ou 2 exemples saillants).\n• par exemple = introduction classique d’exemple(s).\n• Incorrect : néanmoins — opposition.\n• Incorrect : c’est pourquoi — conséquence.\n• Incorrect : car — cause.\n\nAstuce EE Tâche 2/3 : après une idée abstraite, un notamment / par exemple rend le texte plus concret et convaincant.',
        },
        {
          type: 'blank',
          q: '________, la réforme répond aux attentes écologiques.',
          answers: ['en somme', 'en conclusion', 'pour résumer'],
          explain: 'Correct : en somme, en conclusion ou pour résumer.\n\nLe connecteur ouvre une phrase de synthèse / clôture argumentative. On récapitule.\n\n• en somme = « en résumé ».\n• en conclusion / pour résumer = clôture plus explicite (très utile en fin de Tâche 3).\n• Incorrect : de plus — on n’ajoute pas un nouvel argument, on conclut.\n• Incorrect : or — introduit un fait nouveau dans un raisonnement, pas une synthèse.\n\nAstuce : réserve ces formules pour la dernière partie de ton texte d’opinion.',
        },
        {
          type: 'blank',
          q: 'Il n\'a pas refusé par orgueil, ________ par pudeur.',
          answers: ['mais plutôt'],
          explain: 'Correct : mais plutôt.\n\nOn corrige une fausse cause (orgueil) pour la remplacer par la vraie (pudeur). Structure de reformulation contrastive.\n\n• mais plutôt = « non pas X, mais Y ».\n• Incorrect : car — n’exprime pas la correction d’une cause.\n• Incorrect : donc — conséquence.\n• Incorrect : voire — gradation, pas substitution de cause.\n\nAstuce : utile quand tu nuancés une explication dans une argumentation.',
        },
        {
          type: 'blank',
          q: '________ les réserves d\'eau diminuent, il faut économiser.',
          answers: ['vu que', 'puisque', 'étant donné que', 'etant donné que'],
          explain: 'Correct : vu que, puisque ou étant donné que.\n\nLe premier membre donne le motif (fait présenté comme établi). Le second en tire une obligation. C’est une cause.\n\n• puisque / vu que / étant donné que = cause « évidente » ou admise.\n• Incorrect : afin que — but (+ subjonctif), pas cause.\n• Incorrect : bien que — concession.\n• Incorrect : donc seul en tête ici serait plutôt une conséquence inversée.\n\nDifférence utile : parce que répond souvent à « pourquoi ? » ; puisque suppose que l’interlocuteur connaît déjà le fait.',
        },
        {
          type: 'blank',
          q: '________ l\'exercice renforce le corps, l\'étude stimule la mémoire.',
          answers: ['de même que', 'tout comme'],
          explain: 'Correct : de même que ou tout comme.\n\nOn met en parallèle deux situations pour faire accepter la seconde par analogie.\n\n• de même que A, B = comparaison structurée, registre soutenu.\n• tout comme = équivalent un peu plus souple.\n• Incorrect : parce que — ce n’est pas une relation de cause.\n• Incorrect : alors que — opposition / contraste, pas analogie.\n\nAstuce EE : l’analogie renforce une thèse sans preuve chiffrée (« de même que…, de même… »).',
        },
      ],
    },
    {
      id: 'fill-blank-50-p2',
      title: 'Textes à trous — Accords du participe passé',
      minutes: 18,
      theory: [
        'Lis toute la phrase avant de remplir le trou.',
        'Plusieurs graphies peuvent être acceptées (synonymes).',
        'Après validation, lis toute l\'explication : règle, contrastes et astuce EE.',
      ],
      examples: [
        { bad: 'Répondre trop vite sans lire la fin de la phrase', good: 'Identifier le déclencheur (connecteur, COD avant/après, temps…)' },
      ],
      quiz: [
        {
          type: 'blank',
          q: 'Les lettres que j\'ai ________ (écrire) sont parties ce matin.',
          answers: ['écrites', 'ecrites'],
          explain: 'Correct : écrites.\n\nRègle : avec l’auxiliaire avoir, le participe passé s’accorde avec le COD si celui-ci est placé avant le verbe.\n\n1) Quel est le COD de « ai écrit » ? → « que » (= les lettres).\n2) Où est-il ? → avant le verbe.\n3) Genre / nombre de « lettres » → féminin pluriel → écrites.\n\nIncorrect : écrit (oubli d’accord) ; écrite (singulier) ; écrits (masculin).\n\nAstuce : transforme en question « j’ai écrit quoi ? » → les lettres (avant) → accord.',
        },
        {
          type: 'blank',
          q: 'Elle s\'est ________ (laver) les mains.',
          answers: ['lavé', 'lave'],
          explain: 'Correct : lavé (invariable).\n\nVerbe pronominal : il faut savoir si « se » est COD ou COI.\n\n• Elle a lavé quoi ? → les mains (COD placé après).\n• « se » = à elle-même → COI.\n• Quand le COD est après et que « se » est COI, le participe ne s’accorde pas → lavé.\n\nIncorrect : lavée (accord fautif avec « elle ») ; lavées (accord fautif avec « mains » alors que le COD n’est pas avant le participe de la même façon dans cette analyse standard scolaire : on n’accorde pas ici).\n\nCompare : « Elle s’est lavée » (sans COD après, se = COD) → lavée.',
        },
        {
          type: 'blank',
          q: 'Elles se sont ________ (voir) au marché.',
          answers: ['vues'],
          explain: 'Correct : vues.\n\n• Elles ont vu qui ? → se (= elles-mêmes) → « se » est COD.\n• COD placé avant → accord avec elles → féminin pluriel → vues.\n\nIncorrect : vu (pas d’accord) ; vus (masculin).\n\nAstuce : « se » + verbe de perception/réciproque souvent COD → accord.',
        },
        {
          type: 'blank',
          q: 'Ils se sont ________ (téléphoner) hier.',
          answers: ['téléphoné', 'telephone', 'téléphone'],
          explain: 'Correct : téléphoné (invariable).\n\n• On téléphone à quelqu’un → complément d’objet indirect.\n• « se » = l’un à l’autre → COI.\n• Pas de COD direct avant le verbe → pas d’accord → téléphoné.\n\nIncorrect : téléphonés (accord erroné, très fréquent).\n\nMême logique : se parler, se mentir, se plaire (souvent invariable selon le sens COI).',
        },
        {
          type: 'blank',
          q: 'La chanson que j\'ai ________ (entendre) chanter était magnifique.',
          answers: ['entendu'],
          explain: 'Correct : entendu (invariable).\n\nConstruction : verbe de perception + infinitif.\n\n• « que » reprend « la chanson ».\n• La chanson ne chante pas : elle est chantée (elle subit l’action de l’infinitif).\n• Dans ce cas, le participe de perception reste invariable → entendu.\n\nIncorrect : entendue (accord fautif avec chanson).\n\nCompare avec la question suivante (comédienne qui joue) où l’accord se fait.',
        },
        {
          type: 'blank',
          q: 'La comédienne que j\'ai ________ (entendre) jouer était formidable.',
          answers: ['entendue'],
          explain: 'Correct : entendue.\n\nMême structure « entendre + infinitif », mais le sens change :\n\n• La comédienne fait l’action de jouer (elle est sujet de l’infinitif).\n• « que » (= la comédienne) est COD de « ai entendue » et agent de « jouer ».\n• Accord avec le COD féminin singulier → entendue.\n\nIncorrect : entendu.\n\nRepère : si tu peux dire « j’ai entendu la comédienne qui jouait » → accord.',
        },
        {
          type: 'blank',
          q: 'Elle s\'est ________ (rendre) compte de son erreur.',
          answers: ['rendu'],
          explain: 'Correct : rendu (invariable).\n\nExpression figée : se rendre compte de.\n\n• « compte » est le COD de « rendre », placé après.\n• « se » fonctionne comme COI.\n• Participe invariable → rendu.\n\nIncorrect : rendue / rendus (accords fréquents mais fautifs).\n\nÀ retenir tel quel : elle s’est rendu compte ; ils se sont rendu compte.',
        },
        {
          type: 'blank',
          q: 'Les efforts que ce travail a ________ (exiger) étaient énormes.',
          answers: ['exigés', 'exiges'],
          explain: 'Correct : exigés.\n\n• COD = « que » (= les efforts), placé avant « a exigé ».\n• Auxiliaire avoir + COD avant → accord.\n• efforts = masculin pluriel → exigés.\n\nIncorrect : exigé (oubli) ; exigées (féminin).',
        },
        {
          type: 'blank',
          q: 'Elle s\'est ________ (tordre) la cheville.',
          answers: ['tordu'],
          explain: 'Correct : tordu (invariable).\n\n• Elle a tordu quoi ? → la cheville (COD après le verbe).\n• « se » = à elle-même → COI.\n• COD après → pas d’accord → tordu.\n\nIncorrect : tordue (accord avec elle ou cheville mal appliqué).\n\nCompare la phrase suivante où le COD pronominal est avant.',
        },
        {
          type: 'blank',
          q: 'Sa cheville, il se l\'est ________ (tordre).',
          answers: ['tordue'],
          explain: 'Correct : tordue.\n\n• « l’ » reprend « sa cheville » (féminin singulier).\n• Ce pronom est COD et placé avant le verbe.\n• Accord du participe → tordue.\n\nIncorrect : tordu (oubli d’accord alors que le COD est avant).\n\nRègle récapitulative : COD avant = accord ; COD après = pas d’accord (avec avoir / pronominal COI).',
        },
      ],
    },
    {
      id: 'fill-blank-50-p3',
      title: 'Textes à trous — Subjonctif et indicatif',
      minutes: 18,
      theory: [
        'Lis toute la phrase avant de remplir le trou.',
        'Plusieurs graphies peuvent être acceptées (synonymes).',
        'Après validation, lis toute l\'explication : règle, contrastes et astuce EE.',
      ],
      examples: [
        { bad: 'Répondre trop vite sans lire la fin de la phrase', good: 'Identifier le déclencheur (connecteur, COD avant/après, temps…)' },
      ],
      quiz: [
        {
          type: 'blank',
          q: 'Il faut que vous ________ (finir) vos devoirs.',
          answers: ['finissiez'],
          explain: 'Correct : finissiez.\n\n• Déclencheur : il faut que → subjonctif (nécessité).\n• finir = 2e groupe : radical finiss- au subjonctif présent.\n• vous → terminaison -iez → finissiez.\n\nIncorrect : finissez (indicatif présent) ; finiriez (conditionnel).\n\nAutres déclencheurs du même type : il est nécessaire que, il vaut mieux que, vouloir que, ordonner que.',
        },
        {
          type: 'blank',
          q: 'Je doute qu\'elle ________ (venir) demain.',
          answers: ['vienne'],
          explain: 'Correct : vienne.\n\n• Déclencheur : douter que → incertitude → subjonctif.\n• venir au subjonctif présent, 3e personne : qu’elle vienne (radical vienn- / forme irrégulière).\n\nIncorrect : vient (indicatif) ; viendra (futur) ; venait (imparfait).\n\nMême logique : je ne suis pas sûr que, il est possible que, il semble que (souvent).',
        },
        {
          type: 'blank',
          q: 'Je ne pense pas qu\'il ________ (avoir) raison.',
          answers: ['ait'],
          explain: 'Correct : ait.\n\n• penser que à la forme affirmative → souvent indicatif (fait présenté comme vrai).\n• penser que à la forme négative (je ne pense pas que) → subjonctif (doute).\n• avoir au subjonctif, 3e personne : qu’il ait.\n\nIncorrect : a (indicatif) ; aura (futur) ; aurait (conditionnel).\n\nAstuce : négation / interrogation sur l’opinion → subjonctif fréquent.',
        },
        {
          type: 'blank',
          q: 'Bien qu\'il ________ (être) fatigué, il continue.',
          answers: ['soit'],
          explain: 'Correct : soit.\n\n• bien que → concession → subjonctif obligatoire.\n• être au subjonctif : que je sois, que tu sois, qu’il soit…\n\nIncorrect : est (indicatif) ; était (imparfait) ; serait (conditionnel).\n\nMême famille : quoique, encore que, sans que, jusqu’à ce que.',
        },
        {
          type: 'blank',
          q: 'J\'espère qu\'il ________ (réussir) l\'examen.',
          answers: ['réussira', 'reussira', 'réussit', 'reussit'],
          explain: 'Correct : réussira (ou réussit).\n\nPoint délicat : espérer que à la forme affirmative se construit avec l’indicatif, pas le subjonctif, en français standard moderne.\n\n• futur (réussira) ou présent (réussit) selon le sens.\n• Incorrect : réussisse (subjonctif — fréquent chez les apprenants, mais non requis ici).\n\nCompare : je souhaite qu’il réussisse → subjonctif (souhait).',
        },
        {
          type: 'blank',
          q: 'Pour que le projet ________ (avancer), il faut collaborer.',
          answers: ['avance'],
          explain: 'Correct : avance.\n\n• pour que → but → subjonctif.\n• avancer, 3e personne du subjonctif présent : qu’il avance.\n\nIncorrect : avance à l’indicatif dans un autre contexte sans « pour que » ; avancera (futur indicatif) ne suit pas « pour que ».\n\nÉquivalents : afin que, de sorte que (but), de crainte que.',
        },
        {
          type: 'blank',
          q: 'Il est important que nous ________ (prendre) une décision.',
          answers: ['prenions'],
          explain: 'Correct : prenions.\n\n• il est important que → jugement / nécessité → subjonctif.\n• prendre, nous, subjonctif : radical pren- + -ions (comme l’imparfait) → prenions.\n\nIncorrect : prenons (indicatif) ; prendrons (futur).\n\nMême schéma : il est essentiel / crucial / souhaitable / dommage que.',
        },
        {
          type: 'blank',
          q: 'Je suis sûr qu\'il ________ (comprendre) la situation.',
          answers: ['comprend'],
          explain: 'Correct : comprend.\n\n• être sûr que / il est certain que / il est clair que → fait présenté comme certain → indicatif.\n• présent : il comprend.\n\nIncorrect : comprenne (subjonctif — réservé au doute / à la volonté, pas à la certitude forte).\n\nAstuce : certitude → indicatif ; doute / volonté / but / concession → subjonctif.',
        },
        {
          type: 'blank',
          q: 'Quoiqu\'elle ________ (être) malade, elle travaille.',
          answers: ['soit'],
          explain: 'Correct : soit.\n\n• quoique = bien que → concession → subjonctif.\n• être : qu’elle soit.\n\nAttention orthographe : quoique (un mot) ≠ quoi que (deux mots : « quoi que vous fassiez »).\n\nIncorrect : est ; était ; serait.',
        },
        {
          type: 'blank',
          q: 'C\'est le seul livre que je ________ (pouvoir) trouver.',
          answers: ['puisse'],
          explain: 'Correct : puisse.\n\nAprès un superlatif ou une expression d’unicité (le seul, le premier, le dernier + que), le français emploie souvent le subjonctif pour marquer une évaluation / une restriction.\n\n• pouvoir au subjonctif : que je puisse.\n\nIncorrect : peux (indicatif) ; pourrai (futur).\n\nNuance : si l’antécédent est clairement identifié comme réel et sans évaluation, l’indicatif apparaît parfois ; en EE, le subjonctif est la forme attendue ici.',
        },
      ],
    },
    {
      id: 'fill-blank-50-p4',
      title: 'Textes à trous — Homophones',
      minutes: 18,
      theory: [
        'Lis toute la phrase avant de remplir le trou.',
        'Plusieurs graphies peuvent être acceptées (synonymes).',
        'Après validation, lis toute l\'explication : règle, contrastes et astuce EE.',
      ],
      examples: [
        { bad: 'Répondre trop vite sans lire la fin de la phrase', good: 'Identifier le déclencheur (connecteur, COD avant/après, temps…)' },
      ],
      quiz: [
        {
          type: 'blank',
          q: 'Il ________ (a/à) oublié son rendez-vous.',
          answers: ['a'],
          explain: 'Correct : a (sans accent).\n\n• a = forme du verbe avoir (il a oublié = il avait oublié ? test : on peut dire « il a oublié » / « il avait »).\n• à (avec accent) = préposition (à Paris, à 15 h, penser à).\n\nTest rapide : remplace par avait. Si la phrase reste possible → a. Sinon → à.\n\nIci : « il avait oublié » fonctionne → a.',
        },
        {
          type: 'blank',
          q: 'Vas-tu à Paris ________ (ou/où) à Lyon ?',
          answers: ['ou'],
          explain: 'Correct : ou (sans accent).\n\n• ou = conjonction de choix (« ou bien »).\n• où = lieu ou moment (la ville où…, le jour où…).\n\nTest : remplace par « ou bien ». « Vas-tu à Paris ou bien à Lyon ? » → oui → ou.\n\nIncorrect : où (on ne demande pas le lieu dans le connecteur de choix).',
        },
        {
          type: 'blank',
          q: 'La ville ________ (ou/où) il habite est calme.',
          answers: ['où'],
          explain: 'Correct : où (avec accent).\n\n• où reprend un lieu (la ville) dans une relative.\n• Test « ou bien » : « la ville ou bien il habite » → absurde → pas ou.\n\nIncorrect : ou.\n\nAutres emplois de où : le moment où, c’est là où…',
        },
        {
          type: 'blank',
          q: '________ (Son/Sont) frère est arrivé hier.',
          answers: ['son'],
          explain: 'Correct : son.\n\n• son = déterminant possessif (son frère, sa sœur, ses parents).\n• sont = verbe être, 3e personne du pluriel (ils sont).\n\nTest : remplace par « étaient ». « Étaient frère est arrivé » → impossible → son.\n\nIci un seul frère, déterminant → son.',
        },
        {
          type: 'blank',
          q: '________ (Ces/Ses) documents appartiennent à l\'entreprise.',
          answers: ['ces'],
          explain: 'Correct : ces.\n\n• ces = déterminant démonstratif (ces documents = ceux-ci / ceux dont on parle).\n• ses = possessif (ses documents = les documents de lui/elle).\n\nLe sens « appartiennent à l’entreprise » désigne des documents identifiés dans le contexte, pas forcément « les siens » → ces est la forme attendue.\n\nTest possessif : « les documents de qui ? » Si ce n’est pas clair → souvent ces.',
        },
        {
          type: 'blank',
          q: '________ (On/Ont) a tous besoin de repos.',
          answers: ['on'],
          explain: 'Correct : on.\n\n• on = pronom indéfini (équivalent de « quelqu’un / les gens / nous » selon le contexte).\n• ont = verbe avoir au pluriel (ils ont).\n\nTest : « ils avaient tous besoin » ne se substitue pas directement ici ; le sujet grammatical est on + verbe a.\n\nPhrase correcte : On a tous besoin de repos. (très courant à l’oral et à l’écrit semi-formel)',
        },
        {
          type: 'blank',
          q: '________ (C\'est/S\'est) un excellent résultat.',
          answers: ['c\'est', 'c’est'],
          explain: 'Correct : c’est.\n\n• c’est = ce + est (présentation / identification).\n• s’est = pronom réfléchi + est (il s’est levé, elle s’est trompée).\n\nAprès c’est, on attend surtout un nom, un pronom, un adjectif attribut : c’est un résultat.\n\nIncorrect : s’est (il faudrait un participe : s’est passé, etc.).',
        },
        {
          type: 'blank',
          q: 'Il ________ (et/est) motivé pour réussir.',
          answers: ['est'],
          explain: 'Correct : est.\n\n• est = verbe être (il est motivé).\n• et = conjonction (« et » = and).\n\nTest : remplace par « était ». « Il était motivé » → oui → est.\n\nIncorrect : et (casserait la phrase).',
        },
        {
          type: 'blank',
          q: 'Il y a une ________ (tache/tâche) sur le mur.',
          answers: ['tache'],
          explain: 'Correct : tache (sans accent circonflexe).\n\n• tache = salissure, marque.\n• tâche = travail à accomplir (une tâche difficile).\n\nLe contexte « sur le mur » désigne une salissure → tache.\n\nAstuce : tâche a un accent comme « un travail qui pèse ».',
        },
        {
          type: 'blank',
          q: 'J\'entends des ________ (voix/voies) dans la nuit.',
          answers: ['voix'],
          explain: 'Correct : voix.\n\n• voix = sons produits par les cordes vocales (entendre des voix).\n• voies = chemins, routes, moyens (les voies du Seigneur, voie ferrée).\n\nLe verbe entendre impose le sens « sons » → voix.\n\nIncorrect : voies.',
        },
      ],
    },
    {
      id: 'fill-blank-50-p5',
      title: 'Textes à trous — Conjugaison (temps)',
      minutes: 18,
      theory: [
        'Lis toute la phrase avant de remplir le trou.',
        'Plusieurs graphies peuvent être acceptées (synonymes).',
        'Après validation, lis toute l\'explication : règle, contrastes et astuce EE.',
      ],
      examples: [
        { bad: 'Répondre trop vite sans lire la fin de la phrase', good: 'Identifier le déclencheur (connecteur, COD avant/après, temps…)' },
      ],
      quiz: [
        {
          type: 'blank',
          q: 'Demain, je ________ (partir) tôt.',
          answers: ['partirai'],
          explain: 'Correct : partirai.\n\n• Repère temporel : demain → futur simple.\n• partir, futur : radical partir- + -ai → je partirai.\n\nIncorrect : partais (imparfait) ; partirais (conditionnel) ; pars (présent).\n\nFormation du futur : infinitif + terminaisons -ai -as -a -ons -ez -ont (avec irréguliers à apprendre).',
        },
        {
          type: 'blank',
          q: 'Si j\'avais le temps, je ________ (venir).',
          answers: ['viendrais'],
          explain: 'Correct : viendrais.\n\n• Système hypothétique : si + imparfait → conditionnel présent dans l’autre proposition.\n• venir au conditionnel : radical viendr- + -ais → je viendrais.\n\nIncorrect : viens (présent) ; viendrai (futur — hypothèse moins « irréelle ») ; venais (imparfait).\n\nStructure type EE : Si + imparfait, conditionnel.',
        },
        {
          type: 'blank',
          q: 'Quand j\'________ (être) petit, je jouais dehors.',
          answers: ['étais', 'etais'],
          explain: 'Correct : étais.\n\n• Description d’une habitude / d’un état dans le passé → imparfait.\n• être à l’imparfait : j’étais, tu étais, il était…\n\nIncorrect : fus (passé simple, rare à l’oral et en EE moderne) ; ai été (passé composé = événement ponctuel) ; serai (futur).\n\nRepères d’imparfait : quand j’étais petit, autrefois, chaque jour…',
        },
        {
          type: 'blank',
          q: 'Vous ________ (courir) le marathon dimanche prochain.',
          answers: ['courrez'],
          explain: 'Correct : courrez.\n\n• dimanche prochain → futur.\n• courir au futur double le r : je courrai, vous courrez.\n\nIncorrect : courez (présent) ; couriez (imparfait / subjonctif selon forme) ; courriez (conditionnel).\n\nMême famille d’irréguliers à double r : mourir → je mourrai ; courir → je courrai.',
        },
        {
          type: 'blank',
          q: 'Il ________ (falloir) patienter encore un peu.',
          answers: ['faudra'],
          explain: 'Correct : faudra.\n\n• falloir est impersonnel (seulement il).\n• futur : il faudra.\n• sens : nécessité future.\n\nIncorrect : fallait (imparfait) ; faudrait (conditionnel) ; faut (présent).\n\nTrès utile en EE pour conseiller : il faudra, il conviendra de…',
        },
        {
          type: 'blank',
          q: 'Nous ________ (manger) ensemble quand tu as appelé.',
          answers: ['mangions'],
          explain: 'Correct : mangions.\n\n• « quand tu as appelé » (passé composé) coupe une action en cours / un cadre → imparfait dans la proposition principale.\n• nous mangions (action déjà en cours au moment de l’appel).\n\nIncorrect : avons mangé (les deux actions seraient vues comme successives ponctuelles) ; mangerons (futur).\n\nSchéma classique : imparfait (décor) + passé composé (événement).',
        },
        {
          type: 'blank',
          q: 'J\'________ (envoyer) le dossier dès que possible.',
          answers: ['enverrai'],
          explain: 'Correct : enverrai.\n\n• dès que possible oriente vers le futur.\n• envoyer a un futur irrégulier : j’enverrai (radical enverr-).\n\nIncorrect : envoie (présent) ; envoyerai (forme régulière inventée) ; enverrais (conditionnel).\n\nÀ mémoriser avec : aperçevrai, recevrai… (autres irréguliers fréquents).',
        },
        {
          type: 'blank',
          q: 'Ils ________ (pouvoir) vous aider si vous le demandiez.',
          answers: ['pourraient'],
          explain: 'Correct : pourraient.\n\n• si vous le demandiez (imparfait) → conditionnel dans l’autre partie.\n• pouvoir au conditionnel : ils pourraient (radical pourr-).\n\nIncorrect : peuvent (présent) ; pourront (futur) ; pouvaient (imparfait).\n\nPolitesse EE : pourriez-vous… ? = conditionnel de politesse.',
        },
        {
          type: 'blank',
          q: 'Tu ________ (savoir) la vérité un jour.',
          answers: ['sauras'],
          explain: 'Correct : sauras.\n\n• un jour (à venir) → futur.\n• savoir au futur : radical saur- → tu sauras.\n\nIncorrect : sais (présent) ; savais (imparfait) ; saurais (conditionnel).\n\nNe pas confondre saura (futur) / saurait (conditionnel).',
        },
        {
          type: 'blank',
          q: 'Il ________ (pleuvoir) demain selon la météo.',
          answers: ['pleuvra'],
          explain: 'Correct : pleuvra.\n\n• demain → futur.\n• pleuvoir (impersonnel) au futur : il pleuvra (radical pleuvr-).\n\nIncorrect : pleut (présent) ; pleuvait (imparfait) ; pleuvrait (conditionnel).\n\nMême modèle que falloir / pleuvoir : formes surtout à la 3e personne.',
        },
      ],
    },
  ],
}
