import type { Question } from "../types";

export const QUESTIONS_2025: Question[] = [
  {
    id: "situation-familiale-simple",
    type: "boolean",
    prompt: "Êtes-vous célibataire (ni marié·e, ni pacsé·e), sans personne à charge ?",
    helpText:
      "Une personne à charge, c'est par exemple un enfant que vous rattachez à votre déclaration.",
  },
  {
    id: "fiche-paie-disponible",
    type: "boolean",
    prompt: "Avez-vous sous les yeux votre fiche de paie de décembre 2025 (cumul annuel) ?",
    helpText:
      "Si vous ne l'avez pas encore reçue — par exemple parce que vous voulez anticiper une augmentation de salaire en cours d'année — vous pourrez indiquer votre salaire brut annuel à la place, et nous calculerons une estimation.",
    isVisible: (answers) => answers["situation-familiale-simple"] === true,
  },
  {
    id: "salaire-net-imposable-2025",
    type: "number",
    prompt: "Quel est le montant total que vous avez gagné en 2025 grâce à votre emploi ?",
    helpText:
      "Reportez le montant « Net imposable » (cumul annuel) de votre fiche de paie de décembre 2025. Attention : ce n'est pas le montant « Net à payer » viré sur votre compte — le net imposable est toujours un peu plus élevé.",
    isVisible: (answers) =>
      answers["situation-familiale-simple"] === true &&
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
      answers["situation-familiale-simple"] === true &&
      answers["fiche-paie-disponible"] === false,
    validate: (value) =>
      typeof value === "number" && value >= 0
        ? undefined
        : "Merci d'indiquer un montant positif ou nul.",
  },
];
