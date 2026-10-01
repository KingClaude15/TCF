/**
 * Reconnaître les types d'arguments et connecteurs logiques — 19 MCQ
 * Explications affichées uniquement après réponse (LessonPlayer).
 */

export const CONNECTEURS_ARGS_BANK = {
  connecteurs: [
    {
      id: 'conn-types-args',
      title: 'Reconnaître les types d\'arguments et connecteurs logiques',
      minutes: 20,
      theory: [
        'Un connecteur annonce le rôle logique de l\'argument : ajout, cause, conséquence, concession, opposition, exemple, but, condition, conclusion, reformulation, comparaison.',
        'Ne confonds pas la cause (parce que, puisque, vu que) et la conséquence (donc, c\'est pourquoi, par conséquent).',
        'Concession (certes, bien que, néanmoins) : on admet un point sans abandonner la thèse.',
        'Illustration (par exemple, notamment, ainsi) : on concrétise une idée générale.',
      ],
      examples: [
        { bad: 'De plus = conséquence', good: 'De plus = ajout d\'un argument' },
        { bad: 'C\'est pourquoi = cause', good: 'C\'est pourquoi = conséquence logique' },
        { bad: 'Certes = simple affirmation', good: 'Certes = concession avant un mais' },
      ],
      quiz: [
        {
          q: '« De plus, une alimentation équilibrée renforce le système immunitaire. » Quel type d\'argument est introduit par le connecteur ?',
          options: ['Un argument de conséquence', 'Un argument additif', 'Un argument d\'opposition', 'Un argument de cause'],
          answer: 1,
          explain: 'Correct : « de plus » ajoute un argument supplémentaire (additif). Incorrect : ce n\'est pas une conséquence (donc, c\'est pourquoi), ni une opposition (en revanche), ni une cause (parce que, puisque).',
        },
        {
          q: '« En effet, les données climatiques des trente dernières années confirment le réchauffement global. » Quelle relation logique est établie ?',
          options: ['Un argument d\'opposition', 'Un argument de concession', 'Un argument de condition', 'Un argument de justification ou d\'explication'],
          answer: 3,
          explain: 'Correct : « en effet » introduit une preuve ou une explication qui justifie l\'affirmation précédente. Incorrect : opposition (en revanche), concession (bien que), condition (si, à condition que).',
        },
        {
          q: '« Certes, le coût initial des panneaux solaires est élevé, mais l\'investissement devient rentable après quelques années. » Fonction de « certes » ?',
          options: ['Un argument de cause', 'Un argument de comparaison', 'Un argument de concession', 'Un argument d\'illustration'],
          answer: 2,
          explain: 'Correct : « certes » reconnaît un point adverse avant de le contredire (concession). Incorrect : ce n\'est pas une cause, ni une comparaison, ni un exemple.',
        },
        {
          q: '« Ainsi, plusieurs pays européens ont réussi à réduire leur empreinte carbone de moitié. » Rôle du connecteur ?',
          options: ['Un argument d\'opposition', 'Un argument d\'illustration ou d\'exemple', 'Un argument de condition', 'Un argument de cause'],
          answer: 1,
          explain: 'Correct : ici « ainsi » introduit un exemple concret pour appuyer une idée générale. Incorrect : ce n\'est pas une opposition, une condition ni une cause dans ce contexte.',
        },
        {
          q: '« Bien que les énergies renouvelables soient intermittentes, elles restent indispensables pour la transition énergétique. » Type d\'argument ?',
          options: ['Un argument de cause', 'Un argument de concession', 'Un argument d\'addition', 'Un argument de conséquence'],
          answer: 1,
          explain: 'Correct : « bien que » admet une objection sans annuler la thèse (concession). Incorrect : cause (parce que), addition (de plus), conséquence (donc).',
        },
        {
          q: '« En revanche, la seconde proposition implique un coût financier disproportionné. » Type d\'argument ?',
          options: ['Un argument d\'opposition', 'Un argument de cause', 'Un argument de conclusion', 'Un argument de justification'],
          answer: 0,
          explain: 'Correct : « en revanche » marque un contraste net (opposition). Incorrect : ce n\'est pas une cause, une conclusion ni une simple justification.',
        },
        {
          q: '« Puisque le télétravail réduit les déplacements, il contribue directement à la baisse des émissions polluantes. » Valeur de l\'argument ?',
          options: ['Un argument de concession', 'Un argument de condition', 'Un argument de cause avérée', 'Un argument de conséquence'],
          answer: 2,
          explain: 'Correct : « puisque » introduit une cause présentée comme admise. Incorrect : concession (bien que), condition (si), conséquence (c\'est pourquoi — ici la conséquence est dans la principale, pas dans le connecteur « puisque »).',
        },
        {
          q: '« Afin de protéger la biodiversité marine, la création de réserves naturelles doit être accélérée. » Type d\'argument ?',
          options: ['Un argument de comparaison', 'Un argument de concession', 'Un argument de cause', 'Un argument de finalité ou de but'],
          answer: 3,
          explain: 'Correct : « afin de » indique le but / l\'objectif. Incorrect : comparaison (comme), concession (bien que), cause (parce que).',
        },
        {
          q: '« À condition de réglementer strictement son usage, l\'intelligence artificielle représentera un progrès majeur. » Type d\'argument ?',
          options: ['Un argument d\'opposition', 'Un argument de condition ou d\'hypothèse', 'Un argument de cause', 'Un argument de conclusion'],
          answer: 1,
          explain: 'Correct : « à condition de » pose un prérequis (condition). Incorrect : opposition, cause pure, ou conclusion.',
        },
        {
          q: '« Notamment, les villes de Lyon et Bordeaux ont déjà banni les véhicules les plus polluants. » Relation établie ?',
          options: ['Un argument de concession', 'Un argument d\'opposition', 'Un argument de conséquence', 'Un argument d\'illustration spécifique'],
          answer: 3,
          explain: 'Correct : « notamment » extrait des exemples particuliers. Incorrect : ce n\'est pas une concession, une opposition ni une conséquence.',
        },
        {
          q: '« Non seulement la lecture enrichit le vocabulaire, mais elle développe aussi la capacité d\'empathie. » Structure argumentative ?',
          options: ['Un argument d\'alternative', 'Un argument de nuance concessive', 'Un argument de cause à effet', 'Un argument d\'addition graduelle'],
          answer: 3,
          explain: 'Correct : « non seulement… mais aussi » cumule deux arguments en renforçant le second (addition graduelle). Incorrect : ce ne sont pas cause/effet, ni une concession, ni une alternative (ou… ou…).',
        },
        {
          q: '« En somme, la réforme proposée répond aux attentes écologiques tout en préservant le pouvoir d\'achat. » Type d\'argument ?',
          options: ['Un argument de cause', 'Un argument de synthèse ou de conclusion', 'Un argument de condition', 'Un argument de concession'],
          answer: 1,
          explain: 'Correct : « en somme » récapitule et conclut. Incorrect : cause, condition ou concession.',
        },
        {
          q: '« D\'un côté, le secteur numérique crée des emplois qualifiés ; d\'un autre côté, il détruit certains métiers traditionnels. » Type d\'argument ?',
          options: ['Un argument de finalité', 'Un argument d\'illustration', 'Un argument de confrontation ou de contraste', 'Un argument de justification'],
          answer: 2,
          explain: 'Correct : « d\'un côté… d\'un autre côté » oppose deux faces d\'un même phénomène. Incorrect : finalité, simple illustration ou justification unique.',
        },
        {
          q: '« Par exemple, l\'interdiction des emballages plastiques a permis d\'épargner des milliers de tonnes de déchets. » Fonction ?',
          options: ['Un argument de concession', 'Un argument d\'illustration factuelle', 'Un argument de cause', 'Un argument d\'addition'],
          answer: 1,
          explain: 'Correct : « par exemple » apporte un cas concret vérifiable. Incorrect : concession, cause du connecteur, ou simple addition sans valeur d\'exemple.',
        },
        {
          q: '« Néanmoins, cette initiative se heurte à de fortes réticences auprès des commerçants locaux. » Type d\'argument ?',
          options: ['Un argument de conclusion', 'Un argument d\'addition', 'Un argument de cause', 'Un argument de nuance ou de restriction'],
          answer: 3,
          explain: 'Correct : « néanmoins » introduit une limite / objection qui nuance sans tout annuler. Incorrect : conclusion, addition ou cause.',
        },
        {
          q: '« Vu que les réserves d\'eau douce diminuent, il devient urgent d\'adopter des gestes écoresponsables. » Relation exprimée ?',
          options: ['Un argument de cause indiscutable', 'Un argument de comparaison', 'Un argument de finalité', 'Un argument de conséquence'],
          answer: 0,
          explain: 'Correct : « vu que » pose un fait comme motif (cause). La conséquence est dans la principale (« il devient urgent… »), pas dans le connecteur lui-même. Incorrect : comparaison ou finalité.',
        },
        {
          q: '« C\'est pourquoi le gouvernement augmente le budget alloué à la recherche scientifique. » Rôle du connecteur ?',
          options: ['Un argument d\'illustration', 'Un argument de cause', 'Un argument d\'opposition', 'Un argument de conséquence logique'],
          answer: 3,
          explain: 'Correct : « c\'est pourquoi » annonce l\'effet / la suite logique. Incorrect : ce n\'est pas la cause (la cause précède), ni une illustration ni une opposition.',
        },
        {
          q: '« Autrement dit, cette loi vise à garantir un accès universel aux soins de santé. » Type de clarification ?',
          options: ['Un argument de concession', 'Un argument de reformulation ou de réexplication', 'Un argument d\'opposition', 'Un argument de condition'],
          answer: 1,
          explain: 'Correct : « autrement dit » reformule pour clarifier. Incorrect : concession, opposition ou condition.',
        },
        {
          q: '« De même que l\'exercice physique renforce le corps, l\'apprentissage régulier stimule la mémoire. » Type d\'argument ?',
          options: ['Un argument de conséquence', 'Un argument de cause', 'Un argument de comparaison ou d\'analogie', 'Un argument de concession'],
          answer: 2,
          explain: 'Correct : « de même que » met deux situations en parallèle (analogie). Incorrect : conséquence, cause ou concession.',
        },
      ],
    },
  ],
}
