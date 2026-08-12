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
];
