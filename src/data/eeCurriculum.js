/**
 * EE Learning curriculum — structured modules for Expression Écrite.
 * Each lesson: short explanation, examples, then quiz items.
 * Progress is tracked via learning_item_progress (item_type = 'lesson').
 */

export const EE_CURRICULUM = [
  {
    id: 'accords',
    title: 'Les accords',
    icon: '✓',
    color: 'brand',
    description: 'Sujet–verbe, adjectifs, participes passés, genre et nombre.',
    lessons: [
      {
        id: 'accords-sv',
        title: 'Accord sujet–verbe',
        minutes: 8,
        theory: [
          'Le verbe s’accorde en personne et en nombre avec son sujet.',
          'Attention aux sujets inversés (questions) et aux sujets éloignés du verbe.',
          'Avec « qui », le verbe s’accorde avec l’antécédent.',
        ],
        examples: [
          { bad: 'Les étudiants écrit bien.', good: 'Les étudiants écrivent bien.' },
          { bad: 'C’est moi qui a raison.', good: 'C’est moi qui ai raison.' },
          { bad: 'Une série d’erreurs ont été corrigées.', good: 'Une série d’erreurs a été corrigée. (sujet = une série)' },
        ],
        quiz: [
          {
            q: 'Choisis la forme correcte : « Les résultats ___ encourageants. »',
            options: ['est', 'sont', 'être'],
            answer: 1,
            explain: 'Sujet pluriel « les résultats » → sont.',
          },
          {
            q: '« C’est nous qui ___ responsables. »',
            options: ['est', 'sommes', 'sont'],
            answer: 1,
            explain: 'Antécédent de « qui » = nous → sommes.',
          },
        ],
      },
      {
        id: 'accords-adj',
        title: 'Accord de l’adjectif',
        minutes: 8,
        theory: [
          'L’adjectif s’accorde en genre et en nombre avec le nom qu’il qualifie.',
          'Plusieurs noms de genres différents → masculin pluriel en général.',
          'Adjectifs de couleur composés ou invariables : attention (orange, marron souvent invariables).',
        ],
        examples: [
          { bad: 'Une solution efficace et rapide.', good: 'Une solution efficace et rapide. (déjà correct)' },
          { bad: 'Des idées intéressant.', good: 'Des idées intéressantes.' },
          { bad: 'Des chaussures bleu foncé.', good: 'Des chaussures bleu foncé. (composé souvent invariable)' },
        ],
        quiz: [
          {
            q: '« Des mesures ___ ont été prises. »',
            options: ['strict', 'strictes', 'stricte'],
            answer: 1,
            explain: 'Nom féminin pluriel → strictes.',
          },
          {
            q: '« Elle est restée ___ toute la soirée. »',
            options: ['calme', 'calmes', 'calmé'],
            answer: 0,
            explain: 'Sujet elle → adjectif féminin singulier.',
          },
        ],
      },
      {
        id: 'accords-pp',
        title: 'Accord du participe passé',
        minutes: 10,
        theory: [
          'Avec être : le participe s’accorde avec le sujet.',
          'Avec avoir : accord avec le COD placé avant le verbe.',
          'Verbes pronominaux : règles spécifiques (souvent comme être, sauf exceptions).',
        ],
        examples: [
          { bad: 'Elle est allé à Paris.', good: 'Elle est allée à Paris.' },
          { bad: 'Les lettres que j’ai écrit.', good: 'Les lettres que j’ai écrites.' },
          { bad: 'Elle s’est lavé les mains.', good: 'Elle s’est lavé les mains. (COD après → pas d’accord)' },
        ],
        quiz: [
          {
            q: '« Les décisions qu’ils ont ___ sont importantes. »',
            options: ['pris', 'prise', 'prises'],
            answer: 2,
            explain: 'COD « que » = les décisions (fém. plur.) avant le verbe → prises.',
          },
          {
            q: '« Elle est ___ hier soir. »',
            options: ['parti', 'partie', 'partis'],
            answer: 1,
            explain: 'Auxiliaire être + sujet elle → partie.',
          },
        ],
      },
      {
        id: 'accords-genre',
        title: 'Genre et pluriel',
        minutes: 7,
        theory: [
          'Apprends le genre des noms fréquents (erreur, problème, solution…).',
          'Pluriels irréguliers : journal → journaux, travail → travaux.',
          'Noms en -al → souvent -aux ; exceptions : festivals, récitals…',
        ],
        examples: [
          { bad: 'Un grand erreur.', good: 'Une grande erreur.' },
          { bad: 'Des chevals.', good: 'Des chevaux.' },
          { bad: 'Les informations sont fiables.', good: 'Les informations sont fiables. (correct)' },
        ],
        quiz: [
          {
            q: 'Quel est le pluriel de « travail » ?',
            options: ['travails', 'travaux', 'travau'],
            answer: 1,
            explain: 'travail → travaux.',
          },
          {
            q: '« ___ problème reste à résoudre. »',
            options: ['Une', 'Un', 'Des'],
            answer: 1,
            explain: 'problème est masculin → Un.',
          },
        ],
      },
    ],
  },
  {
    id: 'determinants',
    title: 'Articles et déterminants',
    icon: 'a',
    color: 'ce',
    description: 'Articles définis, indéfinis, partitifs, possessifs, démonstratifs.',
    lessons: [
      {
        id: 'art-base',
        title: 'Articles définis, indéfinis, partitifs',
        minutes: 8,
        theory: [
          'Défini (le/la/les) : connu ou général. Indéfini (un/une/des) : non identifié.',
          'Partitif (du/de la/de l’) : quantité non comptée (nourriture, abstractions).',
          'Après négation : souvent « de / d’ » au lieu de « des / du ».',
        ],
        examples: [
          { bad: 'Je n’ai pas des idées.', good: 'Je n’ai pas d’idées.' },
          { bad: 'Elle boit de l’eau.', good: 'Elle boit de l’eau. (correct)' },
          { bad: 'Les français aiment le fromage.', good: 'Les Français aiment le fromage. (général + majuscule possible)' },
        ],
        quiz: [
          {
            q: '« Je n’ai pas ___ temps. »',
            options: ['du', 'de', 'le'],
            answer: 1,
            explain: 'Négation + partitif → de.',
          },
          {
            q: '« ___ liberté est essentielle. » (idée générale)',
            options: ['Une', 'La', 'De la'],
            answer: 1,
            explain: 'Notion générale → La liberté.',
          },
        ],
      },
    ],
  },
  {
    id: 'relatifs',
    title: 'Pronoms relatifs',
    icon: 'qui',
    color: 'co',
    description: 'qui, que, dont, où — et les erreurs les plus fréquentes en EE.',
    lessons: [
      {
        id: 'rel-base',
        title: 'Qui, que, dont, où',
        minutes: 10,
        theory: [
          'qui = sujet de la relative. que = COD. dont = de + nom/verbe. où = lieu ou temps.',
          'Ne confonds pas « dont » et « que » après un nom qui se construit avec de.',
          'Évite les relatives trop lourdes : parfois deux phrases sont plus claires.',
        ],
        examples: [
          { bad: 'Le sujet que je parle est complexe.', good: 'Le sujet dont je parle est complexe.' },
          { bad: 'La ville que j’habite est dynamique.', good: 'La ville où j’habite est dynamique. (ou : dans laquelle)' },
          { bad: 'Les arguments qui j’ai présentés…', good: 'Les arguments que j’ai présentés…' },
        ],
        quiz: [
          {
            q: '« Voici le rapport ___ j’ai besoin. »',
            options: ['que', 'dont', 'qui'],
            answer: 1,
            explain: 'avoir besoin de → dont.',
          },
          {
            q: '« C’est une période ___ tout change. »',
            options: ['où', 'que', 'dont'],
            answer: 0,
            explain: 'Valeur temporelle → où.',
          },
        ],
      },
    ],
  },
  {
    id: 'temps',
    title: 'Les temps verbaux',
    icon: '⏱',
    color: 'ee',
    description: 'Présent, passé composé, imparfait, plus-que-parfait, futur, conditionnel, subjonctif.',
    lessons: [
      {
        id: 'temps-passe',
        title: 'Passé composé vs imparfait',
        minutes: 10,
        theory: [
          'Passé composé : fait achevé, événement ponctuel.',
          'Imparfait : description, habitude, arrière-plan.',
          'En EE, alterne les deux pour un récit plus naturel (Tâche 2).',
        ],
        examples: [
          { bad: 'Quand j’étais enfant, j’ai joué tous les jours.', good: 'Quand j’étais enfant, je jouais tous les jours.' },
          { bad: 'Hier, je marchais au parc quand j’ai vu un ami.', good: 'Hier, je marchais au parc quand j’ai vu un ami. (correct)' },
        ],
        quiz: [
          {
            q: 'Habitude dans le passé : « Chaque matin, elle ___ du café. »',
            options: ['a bu', 'buvait', 'boira'],
            answer: 1,
            explain: 'Habitude → imparfait.',
          },
          {
            q: 'Événement ponctuel : « Soudain, le téléphone ___. »',
            options: ['sonnait', 'a sonné', 'sonnerait'],
            answer: 1,
            explain: 'Fait soudain → passé composé.',
          },
        ],
      },
      {
        id: 'temps-subj',
        title: 'Le subjonctif (essentiel EE)',
        minutes: 12,
        theory: [
          'Après « il faut que », « bien que », « pour que », « afin que », doute, volonté, émotion…',
          'Très valorisé en Tâche 3 (concession : bien que + subjonctif).',
          'Présent du subjonctif : que je fasse, que tu sois, qu’il ait, que nous puissions…',
        ],
        examples: [
          { bad: 'Bien qu’il est tard, je continue.', good: 'Bien qu’il soit tard, je continue.' },
          { bad: 'Il faut que tu fais un effort.', good: 'Il faut que tu fasses un effort.' },
        ],
        quiz: [
          {
            q: '« Bien que cette idée ___ intéressante, je reste prudent. »',
            options: ['est', 'soit', 'sera'],
            answer: 1,
            explain: 'bien que + subjonctif → soit.',
          },
          {
            q: '« Il faut que nous ___ une décision. »',
            options: ['prenons', 'prenions', 'prendrons'],
            answer: 1,
            explain: 'il faut que + subjonctif → prenions.',
          },
        ],
      },
      {
        id: 'temps-cond-fut',
        title: 'Futur et conditionnel',
        minutes: 8,
        theory: [
          'Futur : projets, prédictions, promesses.',
          'Conditionnel : politesse, hypothèse (si + imparfait → conditionnel).',
          'Utile en Tâche 1 (politesse) et Tâche 3 (hypothèses).',
        ],
        examples: [
          { bad: 'Si j’avais le temps, je ferai ce projet.', good: 'Si j’avais le temps, je ferais ce projet.' },
          { bad: 'Je voudrais vous informer de mon absence.', good: 'Je voudrais vous informer de mon absence. (correct, poli)' },
        ],
        quiz: [
          {
            q: '« Si j’étais libre, je ___ volontiers. »',
            options: ['viendrai', 'viendrais', 'viens'],
            answer: 1,
            explain: 'si + imparfait → conditionnel présent.',
          },
        ],
      },
    ],
  },
  {
    id: 'negation',
    title: 'La négation',
    icon: 'ne',
    color: 'amber',
    description: 'ne… pas, jamais, rien, personne, plus, aucun…',
    lessons: [
      {
        id: 'neg-base',
        title: 'Structures de négation',
        minutes: 7,
        theory: [
          'ne… pas / jamais / plus / rien / personne / aucun(e).',
          'Avec un infinitif : ne pas + infinitif.',
          'Après négation, « de » remplace souvent « des / du ».',
        ],
        examples: [
          { bad: 'Je ne vois personne nulle part. (redondant)', good: 'Je ne vois personne.' },
          { bad: 'Il n’y a pas des solutions.', good: 'Il n’y a pas de solutions.' },
        ],
        quiz: [
          {
            q: '« Je n’ai ___ à ajouter. »',
            options: ['pas rien', 'rien', 'jamais rien pas'],
            answer: 1,
            explain: 'ne… rien → Je n’ai rien à ajouter.',
          },
        ],
      },
    ],
  },
  {
    id: 'prepositions',
    title: 'Prépositions courantes',
    icon: 'à',
    color: 'co',
    description: 'à, de, en, dans, sur, pour, par, avec… et constructions fixes.',
    lessons: [
      {
        id: 'prep-base',
        title: 'Prépositions et constructions',
        minutes: 8,
        theory: [
          'Mémorise les verbes + préposition : penser à, s’intéresser à, dépendre de, parler de…',
          'en + mois/année/moyen de transport ; à + ville ; au / en + pays.',
          'Erreurs fréquentes : *sur ce sujet* vs *à ce sujet* ; *dans le but de* vs *afin de*.',
        ],
        examples: [
          { bad: 'Je m’intéresse de ce thème.', good: 'Je m’intéresse à ce thème.' },
          { bad: 'Il dépend à ses parents.', good: 'Il dépend de ses parents.' },
        ],
        quiz: [
          {
            q: '« Elle s’intéresse ___ la politique. »',
            options: ['de', 'à', 'pour'],
            answer: 1,
            explain: 's’intéresser à.',
          },
        ],
      },
    ],
  },
  {
    id: 'passif',
    title: 'La voix passive',
    icon: 'être',
    color: 'ce',
    description: 'être + participe passé ; agent avec par ; quand l’utiliser en EE.',
    lessons: [
      {
        id: 'passif-base',
        title: 'Former et utiliser le passif',
        minutes: 8,
        theory: [
          'Passif = être + participe passé (accord avec le sujet).',
          'Agent introduit par « par » (parfois « de »).',
          'Utile pour un ton plus formel ou pour mettre l’accent sur le résultat.',
        ],
        examples: [
          { bad: 'Cette loi a adopté en 2020.', good: 'Cette loi a été adoptée en 2020.' },
          { bad: 'Les mesures sont pris par le gouvernement.', good: 'Les mesures sont prises par le gouvernement.' },
        ],
        quiz: [
          {
            q: '« Les résultats ___ publiés hier. »',
            options: ['ont', 'ont été', 'étaient été'],
            answer: 1,
            explain: 'Passé composé passif → ont été publiés.',
          },
        ],
      },
    ],
  },
  {
    id: 'discours',
    title: 'Discours rapporté',
    icon: '«»',
    color: 'ee',
    description: 'Discours direct / indirect ; concordance des temps.',
    lessons: [
      {
        id: 'discours-base',
        title: 'Rapport de paroles',
        minutes: 8,
        theory: [
          'Direct : guillemets. Indirect : que / si / interrogatif, sans guillemets.',
          'Concordance : il a dit qu’il viendrait ; elle a demandé si…',
          'Utile en Tâche 2 (citer une réaction) et Tâche 3 (reformuler un avis).',
        ],
        examples: [
          { bad: 'Il a dit : je suis d’accord. (mal ponctué en EE formelle)', good: 'Il a déclaré qu’il était d’accord.' },
        ],
        quiz: [
          {
            q: 'Version indirecte de : « Je reviendrai demain. » → Il a dit qu’il ___ le lendemain.',
            options: ['reviendra', 'reviendrait', 'revenait'],
            answer: 1,
            explain: 'Futur en direct → conditionnel en indirect (souvent).',
          },
        ],
      },
    ],
  },
  {
    id: 'registre',
    title: 'Registre formel',
    icon: '✉',
    color: 'gold',
    description: 'Vous, formules de politesse, ton professionnel pour Tâche 1 et 3.',
    lessons: [
      {
        id: 'registre-base',
        title: 'Écrire avec le bon niveau de langue',
        minutes: 8,
        theory: [
          'Formel : vous, vocabulaire neutre, phrases complètes.',
          'Informel : tu, contractions orales à éviter à l’écrit d’examen.',
          'Interdit à l’examen : argot, abréviations type « tkt », « mdr ».',
        ],
        examples: [
          { bad: 'Salut le boss, j’suis pas dispo.', good: 'Monsieur, je vous informe que je ne serai pas disponible.' },
          { bad: 'Je veux un rendez-vous.', good: 'Je souhaiterais obtenir un rendez-vous.' },
        ],
        quiz: [
          {
            q: 'Formule la plus adaptée à un responsable :',
            options: ['Salut, je peux pas venir.', 'Je vous prie de m’excuser pour mon absence.', 'Désolé frère.'],
            answer: 1,
            explain: 'Registre formel poli.',
          },
        ],
      },
    ],
  },
  {
    id: 'connecteurs',
    title: 'Connecteurs logiques',
    icon: '→',
    color: 'brand',
    description: '50+ connecteurs pour structurer Tâche 2 et Tâche 3.',
    lessons: [
      {
        id: 'conn-base',
        title: 'Banque de connecteurs par usage',
        minutes: 12,
        theory: [
          'Varie les connecteurs : ne répète pas « et » ou « mais » à chaque phrase.',
          'Place-les en début de phrase ou entre deux propositions.',
          'En Tâche 3 : Premièrement / Deuxièmement / Enfin + Certes… mais…',
        ],
        examples: [
          { bad: 'Je suis d’accord. Mais il y a un problème. Mais on peut avancer.', good: 'Je suis d’accord. Toutefois, un obstacle demeure. Néanmoins, une solution existe.' },
        ],
        quiz: [
          {
            q: 'Pour nuancer : « ___, l’idée est séduisante, ___ elle reste coûteuse. »',
            options: ['Certes / mais', 'Donc / et', 'Car / car'],
            answer: 0,
            explain: 'Structure de concession classique.',
          },
        ],
        connectors: {
          Ajouter: ['de plus', 'en outre', 'par ailleurs', 'également', 'aussi', 'qui plus est', 'd’autre part'],
          Illustrer: ['par exemple', 'notamment', 'en particulier', 'ainsi', 'comme en témoigne'],
          Opposer: ['cependant', 'toutefois', 'néanmoins', 'en revanche', 'or', 'au contraire'],
          Cause: ['car', 'parce que', 'puisque', 'en raison de', 'étant donné que'],
          Conséquence: ['donc', 'par conséquent', 'ainsi', 'c’est pourquoi', 'de ce fait'],
          Concession: ['certes… mais', 'bien que', 'même si', 'malgré', 'quoi que'],
          Classer: ['d’abord', 'ensuite', 'puis', 'enfin', 'premièrement', 'deuxièmement'],
          Conclure: ['en conclusion', 'en définitive', 'pour résumer', 'en somme', 'finalement'],
        },
      },
    ],
  },
  {
    id: 'vocabulaire',
    title: 'Vocabulaire actif',
    icon: '📚',
    color: 'ce',
    description: 'Champs lexicaux utiles pour EE (travail, société, environnement, éducation…).',
    lessons: [
      {
        id: 'vocab-arg',
        title: 'Vocabulaire pour argumenter',
        minutes: 10,
        theory: [
          'Remplace les mots vagues (chose, faire, bien, mauvais) par des termes précis.',
          'Apprends des couples : problème / enjeu ; avantage / inconvénient ; mesure / dispositif.',
          'Vise 10–15 expressions réutilisables par thème.',
        ],
        examples: [
          { bad: 'C’est une bonne chose pour les gens.', good: 'Cette mesure présente des avantages concrets pour les citoyens.' },
        ],
        quiz: [
          {
            q: 'Meilleure formulation :',
            options: [
              'Ça aide beaucoup les personnes.',
              'Cette initiative contribue à améliorer les conditions de vie.',
              'C’est cool pour tout le monde.',
            ],
            answer: 1,
            explain: 'Registre et précision adaptés à l’EE.',
          },
        ],
        wordBank: [
          { basic: 'important', advanced: 'essentiel / déterminant / crucial' },
          { basic: 'problème', advanced: 'enjeu / difficulté / obstacle' },
          { basic: 'aider', advanced: 'contribuer à / favoriser / faciliter' },
          { basic: 'beaucoup de', advanced: 'de nombreux / un grand nombre de' },
          { basic: 'dire', advanced: 'affirmer / souligner / faire observer' },
          { basic: 'penser', advanced: 'estimer / considérer / juger' },
          { basic: 'bon', advanced: 'bénéfique / favorable / pertinent' },
          { basic: 'mauvais', advanced: 'néfaste / préjudiciable / problématique' },
        ],
      },
    ],
  },
  {
    id: 'argumentation',
    title: 'Expressions d’argumentation',
    icon: '💡',
    color: 'ee',
    description: 'Formules pour introduire, défendre et nuancer une opinion (Tâche 3).',
    lessons: [
      {
        id: 'arg-formules',
        title: '100 expressions utiles (sélection active)',
        minutes: 12,
        theory: [
          'Annonce ton avis clairement, puis développe 2–3 arguments illustrés.',
          'Termine par une concession pour montrer la maturité du raisonnement.',
          'Évite « moi je trouve que » en série : variare les formules.',
        ],
        examples: [
          { bad: 'Moi je pense que c’est bien parce que c’est bien.', good: 'À mon avis, cette approche est pertinente. Premièrement…' },
        ],
        quiz: [
          {
            q: 'Quelle formule introduit le mieux une concession ?',
            options: ['Donc je conclus que…', 'Certes…, mais…', 'Par exemple…'],
            answer: 1,
            explain: 'Certes… mais… nuance puis confirme.',
          },
        ],
        expressions: {
          'Annoncer son avis': [
            'À mon avis…',
            'Pour ma part…',
            'Il me semble que…',
            'Je suis convaincu(e) que…',
            'Je partage l’idée selon laquelle…',
          ],
          'Introduire un argument': [
            'Premièrement…',
            'En premier lieu…',
            'Un premier argument tient au fait que…',
            'Il convient de souligner que…',
          ],
          'Illustrer': [
            'Par exemple…',
            'Comme le montre…',
            'On peut citer le cas de…',
            'Selon certaines études…',
          ],
          'Nuancer': [
            'Certes…, mais…',
            'Il est vrai que…, néanmoins…',
            'Sans nier que…, il reste que…',
            'Bien que…, je reste d’avis que…',
          ],
          'Conclure': [
            'En définitive…',
            'Pour toutes ces raisons…',
            'Aussi suis-je d’avis que…',
            'En somme…',
          ],
        },
      },
    ],
  },
  {
    id: 'ponctuation',
    title: 'Ponctuation et orthographe',
    icon: '§',
    color: 'amber',
    description: 'Points, virgules, accents, majuscules — relecture efficace.',
    lessons: [
      {
        id: 'ponct-base',
        title: 'Relecture ciblée',
        minutes: 8,
        theory: [
          'Une idée principale par phrase. Virgule pour respirer, pas pour coller des idées sans lien.',
          'Accents : é/è/ê, à, ù, ç — erreurs très visibles pour l’examinateur.',
          'Majuscule après le point ; guillemets français « … » si tu cites.',
        ],
        examples: [
          { bad: 'Je suis allé a paris, jai aimé.', good: 'Je suis allé à Paris. J’ai aimé mon séjour.' },
        ],
        quiz: [
          {
            q: 'Quelle phrase est correctement ponctuée ?',
            options: [
              'Cependant je reste prudent',
              'Cependant, je reste prudent.',
              'Cependant; je reste prudent',
            ],
            answer: 1,
            explain: 'Connecteur détaché + point final.',
          },
        ],
      },
    ],
  },
]

export function getAllLessons() {
  return EE_CURRICULUM.flatMap((m) =>
    m.lessons.map((l) => ({
      ...l,
      moduleId: m.id,
      moduleTitle: m.title,
      moduleColor: m.color,
    }))
  )
}

export function getLessonById(lessonId) {
  return getAllLessons().find((l) => l.id === lessonId) || null
}

export function curriculumStats(progressMap = {}) {
  const lessons = getAllLessons()
  const done = lessons.filter((l) => progressMap[l.id] === 'completed').length
  return {
    total: lessons.length,
    completed: done,
    percent: lessons.length ? Math.round((done / lessons.length) * 100) : 0,
  }
}
