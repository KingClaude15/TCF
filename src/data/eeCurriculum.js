/**
 * EE Learning curriculum — structured modules for Expression Écrite.
 * Progress tracked via learning_item_progress (item_type = 'lesson').
 */

import { EE_ERROR_BANK_MODULES } from './eeErrorBank'
import { EXTRA_LESSONS } from './eeErrorBankExtra'

const BASE_CURRICULUM = [
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
        minutes: 10,
        theory: [
          'Le verbe s’accorde en personne et en nombre avec son sujet.',
          'Attention aux sujets inversés et aux sujets éloignés du verbe.',
          'Avec « qui », le verbe s’accorde avec l’antécédent.',
        ],
        examples: [
          { bad: 'Les étudiants écrit bien.', good: 'Les étudiants écrivent bien.' },
          { bad: 'C’est moi qui a raison.', good: 'C’est moi qui ai raison.' },
          { bad: 'Une série d’erreurs ont été corrigées.', good: 'Une série d’erreurs a été corrigée.' },
        ],
        quiz: [
          { q: '« Les résultats ___ encourageants. »', options: ['est', 'sont', 'être'], answer: 1, explain: 'Sujet pluriel → sont (accord sujet–verbe).' },
          { q: '« C’est nous qui ___ responsables. »', options: ['est', 'sommes', 'sont'], answer: 1, explain: 'Antécédent = nous → sommes (accord sujet–verbe).' },
          { q: '« La majorité des candidats ___ réussi. »', options: ['a', 'ont', 'avoir'], answer: 0, explain: 'Sujet = la majorité (singulier) → a (accord sujet–verbe).' },
          { q: '« Ce sont eux qui ___ décidé. »', options: ['a', 'ont', 'avons'], answer: 1, explain: 'Antécédent = eux → ont (accord sujet–verbe).' },
          { q: '« Peu d’étudiants ___ présents. »', options: ['était', 'étaient', 'été'], answer: 1, explain: 'Peu de + pluriel → étaient (accord sujet–verbe).' },
        ],
      },
      {
        id: 'accords-adj',
        title: 'Accord de l’adjectif',
        minutes: 10,
        theory: [
          'L’adjectif s’accorde en genre et en nombre avec le nom.',
          'Noms de genres différents → souvent masculin pluriel.',
          'Couleurs composées : souvent invariables (bleu foncé).',
        ],
        examples: [
          { bad: 'Des idées intéressant.', good: 'Des idées intéressantes.' },
          { bad: 'Une solution efficace et rapide.', good: 'Une solution efficace et rapide. (correct)' },
        ],
        quiz: [
          { q: '« Des mesures ___ ont été prises. »', options: ['strict', 'strictes', 'stricte'], answer: 1, explain: 'Féminin pluriel → strictes (accord de l’adjectif).' },
          { q: '« Elle est restée ___ . »', options: ['calme', 'calmes', 'calmé'], answer: 0, explain: 'Elle → calme (accord de l’adjectif).' },
          { q: '« Des chaussures ___ . »', options: ['bleues foncées', 'bleu foncé', 'bleus foncés'], answer: 1, explain: 'Couleur composée souvent invariable (accord de l’adjectif).' },
          { q: '« Une décision ___ et ___ . »', options: ['juste / rapide', 'juste / rapides', 'justes / rapide'], answer: 0, explain: 'Accord avec décision (fém. sing.) — accord de l’adjectif.' },
        ],
      },
      {
        id: 'accords-pp',
        title: 'Accord du participe passé',
        minutes: 12,
        theory: [
          'Avec être : accord avec le sujet.',
          'Avec avoir : accord avec le COD placé avant le verbe.',
          'Pronominaux : règles spécifiques.',
        ],
        examples: [
          { bad: 'Elle est allé à Paris.', good: 'Elle est allée à Paris.' },
          { bad: 'Les lettres que j’ai écrit.', good: 'Les lettres que j’ai écrites.' },
        ],
        quiz: [
          { q: '« Les décisions qu’ils ont ___ . »', options: ['pris', 'prise', 'prises'], answer: 2, explain: 'COD fém. plur. avant → prises (accord du participe passé).' },
          { q: '« Elle est ___ hier. »', options: ['parti', 'partie', 'partis'], answer: 1, explain: 'être + elle → partie (accord du participe passé).' },
          { q: '« Les erreurs que j’ai ___ . »', options: ['fait', 'faite', 'faites'], answer: 2, explain: 'COD = les erreurs avant → faites (accord du participe passé).' },
          { q: '« Elle s’est ___ les mains. »', options: ['lavée', 'lavé', 'lavés'], answer: 1, explain: 'COD après → pas d’accord (accord du participe passé).' },
          { q: '« Nous sommes ___ à l’heure. »', options: ['arrivé', 'arrivée', 'arrivés'], answer: 2, explain: 'être + nous → arrivés (accord du participe passé).' },
        ],
      },
      {
        id: 'accords-genre',
        title: 'Genre et pluriel',
        minutes: 8,
        theory: [
          'Mémorise le genre des noms fréquents.',
          'Pluriels : journal → journaux, travail → travaux.',
        ],
        examples: [
          { bad: 'Un grand erreur.', good: 'Une grande erreur.' },
          { bad: 'Des chevals.', good: 'Des chevaux.' },
        ],
        quiz: [
          { q: 'Pluriel de « travail » ?', options: ['travails', 'travaux', 'travau'], answer: 1, explain: 'travaux (pluriel irrégulier en -aux).' },
          { q: '« ___ problème reste. »', options: ['Une', 'Un', 'Des'], answer: 1, explain: 'problème est masculin → Un.' },
          { q: 'Pluriel de « journal » ?', options: ['journals', 'journaux', 'journales'], answer: 1, explain: 'journaux (pluriel irrégulier en -aux).' },
        ],
      },
    ],
  },
  {
    id: 'determinants',
    title: 'Articles et déterminants',
    icon: 'a',
    color: 'ce',
    description: 'Articles définis, indéfinis, partitifs.',
    lessons: [
      {
        id: 'art-base',
        title: 'Articles définis, indéfinis, partitifs',
        minutes: 10,
        theory: [
          'Défini (le/la/les) : connu ou général. Indéfini (un/une/des) : non identifié.',
          'Partitif (du/de la/de l’) : quantité non comptée.',
          'Après négation : souvent « de / d’ ».',
        ],
        examples: [
          { bad: 'Je n’ai pas des idées.', good: 'Je n’ai pas d’idées.' },
        ],
        quiz: [
          { q: '« Je n’ai pas ___ temps. »', options: ['du', 'de', 'le'], answer: 1, explain: 'Négation + partitif → de.' },
          { q: '« ___ liberté est essentielle. »', options: ['Une', 'La', 'De la'], answer: 1, explain: 'Notion générale → La.' },
          { q: '« Elle boit ___ eau. »', options: ['de', 'de l’', 'une'], answer: 1, explain: 'Partitif devant voyelle → de l’.' },
          { q: '« Il n’y a pas ___ solutions. »', options: ['des', 'de', 'les'], answer: 1, explain: 'Négation → de.' },
        ],
      },
    ],
  },
  {
    id: 'relatifs',
    title: 'Pronoms relatifs',
    icon: 'qui',
    color: 'co',
    description: 'qui, que, dont, où — bases pour l’EE.',
    lessons: [
      {
        id: 'rel-base',
        title: 'Qui, que, dont, où',
        minutes: 12,
        theory: [
          'qui = sujet. que = COD. dont = de +. où = lieu ou temps.',
          'Évite les relatives trop lourdes.',
        ],
        examples: [
          { bad: 'Le sujet que je parle est complexe.', good: 'Le sujet dont je parle est complexe.' },
        ],
        quiz: [
          { q: '« Voici le rapport ___ j’ai besoin. »', options: ['que', 'dont', 'qui'], answer: 1, explain: 'avoir besoin de → dont.' },
          { q: '« C’est une période ___ tout change. »', options: ['où', 'que', 'dont'], answer: 0, explain: 'Temps → où.' },
          { q: '« Les arguments ___ j’ai présentés… »', options: ['qui', 'que', 'dont'], answer: 1, explain: 'COD → que.' },
          { q: '« La personne ___ a appelé… »', options: ['que', 'qui', 'dont'], answer: 1, explain: 'Sujet de la relative → qui.' },
        ],
      },
    ],
  },
  {
    id: 'temps',
    title: 'Les temps verbaux',
    icon: '⏱',
    color: 'ee',
    description: 'Présent, PC, imparfait, futur, conditionnel, subjonctif.',
    lessons: [
      {
        id: 'temps-passe',
        title: 'Passé composé vs imparfait',
        minutes: 12,
        theory: [
          'PC : fait achevé. Imparfait : description, habitude.',
          'Alterne les deux en Tâche 2.',
        ],
        examples: [
          { bad: 'Quand j’étais enfant, j’ai joué tous les jours.', good: 'Quand j’étais enfant, je jouais tous les jours.' },
        ],
        quiz: [
          { q: 'Habitude : « Chaque matin, elle ___ du café. »', options: ['a bu', 'buvait', 'boira'], answer: 1, explain: 'Habitude → imparfait.' },
          { q: 'Ponctuel : « Soudain, le téléphone ___. »', options: ['sonnait', 'a sonné', 'sonnerait'], answer: 1, explain: 'Fait soudain → PC.' },
          { q: '« Hier, je ___ au parc quand j’ai vu un ami. »', options: ['marchais', 'ai marché', 'marcherai'], answer: 0, explain: 'Arrière-plan → imparfait.' },
          { q: '« En 2019, nous ___ à Lyon. » (un an)', options: ['avons habité', 'habitions', 'habiterons'], answer: 0, explain: 'Période délimitée souvent PC.' },
        ],
      },
      {
        id: 'temps-subj',
        title: 'Le subjonctif (essentiel EE)',
        minutes: 14,
        theory: [
          'Après il faut que, bien que, pour que, doute, volonté…',
          'Très valorisé en Tâche 3.',
        ],
        examples: [
          { bad: 'Bien qu’il est tard…', good: 'Bien qu’il soit tard…' },
        ],
        quiz: [
          { q: '« Bien que cette idée ___ intéressante… »', options: ['est', 'soit', 'sera'], answer: 1, explain: 'bien que + subj.' },
          { q: '« Il faut que nous ___ une décision. »', options: ['prenons', 'prenions', 'prendrons'], answer: 1, explain: 'il faut que + subj.' },
          { q: '« Pour que tu ___, j’explique. »', options: ['comprends', 'comprennes', 'comprendras'], answer: 1, explain: 'pour que + subj.' },
          { q: '« Je doute qu’il ___ raison. »', options: ['a', 'ait', 'aura'], answer: 1, explain: 'doute que + subj.' },
          { q: '« Quoiqu’elle ___ fatiguée, elle continue. »', options: ['est', 'soit', 'sera'], answer: 1, explain: 'quoique + subj.' },
        ],
      },
      {
        id: 'temps-cond-fut',
        title: 'Futur et conditionnel',
        minutes: 10,
        theory: [
          'Futur : projets. Conditionnel : politesse, hypothèse (si + imparfait).',
        ],
        examples: [
          { bad: 'Si j’avais le temps, je ferai ce projet.', good: 'Si j’avais le temps, je ferais ce projet.' },
        ],
        quiz: [
          { q: '« Si j’étais libre, je ___ volontiers. »', options: ['viendrai', 'viendrais', 'viens'], answer: 1, explain: 'si + imparfait → conditionnel.' },
          { q: '« Demain, nous ___ le rapport. »', options: ['rendons', 'rendrons', 'rendrions'], answer: 1, explain: 'Futur.' },
          { q: 'Politesse : « Je ___ vous informer… »', options: ['veux', 'voudrais', 'voudrai'], answer: 1, explain: 'Conditionnel de politesse.' },
        ],
      },
    ],
  },
  {
    id: 'negation',
    title: 'La négation',
    icon: 'ne',
    color: 'amber',
    description: 'ne… pas, jamais, rien, personne…',
    lessons: [
      {
        id: 'neg-base',
        title: 'Structures de négation',
        minutes: 8,
        theory: [
          'ne… pas / jamais / plus / rien / personne / aucun(e).',
          'Après négation, « de » remplace souvent « des ».',
        ],
        examples: [
          { bad: 'Il n’y a pas des solutions.', good: 'Il n’y a pas de solutions.' },
        ],
        quiz: [
          { q: '« Je n’ai ___ à ajouter. »', options: ['pas rien', 'rien', 'jamais rien pas'], answer: 1, explain: 'ne… rien.' },
          { q: '« Elle ne voit ___. »', options: ['personne', 'pas personne', 'aucun personne'], answer: 0, explain: 'ne… personne.' },
          { q: '« Je n’ai plus ___ doute. »', options: ['de', 'du', 'des'], answer: 0, explain: 'plus + de.' },
        ],
      },
    ],
  },
  {
    id: 'prepositions',
    title: 'Prépositions courantes',
    icon: 'à',
    color: 'co',
    description: 'à, de, en, dans… et constructions fixes.',
    lessons: [
      {
        id: 'prep-base',
        title: 'Prépositions et constructions',
        minutes: 10,
        theory: [
          'penser à, s’intéresser à, dépendre de, parler de…',
          'en + mois/année ; à + ville.',
        ],
        examples: [
          { bad: 'Je m’intéresse de ce thème.', good: 'Je m’intéresse à ce thème.' },
        ],
        quiz: [
          { q: '« Elle s’intéresse ___ la politique. »', options: ['de', 'à', 'pour'], answer: 1, explain: 's’intéresser à.' },
          { q: '« Cela dépend ___ toi. »', options: ['à', 'de', 'pour'], answer: 1, explain: 'dépendre de.' },
          { q: '« Je pense ___ mes projets. »', options: ['de', 'à', 'sur'], answer: 1, explain: 'penser à.' },
          { q: '« Nous parlons ___ l’environnement. »', options: ['à', 'de', 'pour'], answer: 1, explain: 'parler de.' },
        ],
      },
    ],
  },
  {
    id: 'passif',
    title: 'La voix passive',
    icon: 'être',
    color: 'ce',
    description: 'être + participe passé ; agent avec par.',
    lessons: [
      {
        id: 'passif-base',
        title: 'Former et utiliser le passif',
        minutes: 10,
        theory: [
          'Passif = être + participe passé (accord avec le sujet).',
          'Agent : par (parfois de).',
        ],
        examples: [
          { bad: 'Cette loi a adopté en 2020.', good: 'Cette loi a été adoptée en 2020.' },
        ],
        quiz: [
          { q: '« Les résultats ___ publiés hier. »', options: ['ont', 'ont été', 'étaient été'], answer: 1, explain: 'ont été publiés.' },
          { q: '« La mesure ___ par le gouvernement. »', options: ['a pris', 'a été prise', 'est pris'], answer: 1, explain: 'Passif + accord fém.' },
          { q: '« Les décisions seront ___ demain. »', options: ['annoncé', 'annoncée', 'annoncées'], answer: 2, explain: 'Accord avec décisions.' },
        ],
      },
    ],
  },
  {
    id: 'discours',
    title: 'Discours rapporté',
    icon: '«»',
    color: 'ee',
    description: 'Direct / indirect ; concordance.',
    lessons: [
      {
        id: 'discours-base',
        title: 'Rapport de paroles',
        minutes: 10,
        theory: [
          'Indirect : que / si / interrogatif, sans guillemets.',
          'Il a dit qu’il viendrait.',
        ],
        examples: [
          { bad: 'Il a dit : je suis d’accord.', good: 'Il a déclaré qu’il était d’accord.' },
        ],
        quiz: [
          { q: '« Je reviendrai demain. » → Il a dit qu’il ___ le lendemain.', options: ['reviendra', 'reviendrait', 'revenait'], answer: 1, explain: 'Futur → conditionnel en indirect.' },
          { q: '« Es-tu prêt ? » → Elle a demandé ___ j’étais prêt.', options: ['que', 'si', 'comment'], answer: 1, explain: 'Question oui/non → si.' },
          { q: '« Je pars. » → Il a annoncé qu’il ___.', options: ['part', 'partait', 'partira'], answer: 1, explain: 'Présent → imparfait en indirect (souvent).' },
        ],
      },
    ],
  },
  {
    id: 'registre',
    title: 'Registre formel',
    icon: '✉',
    color: 'gold',
    description: 'Vous, formules de politesse, ton professionnel.',
    lessons: [
      {
        id: 'registre-base',
        title: 'Écrire avec le bon niveau de langue',
        minutes: 10,
        theory: [
          'Formel : vous, vocabulaire neutre.',
          'Interdit : argot, abréviations type « tkt ».',
        ],
        examples: [
          { bad: 'Salut le boss, j’suis pas dispo.', good: 'Monsieur, je vous informe que je ne serai pas disponible.' },
        ],
        quiz: [
          { q: 'Formule adaptée à un responsable :', options: ['Salut, je peux pas venir.', 'Je vous prie de m’excuser pour mon absence.', 'Désolé frère.'], answer: 1, explain: 'Registre formel.' },
          { q: 'Remplace « Je veux un RDV » :', options: ['Je souhaite obtenir un rendez-vous.', 'File-moi un créneau.', 'Je veux now.'], answer: 0, explain: 'Formulation professionnelle.' },
          { q: 'À éviter en EE :', options: ['Toutefois', 'mdr', 'Néanmoins'], answer: 1, explain: 'Langage familier / chat.' },
        ],
      },
    ],
  },
  {
    id: 'connecteurs',
    title: 'Connecteurs logiques',
    icon: '→',
    color: 'brand',
    description: 'Connecteurs pour structurer Tâche 2 et 3.',
    lessons: [
      {
        id: 'conn-base',
        title: 'Banque de connecteurs par usage',
        minutes: 14,
        theory: [
          'Varie les connecteurs.',
          'Tâche 3 : Premièrement / Deuxièmement / Certes… mais…',
        ],
        examples: [
          { bad: 'Je suis d’accord. Mais… Mais…', good: 'Je suis d’accord. Toutefois… Néanmoins…' },
        ],
        quiz: [
          { q: 'Pour nuancer : « ___, l’idée est séduisante, ___ elle reste coûteuse. »', options: ['Certes / mais', 'Donc / et', 'Car / car'], answer: 0, explain: 'Concession.' },
          { q: 'Conséquence :', options: ['parce que', 'par conséquent', 'bien que'], answer: 1, explain: 'par conséquent = conséquence.' },
          { q: 'Opposition :', options: ['en outre', 'en revanche', 'par exemple'], answer: 1, explain: 'en revanche = opposition.' },
          { q: 'Ajout :', options: ['toutefois', 'de plus', 'car'], answer: 1, explain: 'de plus = ajout.' },
        ],
        connectors: {
          Ajouter: ['de plus', 'en outre', 'par ailleurs', 'également', 'qui plus est', 'd’autre part'],
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
    description: 'Remplacer les mots vagues par des termes précis.',
    lessons: [
      {
        id: 'vocab-arg',
        title: 'Vocabulaire pour argumenter',
        minutes: 12,
        theory: [
          'Évite chose, faire, bien, mauvais.',
          'problème → enjeu ; aider → contribuer à.',
        ],
        examples: [
          { bad: 'C’est une bonne chose pour les gens.', good: 'Cette mesure présente des avantages pour les citoyens.' },
        ],
        quiz: [
          { q: 'Meilleure formulation :', options: ['Ça aide beaucoup les personnes.', 'Cette initiative contribue à améliorer les conditions de vie.', 'C’est cool.'], answer: 1, explain: 'Précision + registre.' },
          { q: 'Remplace « important » :', options: ['sympa', 'déterminant', 'truc'], answer: 1, explain: 'déterminant = précis.' },
          { q: 'Remplace « dire » :', options: ['affirmer', 'balancer', 'cracher'], answer: 0, explain: 'affirmer = formel.' },
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
    description: 'Formules pour Tâche 3.',
    lessons: [
      {
        id: 'arg-formules',
        title: 'Formules pour défendre une opinion',
        minutes: 12,
        theory: [
          'Annonce ton avis, développe 2–3 arguments, termine par une concession.',
        ],
        examples: [
          { bad: 'Moi je trouve que c’est bien.', good: 'À mon avis, cette approche est pertinente. Premièrement…' },
        ],
        quiz: [
          { q: 'Formule de concession :', options: ['Donc je conclus que…', 'Certes…, mais…', 'Par exemple…'], answer: 1, explain: 'Certes… mais…' },
          { q: 'Annoncer un avis :', options: ['Genre…', 'Pour ma part…', 'Lol…'], answer: 1, explain: 'Pour ma part…' },
          { q: 'Classer des arguments :', options: ['Premièrement… Deuxièmement…', 'Et… et…', 'Genre…'], answer: 0, explain: 'Ordre clair.' },
        ],
        expressions: {
          'Annoncer son avis': ['À mon avis…', 'Pour ma part…', 'Il me semble que…', 'Je suis convaincu(e) que…'],
          'Introduire un argument': ['Premièrement…', 'En premier lieu…', 'Il convient de souligner que…'],
          'Illustrer': ['Par exemple…', 'Comme le montre…', 'On peut citer le cas de…'],
          'Nuancer': ['Certes…, mais…', 'Il est vrai que…, néanmoins…', 'Bien que…, je reste d’avis que…'],
          'Conclure': ['En définitive…', 'Pour toutes ces raisons…', 'En somme…'],
        },
      },
    ],
  },
  {
    id: 'ponctuation',
    title: 'Ponctuation et orthographe',
    icon: '§',
    color: 'amber',
    description: 'Points, virgules, accents — relecture.',
    lessons: [
      {
        id: 'ponct-base',
        title: 'Relecture ciblée',
        minutes: 8,
        theory: [
          'Une idée principale par phrase.',
          'Accents et majuscules très visibles pour l’examinateur.',
        ],
        examples: [
          { bad: 'Je suis allé a paris, jai aimé.', good: 'Je suis allé à Paris. J’ai aimé mon séjour.' },
        ],
        quiz: [
          { q: 'Correctement ponctué :', options: ['Cependant je reste prudent', 'Cependant, je reste prudent.', 'Cependant; je reste prudent'], answer: 1, explain: 'Virgule après connecteur + point.' },
          { q: '« Je vais ___ Paris. »', options: ['a', 'à', 'ah'], answer: 1, explain: 'Préposition à.' },
        ],
      },
    ],
  },

  /* ─── ADVANCED MODULES ─── */
  {
    id: 'nominalisation',
    title: 'Nominalisation',
    icon: 'N',
    color: 'brand',
    description: 'Transformer un verbe ou un adjectif en nom pour un style plus formel.',
    lessons: [
      {
        id: 'nom-base',
        title: 'Nominaliser pour densifier le style',
        minutes: 12,
        theory: [
          'La nominalisation remplace une proposition verbale par un nom : décider → la décision ; refuser → le refus.',
          'Très utile en EE formelle (Tâche 3) : moins de « on voit que », plus de densité.',
          'Souviens-toi des suffixes : -tion, -ment, -age, -ure, -ance, -ité.',
        ],
        examples: [
          { bad: 'On a décidé de reporter le projet.', good: 'La décision de reporter le projet a été prise.' },
          { bad: 'Les prix augmentent rapidement.', good: 'L’augmentation rapide des prix…' },
          { bad: 'Ils ont refusé de signer.', good: 'Leur refus de signer…' },
        ],
        quiz: [
          { q: 'Nominalise « décider » :', options: ['le décide', 'la décision', 'le décidement'], answer: 1, explain: 'décider → la décision.' },
          { q: '« Les prix augmentent » →', options: ['l’augmenter des prix', 'l’augmentation des prix', 'l’augment des prix'], answer: 1, explain: 'augmentation.' },
          { q: '« Ils ont échoué » →', options: ['leur échec', 'leur échouement', 'leur échouer'], answer: 0, explain: 'échouer → l’échec.' },
          { q: 'Style plus formel :', options: ['On voit que ça baisse.', 'On constate une baisse.', 'Ça baisse.'], answer: 1, explain: 'Nominalisation + constat.' },
          { q: '« Améliorer » → nom :', options: ['l’amélioration', 'l’amélioration', 'le améliorer'], answer: 1, explain: 'amélioration.' },
          { q: '« Refuser » →', options: ['le refus', 'la refusance', 'le refusement'], answer: 0, explain: 'le refus.' },
        ],
      },
    ],
  },
  {
    id: 'gerondif',
    title: 'Participe présent et gérondif',
    icon: 'ing',
    color: 'co',
    description: 'en + participe présent ; participes pour condenser.',
    lessons: [
      {
        id: 'ger-base',
        title: 'Gérondif et participe présent',
        minutes: 12,
        theory: [
          'Participe présent : radical + -ant (faisant, ayant, étant).',
          'Gérondif = en + participe présent : simultanété, manière, condition.',
          'Invariable (sauf adjectif verbal : une situation préoccupante).',
        ],
        examples: [
          { bad: 'En marchant, le temps passait vite. (ambigu si sujet différent)', good: 'En marchant, j’ai vu le temps passer. (même sujet)' },
          { bad: 'Il travaille et il écoute la radio.', good: 'Il travaille en écoutant la radio.' },
        ],
        quiz: [
          { q: 'Gérondif de « lire » :', options: ['en lisant', 'en lire', 'en lit'], answer: 0, explain: 'en + participe présent.' },
          { q: '« Elle est partie ___ . » (en souriant)', options: ['en souriant', 'en sourire', 'souriante en'], answer: 0, explain: 'en souriant.' },
          { q: 'Même sujet requis pour le gérondif :', options: ['vrai', 'faux', 'seulement au passé'], answer: 0, explain: 'Le sujet du gérondif = sujet de la principale.' },
          { q: 'Participe présent de « avoir » :', options: ['ayant', 'ayanté', 'avons'], answer: 0, explain: 'ayant.' },
          { q: '« Il a réussi ___ régulièrement. »', options: ['en s’entraînant', 'en s’entraîner', 'entraînant'], answer: 0, explain: 'en s’entraînant.' },
        ],
      },
    ],
  },
  {
    id: 'participiales',
    title: 'Propositions participiales',
    icon: '…',
    color: 'ce',
    description: 'Clauses participiales pour un style soutenu.',
    lessons: [
      {
        id: 'part-clauses',
        title: 'Clauses participiales',
        minutes: 12,
        theory: [
          'Une participiale condense une relative ou une circonstancielle : Arrivé à l’heure, il a pu…',
          'Le participe s’accorde avec son sujet propre.',
          'Très valorisé en EE avancée (C1).',
        ],
        examples: [
          { bad: 'Quand le rapport a été terminé, on l’a envoyé.', good: 'Le rapport terminé, on l’a envoyé.' },
          { bad: 'Comme elle était fatiguée, elle est rentrée.', good: 'Fatiguée, elle est rentrée.' },
        ],
        quiz: [
          { q: 'Version participiale de « Quand il fut arrivé… » :', options: ['Arrivant, il…', 'Arrivé, il…', 'En arrivé, il…'], answer: 1, explain: 'Arrivé, il…' },
          { q: 'Accord : « Les dossiers ___, on a archivé. »', options: ['classé', 'classés', 'classée'], answer: 1, explain: 'Accord avec dossiers.' },
          { q: '« Une fois la décision ___, on agit. »', options: ['pris', 'prise', 'prises'], answer: 1, explain: 'décision fém. → prise.' },
          { q: 'Style le plus soutenu :', options: ['Après qu’il a fini, il est parti.', 'Ayant fini, il est parti.', 'Il a fini et il est parti.'], answer: 1, explain: 'Participiale / gérondif composé.' },
        ],
      },
    ],
  },
  {
    id: 'mise-en-relief',
    title: 'Mise en relief',
    icon: '★',
    color: 'ee',
    description: 'C’est… qui / que ; Ce qui / Ce que… c’est…',
    lessons: [
      {
        id: 'emphasis',
        title: 'Structures d’emphase',
        minutes: 12,
        theory: [
          'C’est X qui + verbe (sujet mis en relief).',
          'C’est X que + reste (COD / complément).',
          'Ce qui / Ce que…, c’est… pour annoncer le focus.',
        ],
        examples: [
          { bad: 'Paul a raison, vraiment.', good: 'C’est Paul qui a raison.' },
          { bad: 'Je veux la clarté.', good: 'Ce que je veux, c’est la clarté.' },
        ],
        quiz: [
          { q: '« ___ Marie qui a proposé l’idée. »', options: ['C’est', 'Il est', 'Ce sont'], answer: 0, explain: 'C’est… qui.' },
          { q: '« Ce ___ m’étonne, c’est son calme. »', options: ['que', 'qui', 'dont'], answer: 1, explain: 'Ce qui (sujet de m’étonne).' },
          { q: '« C’est ce projet ___ nous soutenons. »', options: ['qui', 'que', 'dont'], answer: 1, explain: 'COD → que.' },
          { q: '« Ce que je refuse, ___ l’injustice. »', options: ['c’est', 'est', 'c’était'], answer: 0, explain: 'Ce que…, c’est…' },
          { q: 'Mise en relief du sujet :', options: ['C’est le jury qui décide.', 'Le jury décide c’est.', 'Qui décide c’est jury.'], answer: 0, explain: 'C’est… qui.' },
        ],
      },
    ],
  },
  {
    id: 'relatifs-avances',
    title: 'Pronoms relatifs avancés',
    icon: 'lequel',
    color: 'co',
    description: 'lequel, auquel, duquel, ce dont, ce à quoi…',
    lessons: [
      {
        id: 'rel-adv',
        title: 'Lequel / auquel / duquel / ce dont',
        minutes: 14,
        theory: [
          'lequel (laquelle, lesquels…) après préposition (sauf de → duquel, à → auquel).',
          'ce qui / ce que / ce dont / ce à quoi sans antécédent nominal précis.',
          'Plus précis et plus formel que « que » mal employé.',
        ],
        examples: [
          { bad: 'Le dossier sur que je travaille…', good: 'Le dossier sur lequel je travaille…' },
          { bad: 'C’est ce que j’ai besoin.', good: 'C’est ce dont j’ai besoin.' },
        ],
        quiz: [
          { q: '« Le sujet ___ je m’intéresse… »', options: ['que', 'auquel', 'dont'], answer: 1, explain: 's’intéresser à → auquel.' },
          { q: '« L’idée ___ laquelle je pense… »', options: ['à', 'de', 'pour'], answer: 0, explain: 'penser à → à laquelle.' },
          { q: '« C’est ce ___ j’ai besoin. »', options: ['que', 'dont', 'qui'], answer: 1, explain: 'avoir besoin de → ce dont.' },
          { q: '« Les raisons pour ___ il a refusé… »', options: ['que', 'lesquelles', 'dont'], answer: 1, explain: 'pour + lesquelles.' },
          { q: '« Ce à ___ je m’attendais… »', options: ['qui', 'quoi', 'que'], answer: 1, explain: 's’attendre à → ce à quoi.' },
          { q: '« La société dans ___ il travaille… »', options: ['que', 'laquelle', 'dont'], answer: 1, explain: 'dans laquelle.' },
        ],
      },
    ],
  },
  {
    id: 'concordance',
    title: 'Concordance des temps',
    icon: '⇄',
    color: 'ee',
    description: 'Accord des temps entre principale et subordonnée.',
    lessons: [
      {
        id: 'concord-base',
        title: 'Règles de concordance',
        minutes: 12,
        theory: [
          'Principale au passé → subordonnée souvent à un temps du passé.',
          'Il a dit qu’il viendrait. / Il pensait qu’elle avait raison.',
          'Si + présent → futur ; si + imparfait → conditionnel.',
        ],
        examples: [
          { bad: 'Il a dit qu’il viendra demain. (souvent corrigé en style soutenu)', good: 'Il a dit qu’il viendrait le lendemain.' },
        ],
        quiz: [
          { q: '« Elle a affirmé qu’elle ___ prête. »', options: ['est', 'était', 'sera'], answer: 1, explain: 'Principale au passé → imparfait.' },
          { q: '« Si j’avais su, j’___ autrement. »', options: ['agirai', 'agirais', 'aurais agi'], answer: 2, explain: 'Hypothèse irréelle passé → conditionnel passé.' },
          { q: '« Il pensait que nous ___. »', options: ['avons tort', 'avions tort', 'aurons tort'], answer: 1, explain: 'Concordance au passé.' },
          { q: '« Si tu viens, nous ___ ensemble. »', options: ['mangerions', 'mangerons', 'mangions'], answer: 1, explain: 'si + présent → futur.' },
        ],
      },
    ],
  },
  {
    id: 'impersonnel',
    title: 'Constructions impersonnelles',
    icon: 'il',
    color: 'ce',
    description: 'Il faut, il est important que, il convient de…',
    lessons: [
      {
        id: 'impers-base',
        title: 'Il est… / Il faut… / Il convient…',
        minutes: 10,
        theory: [
          'Tournures impersonnelles = ton formel et objectif.',
          'Il est essentiel que + subjonctif ; Il convient de + infinitif.',
          'Évite la répétition de « on » en Tâche 3.',
        ],
        examples: [
          { bad: 'On doit agir vite.', good: 'Il convient d’agir rapidement.' },
          { bad: 'C’est important de réfléchir.', good: 'Il est important de réfléchir. / Il est important que l’on réfléchisse.' },
        ],
        quiz: [
          { q: '« Il est nécessaire que tu ___ . »', options: ['viens', 'viennes', 'viendras'], answer: 1, explain: 'il est nécessaire que + subj.' },
          { q: '« Il convient ___ prudent. »', options: ['être', 'd’être', 'que être'], answer: 1, explain: 'il convient de + inf.' },
          { q: 'Plus formel :', options: ['On doit vérifier.', 'Il importe de vérifier.', 'Faut checker.'], answer: 1, explain: 'il importe de…' },
          { q: '« Il semble qu’il ___ raison. » (certitude relative)', options: ['ait', 'a', 'aurait eu forcément'], answer: 1, explain: 'Après il semble que, l’indicatif est fréquent si l’on présente le fait comme plausible.' },
        ],
      },
    ],
  },
  {
    id: 'inversion',
    title: 'Inversion formelle',
    icon: '¿',
    color: 'gold',
    description: 'Inversion sujet–verbe dans un registre soutenu.',
    lessons: [
      {
        id: 'inv-base',
        title: 'Inversions utiles en EE',
        minutes: 10,
        theory: [
          'Après certains adverbes en tête : peut-être, aussi, à peine, encore…',
          'Aussi a-t-il décidé… / Peut-être viendra-t-elle…',
          'Donne immédiatement un ton C1.',
        ],
        examples: [
          { bad: 'Peut-être elle viendra.', good: 'Peut-être viendra-t-elle.' },
          { bad: 'Aussi il a refusé.', good: 'Aussi a-t-il refusé.' },
        ],
        quiz: [
          { q: 'Forme correcte :', options: ['Peut-être il acceptera.', 'Peut-être acceptera-t-il.', 'Peut-être que acceptera il.'], answer: 1, explain: 'Inversion après peut-être.' },
          { q: '« À peine ___ -il sorti que… »', options: ['est', 'a', 'était'], answer: 0, explain: 'À peine est-il sorti…' },
          { q: '« Aussi ___ -nous conclu que… »', options: ['avons', 'avons-nous', 'nous avons'], answer: 0, explain: 'Aussi avons-nous conclu… (inversion).' },
          { q: 'Registre de « Sans doute a-t-elle raison » :', options: ['familier', 'soutenu', 'incorrect'], answer: 1, explain: 'Inversion = soutenu.' },
        ],
      },
    ],
  },
  {
    id: 'neg-avancee',
    title: 'Négation avancée',
    icon: '≠',
    color: 'amber',
    description: 'ne… que, ne… guère, doubles négations soignées.',
    lessons: [
      {
        id: 'neg-adv',
        title: 'Négations fines et restrictives',
        minutes: 12,
        theory: [
          'ne… que = seulement (Ce n’est qu’un début).',
          'ne… guère = presque pas (soutenu).',
          'Évite les doubles négations orales incorrectes à l’écrit.',
        ],
        examples: [
          { bad: 'Je seulement ai 10 minutes.', good: 'Je n’ai que 10 minutes.' },
          { bad: 'Il ne vient pas jamais.', good: 'Il ne vient jamais.' },
        ],
        quiz: [
          { q: '« Je n’ai ___ 20 minutes. » (seulement)', options: ['pas', 'que', 'plus'], answer: 1, explain: 'ne… que = seulement.' },
          { q: '« Ce n’est ___ le début. »', options: ['pas que', 'que', 'que pas'], answer: 1, explain: 'Ce n’est que…' },
          { q: 'Correct :', options: ['Il ne voit personne jamais.', 'Il ne voit jamais personne.', 'Il voit ne personne.'], answer: 1, explain: 'Ordre standard.' },
          { q: 'Sens de « Il ne guère travaille » (corrigé : il ne travaille guère) :', options: ['il travaille beaucoup', 'il travaille très peu', 'il travaille parfois'], answer: 1, explain: 'guère ≈ presque pas.' },
          { q: '« Nous n’avons ___ de temps. » (plus du tout)', options: ['plus', 'que', 'guère que'], answer: 0, explain: 'ne… plus.' },
        ],
      },
    ],
  },
  {
    id: 'connecteurs-nuanches',
    title: 'Connecteurs nuancés',
    icon: '↔',
    color: 'brand',
    description: 'Concession, but, hypothèse, conséquence — niveau C1.',
    lessons: [
      {
        id: 'conn-nuance',
        title: 'Concession, but, hypothèse, conséquence',
        minutes: 14,
        theory: [
          'Concession : bien que + subj., malgré, encore que, quoi que.',
          'But : afin que + subj., de peur que, pour que.',
          'Hypothèse : au cas où + cond., si d’aventure…',
          'Conséquence : si bien que, de sorte que, au point que.',
        ],
        examples: [
          { bad: 'Bien qu’il est tard…', good: 'Bien qu’il soit tard…' },
          { bad: 'Pour que tu réussis…', good: 'Pour que tu réussisses…' },
        ],
        quiz: [
          { q: 'Concession + subjonctif :', options: ['parce que', 'bien que', 'donc'], answer: 1, explain: 'bien que + subj.' },
          { q: '« Afin que chacun ___ . »', options: ['comprend', 'comprenne', 'comprendra'], answer: 1, explain: 'afin que + subj.' },
          { q: 'Conséquence :', options: ['si bien que', 'bien que', 'afin que'], answer: 0, explain: 'si bien que = conséquence.' },
          { q: '« Au cas où tu ___ en retard… »', options: ['es', 'serais', 'sois'], answer: 1, explain: 'au cas où + conditionnel.' },
          { q: '« ___ les difficultés, il continue. »', options: ['Bien que', 'Malgré', 'Afin que'], answer: 1, explain: 'Malgré + nom.' },
          { q: '« De peur qu’il ne ___ . »', options: ['vient', 'vienne', 'viendra'], answer: 1, explain: 'de peur que + subj. (ne explétif possible).' },
        ],
      },
    ],
  },
  {
    id: 'transformations',
    title: 'Transformations de phrases',
    icon: '↻',
    color: 'ee',
    description: 'Actif ↔ passif, direct ↔ indirect, phrase ↔ nominalisation.',
    lessons: [
      {
        id: 'transf-base',
        title: 'Transformer sans changer le sens',
        minutes: 14,
        theory: [
          'Compétence clé en EE : reformuler (surtout Tâche 3).',
          'Actif → passif ; proposition → nominalisation ; citation → discours indirect.',
        ],
        examples: [
          { bad: 'Le jury a évalué les copies.', good: 'Les copies ont été évaluées par le jury.' },
          { bad: 'Il a dit : « Je refuse. »', good: 'Il a déclaré qu’il refusait.' },
        ],
        quiz: [
          { q: 'Passif de « On a adopté la loi » :', options: ['La loi a adopté.', 'La loi a été adoptée.', 'On été adopté la loi.'], answer: 1, explain: 'Passif correct.' },
          { q: 'Indirect de « Je partirai » : Il a dit qu’il ___.', options: ['partira', 'partirait', 'part'], answer: 1, explain: 'Conditionnel.' },
          { q: 'Nominalise « Ils ont décidé de reporter » :', options: ['Leur décision de reporter', 'Ils décision report', 'Décider reportent'], answer: 0, explain: 'Nominalisation.' },
          { q: '« On doit agir » → formel :', options: ['Il faut agir.', 'Faut kiffer.', 'On doit trop agir.'], answer: 0, explain: 'Il faut / Il convient de.' },
          { q: 'Relatif : « le livre ; je parle de ce livre » →', options: ['le livre que je parle', 'le livre dont je parle', 'le livre qui je parle'], answer: 1, explain: 'dont.' },
        ],
      },
    ],
  },
  {
    id: 'certitude-doute',
    title: 'Certitude et doute',
    icon: '?',
    color: 'ce',
    description: 'Exprimer le certain, le probable, le doute (indicatif vs subjonctif).',
    lessons: [
      {
        id: 'cert-doute',
        title: 'Indicatif ou subjonctif ?',
        minutes: 12,
        theory: [
          'Certitude / opinion affirmative → souvent indicatif (Je sais que, Il est clair que).',
          'Doute / négation / interrogation → souvent subjonctif (Je doute que, Il n’est pas sûr que).',
          'Nuancer évite les affirmations trop abruptes en Tâche 3.',
        ],
        examples: [
          { bad: 'Je doute qu’il a raison.', good: 'Je doute qu’il ait raison.' },
          { bad: 'Il est certain qu’il soit là. (souvent indicatif)', good: 'Il est certain qu’il est là.' },
        ],
        quiz: [
          { q: '« Je doute qu’il ___ . »', options: ['vient', 'vienne', 'viendra'], answer: 1, explain: 'doute que + subj.' },
          { q: '« Il est clair que nous ___ raison. »', options: ['ayons', 'avons', 'aurions eu sans'], answer: 1, explain: 'Certitude → indicatif.' },
          { q: '« Il n’est pas sûr qu’elle ___ . »', options: ['accepte', 'accepte (ind.)', 'accepte → subj. accepte/accepte : forme subj. « accepte »'], answer: 0, explain: 'Négation de certitude → subjonctif (qu’elle accepte).' },
          { q: 'Nuance de doute :', options: ['Évidemment…', 'Il se pourrait que…', 'Certainement…'], answer: 1, explain: 'Il se pourrait que…' },
          { q: '« Je suis convaincu qu’il ___ tort. »', options: ['ait', 'a', 'ait eu seulement'], answer: 1, explain: 'Conviction → indicatif.' },
        ],
      },
    ],
  },
  {
    id: 'subjonctif-avance',
    title: 'Subjonctif approfondi',
    icon: 'que',
    color: 'ee',
    description: 'Au-delà de « il faut que » : émotions, superlatifs, indéfinis.',
    lessons: [
      {
        id: 'subj-adv',
        title: 'Subjonctif : cas avancés',
        minutes: 14,
        theory: [
          'Émotions : Je regrette que, Je suis content que + subj.',
          'Superlatif / indéfini : le seul qui, le premier qui, qui que, où que…',
          'Locutions : jusqu’à ce que, avant que, pourvu que, à condition que.',
        ],
        examples: [
          { bad: 'Je suis heureux que tu es là.', good: 'Je suis heureux que tu sois là.' },
          { bad: 'Avant que tu pars…', good: 'Avant que tu partes…' },
        ],
        quiz: [
          { q: '« Je regrette qu’il ___ absent. »', options: ['est', 'soit', 'sera'], answer: 1, explain: 'Émotion → subj.' },
          { q: '« Avant que nous ___, vérifions. »', options: ['partons', 'partions', 'partirons'], answer: 1, explain: 'avant que + subj.' },
          { q: '« Pourvu qu’il ___ à temps ! »', options: ['arrive', 'arrive (ind.)', 'arrivait'], answer: 0, explain: 'pourvu que + subj. (forme : arrive).' },
          { q: '« C’est le seul qui ___ compris. »', options: ['a', 'ait', 'avait'], answer: 1, explain: 'le seul qui + souvent subj.' },
          { q: '« Jusqu’à ce que tu ___. »', options: ['finis', 'finisses', 'finiras'], answer: 1, explain: 'jusqu’à ce que + subj.' },
          { q: '« À condition que vous ___ d’accord. »', options: ['êtes', 'soyez', 'serez'], answer: 1, explain: 'à condition que + subj.' },
        ],
      },
    ],
  },

  {
    id: 'homophones',
    title: 'Homophones grammaticaux',
    icon: 'a/à',
    color: 'amber',
    description: 'ou/où, a/à, et/est, son/sont, ces/ses, ce/se, sa/ça, c’est/s’est, leur/leurs, on/ont.',
    lessons: [
      {
        id: 'homo-ou-ou',
        title: 'ou / où',
        minutes: 10,
        theory: [
          'ou (sans accent) = conjonction « ou bien » (choix).',
          'où (avec accent) = lieu ou moment (interrogatif ou relatif).',
          'Astuce : si tu peux remplacer par « ou bien », c’est ou ; si c’est un endroit/temps, c’est où.',
        ],
        examples: [
          { bad: 'Tu viens ou tu restes ?', good: 'Tu viens ou tu restes ? (correct)' },
          { bad: 'La ville ou j’habite…', good: 'La ville où j’habite…' },
          { bad: 'Ou vas-tu ?', good: 'Où vas-tu ?' },
        ],
        quiz: [
          { q: '« Tu préfères le thé ___ le café ? »', options: ['ou', 'où'], answer: 0, explain: 'Choix → ou.' },
          { q: '« ___ habites-tu ? »', options: ['Ou', 'Où'], answer: 1, explain: 'Lieu → Où.' },
          { q: '« Le jour ___ nous nous sommes rencontrés… »', options: ['ou', 'où'], answer: 1, explain: 'Moment relatif → où.' },
          { q: '« Thé ___ café, peu importe. »', options: ['ou', 'où'], answer: 0, explain: 'Alternative → ou.' },
          { q: '« Je ne sais pas ___ ranger ce dossier. »', options: ['ou', 'où'], answer: 1, explain: 'Lieu → où.' },
          { q: '« Paris ___ Lyon ? »', options: ['ou', 'où'], answer: 0, explain: 'Choix → ou.' },
        ],
      },
      {
        id: 'homo-a-a',
        title: 'a / à',
        minutes: 10,
        theory: [
          'a (sans accent) = verbe avoir (il/elle/on a).',
          'à (avec accent) = préposition (lieu, temps, destinataire…).',
          'Astuce : remplace par « avait » — si la phrase tient, c’est a (verbe).',
        ],
        examples: [
          { bad: 'Il à un projet.', good: 'Il a un projet.' },
          { bad: 'Je vais a Paris.', good: 'Je vais à Paris.' },
        ],
        quiz: [
          { q: '« Elle ___ trois frères. »', options: ['a', 'à'], answer: 0, explain: 'Verbe avoir → a.' },
          { q: '« Nous allons ___ Montréal. »', options: ['a', 'à'], answer: 1, explain: 'Préposition → à.' },
          { q: '« Il ___ oublié son dossier. »', options: ['a', 'à'], answer: 0, explain: 'avoir → a.' },
          { q: '« De 9 h ___ 12 h. »', options: ['a', 'à'], answer: 1, explain: 'Préposition temporelle → à.' },
          { q: '« Qui ___ dit cela ? »', options: ['a', 'à'], answer: 0, explain: 'Verbe → a.' },
          { q: '« Je pense ___ toi. »', options: ['a', 'à'], answer: 1, explain: 'penser à → à.' },
        ],
      },
      {
        id: 'homo-et-est',
        title: 'et / est',
        minutes: 10,
        theory: [
          'et = conjonction « and ».',
          'est = verbe être (il/elle/on est).',
          'Astuce : remplace par « était » — si ça marche, c’est est.',
        ],
        examples: [
          { bad: 'Il et intelligent.', good: 'Il est intelligent.' },
          { bad: 'Paul est Marie arrivent.', good: 'Paul et Marie arrivent.' },
        ],
        quiz: [
          { q: '« Le rapport ___ clair. »', options: ['et', 'est'], answer: 1, explain: 'Verbe être → est.' },
          { q: '« Grammaire ___ vocabulaire comptent. »', options: ['et', 'est'], answer: 0, explain: 'Liaison → et.' },
          { q: '« Elle ___ arrivée hier. »', options: ['et', 'est'], answer: 1, explain: 'être → est.' },
          { q: '« Lecture ___ écriture. »', options: ['et', 'est'], answer: 0, explain: 'et = and.' },
          { q: '« C’ ___ une bonne idée. »', options: ['et', 'est'], answer: 1, explain: 'c’est → est.' },
          { q: '« Le café ___ le thé sont prêts. »', options: ['et', 'est'], answer: 0, explain: 'Coordination → et.' },
        ],
      },
      {
        id: 'homo-son-sont',
        title: 'son / sont',
        minutes: 10,
        theory: [
          'son = déterminant possessif (son livre).',
          'sont = verbe être (ils/elles sont).',
          'Astuce : remplace par « étaient » → si OK, c’est sont.',
        ],
        examples: [
          { bad: 'Ils son partis.', good: 'Ils sont partis.' },
          { bad: 'Il a oublié sont sac.', good: 'Il a oublié son sac.' },
        ],
        quiz: [
          { q: '« Les résultats ___ excellents. »', options: ['son', 'sont'], answer: 1, explain: 'Verbe → sont.' },
          { q: '« Il a pris ___ manteau. »', options: ['son', 'sont'], answer: 0, explain: 'Possessif → son.' },
          { q: '« Elles ___ d’accord. »', options: ['son', 'sont'], answer: 1, explain: 'être pluriel → sont.' },
          { q: '« ___ avis compte. »', options: ['Son', 'Sont'], answer: 0, explain: 'Possessif → Son.' },
          { q: '« Où ___ les clés ? »', options: ['son', 'sont'], answer: 1, explain: 'Verbe → sont.' },
          { q: '« Chacun défend ___ point de vue. »', options: ['son', 'sont'], answer: 0, explain: 'Possessif → son.' },
        ],
      },
      {
        id: 'homo-ces-ses',
        title: 'ces / ses',
        minutes: 10,
        theory: [
          'ces = démonstratif pluriel (ces documents).',
          'ses = possessif pluriel (ses documents = à lui/elle).',
          'Astuce : « ces » montre ; « ses » appartient.',
        ],
        examples: [
          { bad: 'Regarde ses photos-là (en montrant).', good: 'Regarde ces photos-là.' },
          { bad: 'Elle a oublié ces lunettes (les siennes).', good: 'Elle a oublié ses lunettes.' },
        ],
        quiz: [
          { q: '« ___ arguments sont convaincants. » (en montrant)', options: ['Ces', 'Ses'], answer: 0, explain: 'Démonstratif → Ces.' },
          { q: '« Elle range ___ affaires. »', options: ['ces', 'ses'], answer: 1, explain: 'Possessif → ses.' },
          { q: '« ___ deux options me conviennent. »', options: ['Ces', 'Ses'], answer: 0, explain: 'Démonstratif → Ces.' },
          { q: '« Il a publié ___ articles. » (les siens)', options: ['ces', 'ses'], answer: 1, explain: 'Possessif → ses.' },
          { q: '« ___ idées-ci sont nouvelles. »', options: ['Ces', 'Ses'], answer: 0, explain: 'Démonstratif + -ci → Ces.' },
          { q: '« Chacun a ___ habitudes. »', options: ['ces', 'ses'], answer: 1, explain: 'Possessif → ses.' },
        ],
      },
      {
        id: 'homo-ce-se',
        title: 'ce / se',
        minutes: 10,
        theory: [
          'ce = démonstratif (ce projet, ce qui…).',
          'se = pronom réfléchi devant un verbe (se lever, s’appeler).',
          'Astuce : si un verbe pronominal suit, souvent se/s’.',
        ],
        examples: [
          { bad: 'Il ce lève tôt.', good: 'Il se lève tôt.' },
          { bad: 'Se n’est pas clair.', good: 'Ce n’est pas clair.' },
        ],
        quiz: [
          { q: '« ___ problème est sérieux. »', options: ['Ce', 'Se'], answer: 0, explain: 'Démonstratif → Ce.' },
          { q: '« Elle ___ prépare à l’examen. »', options: ['ce', 'se'], answer: 1, explain: 'Verbe pronominal → se.' },
          { q: '« ___ qui compte, c’est l’effort. »', options: ['Ce', 'Se'], answer: 0, explain: 'Ce qui…' },
          { q: '« Ils ___ sont trompés. »', options: ['ce', 'se'], answer: 1, explain: 'Pronominal → se.' },
          { q: '« ___ document manque. »', options: ['Ce', 'Se'], answer: 0, explain: 'Démonstratif → Ce.' },
          { q: '« On ___ demande pourquoi. »', options: ['ce', 'se'], answer: 1, explain: 'se demander.' },
        ],
      },
      {
        id: 'homo-sa-ca',
        title: 'sa / ça',
        minutes: 8,
        theory: [
          'sa = possessif féminin singulier (sa décision).',
          'ça = forme courante de cela — à limiter en EE formelle (préfère cela).',
        ],
        examples: [
          { bad: 'Il a pris ça décision.', good: 'Il a pris sa décision.' },
          { bad: 'Sa va mieux.', good: 'Ça va mieux. / Cela va mieux.' },
        ],
        quiz: [
          { q: '« ___ proposition est claire. » (à elle)', options: ['Sa', 'Ça'], answer: 0, explain: 'Possessif → Sa.' },
          { q: '« ___ ne change rien. »', options: ['Sa', 'Ça'], answer: 1, explain: 'cela → Ça.' },
          { q: '« Chacun a ___ méthode. »', options: ['sa', 'ça'], answer: 0, explain: 'Possessif → sa.' },
          { q: 'En EE formelle, préfère :', options: ['Ça prouve que…', 'Cela prouve que…', 'Sa prouve que…'], answer: 1, explain: 'cela plus formel.' },
          { q: '« ___ voiture est en panne. »', options: ['Sa', 'Ça'], answer: 0, explain: 'Possessif → Sa.' },
        ],
      },
      {
        id: 'homo-cest-sest',
        title: 'c’est / s’est',
        minutes: 10,
        theory: [
          'c’est = ce + est (présentation).',
          's’est = se + est (passé composé d’un verbe pronominal).',
          'Astuce : s’est + participe passé ; c’est + nom/adjectif.',
        ],
        examples: [
          { bad: 'Elle c’est levée tôt.', good: 'Elle s’est levée tôt.' },
          { bad: 'S’est une bonne idée.', good: 'C’est une bonne idée.' },
        ],
        quiz: [
          { q: '« ___ une excellente analyse. »', options: ['C’est', 'S’est'], answer: 0, explain: 'Présentation → C’est.' },
          { q: '« Il ___ trompé de salle. »', options: ['c’est', 's’est'], answer: 1, explain: 'Pronominal → s’est.' },
          { q: '« ___ pourquoi nous insistons. »', options: ['C’est', 'S’est'], answer: 0, explain: 'C’est pourquoi…' },
          { q: '« Elle ___ souvenue du nom. »', options: ['c’est', 's’est'], answer: 1, explain: 'se souvenir → s’est.' },
          { q: '« ___ difficile à expliquer. »', options: ['C’est', 'S’est'], answer: 0, explain: 'C’est + adj.' },
          { q: '« Il ___ présenté clairement. »', options: ['c’est', 's’est'], answer: 1, explain: 'se présenter → s’est.' },
        ],
      },
      {
        id: 'homo-leur-leurs',
        title: 'leur / leurs',
        minutes: 10,
        theory: [
          'leur / leurs = possessif selon le nombre de choses possédées.',
          'leur (invariable) = pronom COI : Je leur parle.',
        ],
        examples: [
          { bad: 'Je leurs parle.', good: 'Je leur parle.' },
          { bad: 'Ils ont rangé leur affaires.', good: 'Ils ont rangé leurs affaires.' },
        ],
        quiz: [
          { q: '« Je ___ ai expliqué la règle. » (à eux)', options: ['leur', 'leurs'], answer: 0, explain: 'COI → leur.' },
          { q: '« Ils ont oublié ___ clés. »', options: ['leur', 'leurs'], answer: 1, explain: 'Plusieurs clés → leurs.' },
          { q: '« ___ avis divergent. »', options: ['Leur', 'Leurs'], answer: 1, explain: 'Plusieurs avis → Leurs.' },
          { q: '« On ___ a envoyé un message. »', options: ['leur', 'leurs'], answer: 0, explain: 'COI → leur.' },
          { q: '« ___ voiture est en panne. » (une seule)', options: ['Leur', 'Leurs'], answer: 0, explain: 'Une voiture → Leur.' },
          { q: '« ___ enfants sont scolarisés. »', options: ['Leur', 'Leurs'], answer: 1, explain: 'Plusieurs → Leurs.' },
        ],
      },
      {
        id: 'homo-on-ont',
        title: 'on / ont',
        minutes: 10,
        theory: [
          'on = pronom indéfini.',
          'ont = verbe avoir (ils/elles ont).',
          'Astuce : remplace par « avaient » → si OK, c’est ont.',
        ],
        examples: [
          { bad: 'Ils on fini.', good: 'Ils ont fini.' },
          { bad: 'Ont dit que c’est important.', good: 'On dit que c’est important.' },
        ],
        quiz: [
          { q: '« ___ affirme que la mesure est utile. »', options: ['On', 'Ont'], answer: 0, explain: 'Pronom → On.' },
          { q: '« Ils ___ obtenu de bons résultats. »', options: ['on', 'ont'], answer: 1, explain: 'avoir → ont.' },
          { q: '« ___ ne peut pas ignorer ce fait. »', options: ['On', 'Ont'], answer: 0, explain: 'On.' },
          { q: '« Les experts ___ des doutes. »', options: ['on', 'ont'], answer: 1, explain: 'Verbe → ont.' },
          { q: '« ___ parle beaucoup de ce sujet. »', options: ['On', 'Ont'], answer: 0, explain: 'On parle…' },
          { q: '« Elles ___ choisi l’option B. »', options: ['on', 'ont'], answer: 1, explain: 'avoir → ont.' },
        ],
      },
      {
        id: 'homo-mix',
        title: 'Entraînement mixte (homophones)',
        minutes: 15,
        theory: [
          'Mélange des paires les plus fréquentes en EE.',
          'Relis toujours a/à, et/est, on/ont, ou/où avant de soumettre.',
        ],
        examples: [
          { bad: 'On a dit que c’est ou il faut aller.', good: 'On a dit que c’est là où il faut aller.' },
        ],
        quiz: [
          { q: '« Il ___ réussi ___ l’examen. »', options: ['a / à', 'à / a', 'a / a'], answer: 0, explain: 'a (verbe) + à (prép.).' },
          { q: '« ___ dit qu’ils ___ raison. »', options: ['On / ont', 'Ont / on', 'On / on'], answer: 0, explain: 'On dit… ils ont…' },
          { q: '« Thé ___ café, ___ tu veux. »', options: ['ou / où', 'où / ou', 'ou / ou'], answer: 0, explain: 'ou + où.' },
          { q: '« ___ livre ___ sur la table. »', options: ['Son / est', 'Sont / et', 'Son / et'], answer: 0, explain: 'Son + est.' },
          { q: '« ___ idées ___ les siennes. »', options: ['Ces / sont', 'Ses / son', 'Ces / son'], answer: 0, explain: 'Ces idées sont…' },
          { q: '« Elle ___ levée tôt. »', options: ['s’est', 'c’est', 'se est'], answer: 0, explain: 'Pronominal → s’est.' },
          { q: '« Je ___ parle de ___ projet. »', options: ['leur / leur', 'leurs / leur', 'leur / leurs'], answer: 0, explain: 'COI leur + leur projet.' },
          { q: '« ___ n’___ pas simple. »', options: ['Cela / est', 'Sa / et', 'Ça / et'], answer: 0, explain: 'Cela est… (formel).' },
          { q: '« Paul ___ Marie ___ arrivés. »', options: ['et / sont', 'est / son', 'et / son'], answer: 0, explain: 'et + sont.' },
          { q: '« ___ ___ besoin de calme. »', options: ['On / a', 'Ont / à', 'On / à'], answer: 0, explain: 'On a besoin…' },
          { q: '« La ville ___ il ___ grandi… »', options: ['où / a', 'ou / à', 'où / à'], answer: 0, explain: 'où + a.' },
          { q: '« ___ documents sont prêts. » (à eux)', options: ['Ses', 'Ces', 'Son'], answer: 0, explain: 'Possessif pluriel → Ses.' },
          { q: '« ___ sont les consignes. »', options: ['Ce', 'Se', 'Ceux'], answer: 0, explain: 'Ce sont…' },
          { q: '« Il ___ ___ trompé. »', options: ['s’ / est', 'c’ / est', 's’ / et'], answer: 0, explain: 's’est trompé.' },
          { q: '« Vas-tu à Paris ___ à Lyon ? »', options: ['ou', 'où', 'et'], answer: 0, explain: 'Choix → ou.' },
        ],
      },
    ],
  },

]

function withExtras(modules) {
  return modules.map((m) => {
    const extra = EXTRA_LESSONS[m.id]
    if (!extra) return m
    return { ...m, lessons: [...m.lessons, ...extra] }
  })
}

export const EE_CURRICULUM = [...BASE_CURRICULUM, ...withExtras(EE_ERROR_BANK_MODULES)]

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
