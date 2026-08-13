import type { Question } from "../types";

export const QUESTIONS_2025: Question[] = [
  {
    id: "situation-conjugale",
    type: "single-choice",
    prompt: "Quelle est votre situation ?",
    helpText:
      "Cela détermine notamment le nombre de « parts » retenues pour le calcul de votre impôt.",
    options: [
      { value: "celibataire", label: "Célibataire, sans conjoint·e" },
      { value: "couple", label: "Marié·e ou pacsé·e" },
      {
        value: "autre",
        label: "Une autre situation (divorce, veuvage, union libre avec garde partagée...)",
      },
    ],
  },
  {
    id: "nombre-enfants-a-charge",
    type: "number",
    prompt: "Combien d'enfants avez-vous à charge ?",
    helpText:
      "Un enfant à charge, c'est un enfant que vous rattachez à votre déclaration (généralement mineur, ou majeur encore étudiant et non imposé séparément).",
    isVisible: (answers) => answers["situation-conjugale"] === "couple",
    validate: (value) =>
      typeof value === "number" && Number.isInteger(value) && value >= 0
        ? undefined
        : "Merci d'indiquer un nombre entier positif ou nul.",
  },
  {
    id: "fiche-paie-disponible",
    type: "boolean",
    prompt: "Avez-vous sous les yeux votre fiche de paie de décembre 2025 (cumul annuel) ?",
    helpText:
      "Si vous ne l'avez pas encore reçue — par exemple parce que vous voulez anticiper une augmentation de salaire en cours d'année — vous pourrez indiquer votre salaire brut annuel à la place, et nous calculerons une estimation.",
    isVisible: (answers) =>
      answers["situation-conjugale"] === "celibataire" ||
      answers["situation-conjugale"] === "couple",
  },
  {
    id: "salaire-net-imposable-2025",
    type: "number",
    prompt: "Quel est le montant total que vous avez gagné en 2025 grâce à votre emploi ?",
    helpText:
      "Reportez le montant « Net imposable » (cumul annuel) de votre fiche de paie de décembre 2025. Attention : ce n'est pas le montant « Net à payer » viré sur votre compte — le net imposable est toujours un peu plus élevé.",
    isVisible: (answers) =>
      (answers["situation-conjugale"] === "celibataire" ||
        answers["situation-conjugale"] === "couple") &&
      answers["fiche-paie-disponible"] === true,
    validate: (value) =>
      typeof value === "number" && value >= 0
        ? undefined
        : "Merci d'indiquer un montant positif ou nul.",
  },
  {
    id: "salaire-brut-annuel-2025",
    type: "number",
    prompt: "Quel est votre salaire brut annuel fixe ?",
    helpText:
      "C'est le montant avant toute retenue, tel qu'indiqué dans votre contrat de travail. Comme vous n'avez pas votre fiche de paie de décembre sous la main, nous calculerons une estimation à partir de ce montant — à confirmer plus tard avec votre fiche de paie réelle.",
    isVisible: (answers) =>
      (answers["situation-conjugale"] === "celibataire" ||
        answers["situation-conjugale"] === "couple") &&
      answers["fiche-paie-disponible"] === false,
    validate: (value) =>
      typeof value === "number" && value >= 0
        ? undefined
        : "Merci d'indiquer un montant positif ou nul.",
  },
  {
    id: "chomage",
    type: "boolean",
    prompt: "Avez-vous aussi perçu des allocations chômage (France Travail) en 2025 ?",
    isVisible: (answers) =>
      answers["situation-conjugale"] === "celibataire" ||
      answers["situation-conjugale"] === "couple",
  },
  {
    id: "montant-chomage-2025",
    type: "number",
    prompt: "Quel est le montant imposable de vos allocations chômage perçues en 2025 ?",
    helpText:
      "Ce montant figure sur votre attestation fiscale annuelle, envoyée par France Travail (ex Pôle emploi) en début d'année suivante. Ce n'est pas le total versé sur votre compte : l'attestation indique déjà la part imposable.",
    isVisible: (answers) =>
      (answers["situation-conjugale"] === "celibataire" ||
        answers["situation-conjugale"] === "couple") &&
      answers["chomage"] === true,
    validate: (value) =>
      typeof value === "number" && value >= 0
        ? undefined
        : "Merci d'indiquer un montant positif ou nul.",
  },
  {
    id: "pension",
    type: "boolean",
    prompt: "Avez-vous perçu une pension de retraite en 2025 ?",
    isVisible: (answers) =>
      answers["situation-conjugale"] === "celibataire" ||
      answers["situation-conjugale"] === "couple",
  },
  {
    id: "montant-pension-2025",
    type: "number",
    prompt: "Quel est le montant imposable de votre pension de retraite perçue en 2025 ?",
    helpText:
      "C'est le montant brut, avant tout abattement — souvent déjà pré-rempli sur votre déclaration si votre caisse de retraite l'a transmis à l'administration. Ne déduisez rien vous-même : l'abattement est calculé automatiquement.",
    isVisible: (answers) =>
      (answers["situation-conjugale"] === "celibataire" ||
        answers["situation-conjugale"] === "couple") &&
      answers["pension"] === true,
    validate: (value) =>
      typeof value === "number" && value >= 0
        ? undefined
        : "Merci d'indiquer un montant positif ou nul.",
  },
  {
    id: "conjoint-a-un-salaire",
    type: "boolean",
    prompt: "Votre conjoint·e a-t-il/elle également un salaire à déclarer ?",
    isVisible: (answers) => answers["situation-conjugale"] === "couple",
  },
  {
    id: "fiche-paie-disponible-conjoint",
    type: "boolean",
    prompt: "Avez-vous sous les yeux la fiche de paie de décembre 2025 (cumul annuel) de votre conjoint·e ?",
    helpText:
      "Si vous ne l'avez pas encore reçue, vous pourrez indiquer son salaire brut annuel à la place, et nous calculerons une estimation.",
    isVisible: (answers) =>
      answers["situation-conjugale"] === "couple" && answers["conjoint-a-un-salaire"] === true,
  },
  {
    id: "salaire-net-imposable-2025-conjoint",
    type: "number",
    prompt: "Quel est le montant total que votre conjoint·e a gagné en 2025 grâce à son emploi ?",
    helpText:
      "Reportez le montant « Net imposable » (cumul annuel) de sa fiche de paie de décembre 2025. Attention : ce n'est pas le montant « Net à payer » viré sur son compte — le net imposable est toujours un peu plus élevé.",
    isVisible: (answers) =>
      answers["situation-conjugale"] === "couple" &&
      answers["conjoint-a-un-salaire"] === true &&
      answers["fiche-paie-disponible-conjoint"] === true,
    validate: (value) =>
      typeof value === "number" && value >= 0
        ? undefined
        : "Merci d'indiquer un montant positif ou nul.",
  },
  {
    id: "salaire-brut-annuel-2025-conjoint",
    type: "number",
    prompt: "Quel est le salaire brut annuel fixe de votre conjoint·e ?",
    helpText:
      "C'est le montant avant toute retenue, tel qu'indiqué dans son contrat de travail. Comme vous n'avez pas sa fiche de paie de décembre sous la main, nous calculerons une estimation à partir de ce montant — à confirmer plus tard avec sa fiche de paie réelle.",
    isVisible: (answers) =>
      answers["situation-conjugale"] === "couple" &&
      answers["conjoint-a-un-salaire"] === true &&
      answers["fiche-paie-disponible-conjoint"] === false,
    validate: (value) =>
      typeof value === "number" && value >= 0
        ? undefined
        : "Merci d'indiquer un montant positif ou nul.",
  },
  {
    id: "chomage-conjoint",
    type: "boolean",
    prompt: "Votre conjoint·e a-t-il/elle aussi perçu des allocations chômage en 2025 ?",
    isVisible: (answers) => answers["situation-conjugale"] === "couple",
  },
  {
    id: "montant-chomage-2025-conjoint",
    type: "number",
    prompt: "Quel est le montant imposable des allocations chômage perçues par votre conjoint·e en 2025 ?",
    helpText:
      "Ce montant figure sur son attestation fiscale annuelle, envoyée par France Travail (ex Pôle emploi) en début d'année suivante. Ce n'est pas le total versé sur son compte : l'attestation indique déjà la part imposable.",
    isVisible: (answers) =>
      answers["situation-conjugale"] === "couple" && answers["chomage-conjoint"] === true,
    validate: (value) =>
      typeof value === "number" && value >= 0
        ? undefined
        : "Merci d'indiquer un montant positif ou nul.",
  },
  {
    id: "pension-conjoint",
    type: "boolean",
    prompt: "Votre conjoint·e a-t-il/elle perçu une pension de retraite en 2025 ?",
    isVisible: (answers) => answers["situation-conjugale"] === "couple",
  },
  {
    id: "montant-pension-2025-conjoint",
    type: "number",
    prompt: "Quel est le montant imposable de la pension de retraite perçue par votre conjoint·e en 2025 ?",
    helpText:
      "C'est le montant brut, avant tout abattement — souvent déjà pré-rempli sur votre déclaration si sa caisse de retraite l'a transmis à l'administration. Ne déduisez rien vous-même : l'abattement est calculé automatiquement.",
    isVisible: (answers) =>
      answers["situation-conjugale"] === "couple" && answers["pension-conjoint"] === true,
    validate: (value) =>
      typeof value === "number" && value >= 0
        ? undefined
        : "Merci d'indiquer un montant positif ou nul.",
  },
  {
    id: "foncier",
    type: "boolean",
    prompt: "Avez-vous mis un logement en location (non meublée) en 2025, et perçu des loyers ?",
    helpText:
      "Cette question concerne uniquement la location non meublée (location « nue »). La location meublée relève d'un régime différent, pas encore pris en charge par cet outil.",
    isVisible: (answers) =>
      answers["situation-conjugale"] === "celibataire" ||
      answers["situation-conjugale"] === "couple",
  },
  {
    id: "montant-foncier-2025",
    type: "number",
    prompt: "Quel est le montant total des loyers bruts perçus par votre foyer en 2025 ?",
    helpText:
      "Montant brut, hors charges, avant tout abattement. S'il y a plusieurs logements ou que vous êtes en couple, indiquez le total pour tout le foyer — une seule réponse suffit.",
    isVisible: (answers) =>
      (answers["situation-conjugale"] === "celibataire" ||
        answers["situation-conjugale"] === "couple") &&
      answers["foncier"] === true,
    validate: (value) =>
      typeof value === "number" && value >= 0
        ? undefined
        : "Merci d'indiquer un montant positif ou nul.",
  },
  {
    id: "activite-independante",
    type: "boolean",
    prompt: "Avez-vous une activité de micro-entrepreneur (auto-entrepreneur) en 2025 ?",
    helpText:
      "Cela concerne une activité indépendante enregistrée en micro-entreprise (auto-entrepreneur), pas un simple job ponctuel non déclaré.",
    isVisible: (answers) =>
      answers["situation-conjugale"] === "celibataire" ||
      answers["situation-conjugale"] === "couple",
  },
  {
    id: "type-activite-independante",
    type: "single-choice",
    prompt: "Quel est le type de cette activité ?",
    options: [
      {
        value: "vente",
        label: "Vente de marchandises ou de produits (commerce, artisanat de production, restauration à emporter...)",
      },
      {
        value: "service",
        label: "Une prestation de service artisanale ou commerciale (coiffure, réparation, conseil aux entreprises...)",
      },
      {
        value: "liberale",
        label: "Une activité libérale non commerciale (consulting, profession réglementée ou non...)",
      },
    ],
    isVisible: (answers) =>
      (answers["situation-conjugale"] === "celibataire" ||
        answers["situation-conjugale"] === "couple") &&
      answers["activite-independante"] === true,
  },
  {
    id: "chiffre-affaires-independant-2025",
    type: "number",
    prompt: "Quel est le montant total de votre chiffre d'affaires encaissé pour cette activité en 2025 ?",
    helpText:
      "Montant brut total facturé et encaissé, avant tout abattement. Ne déduisez aucune charge vous-même : l'abattement forfaitaire est calculé automatiquement selon votre type d'activité.",
    isVisible: (answers) =>
      (answers["situation-conjugale"] === "celibataire" ||
        answers["situation-conjugale"] === "couple") &&
      answers["activite-independante"] === true,
    validate: (value) =>
      typeof value === "number" && value >= 0
        ? undefined
        : "Merci d'indiquer un montant positif ou nul.",
  },
  {
    id: "activite-independante-conjoint",
    type: "boolean",
    prompt: "Votre conjoint·e a-t-il/elle aussi une activité de micro-entrepreneur (auto-entrepreneur) en 2025 ?",
    helpText:
      "Cela concerne une activité indépendante enregistrée en micro-entreprise (auto-entrepreneur), pas un simple job ponctuel non déclaré.",
    isVisible: (answers) => answers["situation-conjugale"] === "couple",
  },
  {
    id: "type-activite-independante-conjoint",
    type: "single-choice",
    prompt: "Quel est le type de cette activité (conjoint·e) ?",
    options: [
      {
        value: "vente",
        label: "Vente de marchandises ou de produits (commerce, artisanat de production, restauration à emporter...)",
      },
      {
        value: "service",
        label: "Une prestation de service artisanale ou commerciale (coiffure, réparation, conseil aux entreprises...)",
      },
      {
        value: "liberale",
        label: "Une activité libérale non commerciale (consulting, profession réglementée ou non...)",
      },
    ],
    isVisible: (answers) =>
      answers["situation-conjugale"] === "couple" &&
      answers["activite-independante-conjoint"] === true,
  },
  {
    id: "chiffre-affaires-independant-2025-conjoint",
    type: "number",
    prompt: "Quel est le montant total du chiffre d'affaires encaissé par votre conjoint·e pour cette activité en 2025 ?",
    helpText:
      "Montant brut total facturé et encaissé, avant tout abattement. Ne déduisez aucune charge vous-même : l'abattement forfaitaire est calculé automatiquement selon le type d'activité.",
    isVisible: (answers) =>
      answers["situation-conjugale"] === "couple" &&
      answers["activite-independante-conjoint"] === true,
    validate: (value) =>
      typeof value === "number" && value >= 0
        ? undefined
        : "Merci d'indiquer un montant positif ou nul.",
  },
];
