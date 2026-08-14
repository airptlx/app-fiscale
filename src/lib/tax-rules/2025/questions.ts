import { ANNEE_REVENUS_2025 } from "./constants";
import type { Question } from "../types";

const ANNEE_LABEL = `l'année dernière (${ANNEE_REVENUS_2025})`;

function situationConnue(situation: unknown): situation is "celibataire" | "couple" {
  return situation === "celibataire" || situation === "couple";
}

function includesOption(value: unknown, option: string): boolean {
  return Array.isArray(value) && (value as string[]).includes(option);
}

export const QUESTIONS_2025: Question[] = [
  {
    id: "situation-conjugale",
    type: "single-choice",
    prompt: "Quelle est ta situation ?",
    helpText: "Ça détermine notamment le nombre de « parts » retenues pour le calcul de ton impôt.",
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
    prompt: "Combien d'enfants as-tu à charge ?",
    helpText:
      "Un enfant à charge, c'est un enfant que tu rattaches à ta déclaration (généralement mineur, ou majeur encore étudiant et non imposé séparément).",
    isVisible: (answers) => answers["situation-conjugale"] === "couple",
    validate: (value) =>
      typeof value === "number" && Number.isInteger(value) && value >= 0
        ? undefined
        : "Indique un nombre entier positif ou nul.",
  },
  {
    id: "revenus",
    type: "multi-choice",
    prompt: `Qu'est-ce que tu as touché ${ANNEE_LABEL} ?`,
    helpText: "Coche tout ce qui s'applique — tu pourras préciser les montants juste après.",
    options: [
      { value: "salaire", label: "Un salaire" },
      { value: "chomage", label: "Des allocations chômage (France Travail)" },
      { value: "pension", label: "Une pension de retraite" },
    ],
    isVisible: (answers) => situationConnue(answers["situation-conjugale"]),
  },
  {
    id: "fiche-paie-disponible",
    type: "boolean",
    prompt: `Tu as sous les yeux ta fiche de paie de décembre de ${ANNEE_LABEL} (cumul annuel) ?`,
    helpText:
      "Si tu ne l'as pas encore reçue — par exemple parce que tu veux anticiper une augmentation de salaire en cours d'année — tu pourras indiquer ton salaire brut annuel à la place, et on calculera une estimation.",
    isVisible: (answers) =>
      situationConnue(answers["situation-conjugale"]) && includesOption(answers["revenus"], "salaire"),
  },
  {
    id: "salaire-net-imposable-2025",
    type: "number",
    prompt: `Quel est le montant total que tu as gagné ${ANNEE_LABEL} grâce à ton emploi ?`,
    helpText: `Reporte le montant « Net imposable » (cumul annuel) de ta fiche de paie de décembre de ${ANNEE_LABEL}. Attention : ce n'est pas le montant « Net à payer » viré sur ton compte — le net imposable est toujours un peu plus élevé.`,
    isVisible: (answers) =>
      situationConnue(answers["situation-conjugale"]) &&
      includesOption(answers["revenus"], "salaire") &&
      answers["fiche-paie-disponible"] === true,
    validate: (value) =>
      typeof value === "number" && value >= 0 ? undefined : "Indique un montant positif ou nul.",
  },
  {
    id: "salaire-brut-annuel-2025",
    type: "number",
    prompt: "Quel est ton salaire brut annuel fixe ?",
    helpText:
      "C'est le montant avant toute retenue, tel qu'indiqué dans ton contrat de travail. Comme tu n'as pas ta fiche de paie de décembre sous la main, on calculera une estimation à partir de ce montant — à confirmer plus tard avec ta fiche de paie réelle.",
    isVisible: (answers) =>
      situationConnue(answers["situation-conjugale"]) &&
      includesOption(answers["revenus"], "salaire") &&
      answers["fiche-paie-disponible"] === false,
    validate: (value) =>
      typeof value === "number" && value >= 0 ? undefined : "Indique un montant positif ou nul.",
  },
  {
    id: "montant-chomage-2025",
    type: "number",
    prompt: `Quel est le montant imposable de tes allocations chômage perçues ${ANNEE_LABEL} ?`,
    helpText:
      "Ce montant figure sur ton attestation fiscale annuelle, envoyée par France Travail (ex Pôle emploi) en début d'année suivante. Ce n'est pas le total versé sur ton compte : l'attestation indique déjà la part imposable.",
    isVisible: (answers) =>
      situationConnue(answers["situation-conjugale"]) && includesOption(answers["revenus"], "chomage"),
    validate: (value) =>
      typeof value === "number" && value >= 0 ? undefined : "Indique un montant positif ou nul.",
  },
  {
    id: "montant-pension-2025",
    type: "number",
    prompt: `Quel est le montant imposable de ta pension de retraite perçue ${ANNEE_LABEL} ?`,
    helpText:
      "C'est le montant brut, avant tout abattement — souvent déjà pré-rempli sur ta déclaration si ta caisse de retraite l'a transmis à l'administration. Ne déduis rien toi-même : l'abattement est calculé automatiquement.",
    isVisible: (answers) =>
      situationConnue(answers["situation-conjugale"]) && includesOption(answers["revenus"], "pension"),
    validate: (value) =>
      typeof value === "number" && value >= 0 ? undefined : "Indique un montant positif ou nul.",
  },
  {
    id: "revenus-conjoint",
    type: "multi-choice",
    prompt: `Et ton/ta conjoint·e, qu'est-ce qu'il/elle a touché ${ANNEE_LABEL} ?`,
    helpText: "Coche tout ce qui s'applique — tu pourras préciser les montants juste après.",
    options: [
      { value: "salaire", label: "Un salaire" },
      { value: "chomage", label: "Des allocations chômage (France Travail)" },
      { value: "pension", label: "Une pension de retraite" },
    ],
    isVisible: (answers) => answers["situation-conjugale"] === "couple",
  },
  {
    id: "fiche-paie-disponible-conjoint",
    type: "boolean",
    prompt: `Tu as sous les yeux la fiche de paie de décembre de ${ANNEE_LABEL} (cumul annuel) de ton/ta conjoint·e ?`,
    helpText:
      "Si tu ne l'as pas encore reçue, tu pourras indiquer son salaire brut annuel à la place, et on calculera une estimation.",
    isVisible: (answers) =>
      answers["situation-conjugale"] === "couple" &&
      includesOption(answers["revenus-conjoint"], "salaire"),
  },
  {
    id: "salaire-net-imposable-2025-conjoint",
    type: "number",
    prompt: `Quel est le montant total que ton/ta conjoint·e a gagné ${ANNEE_LABEL} grâce à son emploi ?`,
    helpText: `Reporte le montant « Net imposable » (cumul annuel) de sa fiche de paie de décembre de ${ANNEE_LABEL}. Attention : ce n'est pas le montant « Net à payer » viré sur son compte — le net imposable est toujours un peu plus élevé.`,
    isVisible: (answers) =>
      answers["situation-conjugale"] === "couple" &&
      includesOption(answers["revenus-conjoint"], "salaire") &&
      answers["fiche-paie-disponible-conjoint"] === true,
    validate: (value) =>
      typeof value === "number" && value >= 0 ? undefined : "Indique un montant positif ou nul.",
  },
  {
    id: "salaire-brut-annuel-2025-conjoint",
    type: "number",
    prompt: "Quel est le salaire brut annuel fixe de ton/ta conjoint·e ?",
    helpText:
      "C'est le montant avant toute retenue, tel qu'indiqué dans son contrat de travail. Comme tu n'as pas sa fiche de paie de décembre sous la main, on calculera une estimation à partir de ce montant — à confirmer plus tard avec sa fiche de paie réelle.",
    isVisible: (answers) =>
      answers["situation-conjugale"] === "couple" &&
      includesOption(answers["revenus-conjoint"], "salaire") &&
      answers["fiche-paie-disponible-conjoint"] === false,
    validate: (value) =>
      typeof value === "number" && value >= 0 ? undefined : "Indique un montant positif ou nul.",
  },
  {
    id: "montant-chomage-2025-conjoint",
    type: "number",
    prompt: `Quel est le montant imposable des allocations chômage perçues par ton/ta conjoint·e ${ANNEE_LABEL} ?`,
    helpText:
      "Ce montant figure sur son attestation fiscale annuelle, envoyée par France Travail (ex Pôle emploi) en début d'année suivante. Ce n'est pas le total versé sur son compte : l'attestation indique déjà la part imposable.",
    isVisible: (answers) =>
      answers["situation-conjugale"] === "couple" &&
      includesOption(answers["revenus-conjoint"], "chomage"),
    validate: (value) =>
      typeof value === "number" && value >= 0 ? undefined : "Indique un montant positif ou nul.",
  },
  {
    id: "montant-pension-2025-conjoint",
    type: "number",
    prompt: `Quel est le montant imposable de la pension de retraite perçue par ton/ta conjoint·e ${ANNEE_LABEL} ?`,
    helpText:
      "C'est le montant brut, avant tout abattement — souvent déjà pré-rempli sur ta déclaration si sa caisse de retraite l'a transmis à l'administration. Ne déduis rien toi-même : l'abattement est calculé automatiquement.",
    isVisible: (answers) =>
      answers["situation-conjugale"] === "couple" &&
      includesOption(answers["revenus-conjoint"], "pension"),
    validate: (value) =>
      typeof value === "number" && value >= 0 ? undefined : "Indique un montant positif ou nul.",
  },
  {
    id: "activites-annexes",
    type: "multi-choice",
    prompt: `Ton foyer a-t-il eu d'autres revenus ${ANNEE_LABEL} ?`,
    helpText:
      "Loyers : uniquement la location non meublée (la location meublée n'est pas encore prise en charge). Micro-entreprise : une vraie activité enregistrée, pas un job ponctuel non déclaré.",
    options: [
      { value: "foncier", label: "Des loyers (location non meublée)" },
      { value: "micro-entreprise", label: "Une activité de micro-entrepreneur (auto-entrepreneur)" },
    ],
    isVisible: (answers) => situationConnue(answers["situation-conjugale"]),
  },
  {
    id: "montant-foncier-2025",
    type: "number",
    prompt: `Quel est le montant total des loyers bruts perçus par ton foyer ${ANNEE_LABEL} ?`,
    helpText:
      "Montant brut, hors charges, avant tout abattement. S'il y a plusieurs logements ou que tu es en couple, indique le total pour tout le foyer — une seule réponse suffit.",
    isVisible: (answers) =>
      situationConnue(answers["situation-conjugale"]) &&
      includesOption(answers["activites-annexes"], "foncier"),
    validate: (value) =>
      typeof value === "number" && value >= 0 ? undefined : "Indique un montant positif ou nul.",
  },
  {
    id: "qui-activite-independante",
    type: "multi-choice",
    prompt: "Qui a cette activité de micro-entrepreneur ?",
    options: [
      { value: "toi", label: "Toi" },
      { value: "conjoint", label: "Ton/ta conjoint·e" },
    ],
    isVisible: (answers) =>
      answers["situation-conjugale"] === "couple" &&
      includesOption(answers["activites-annexes"], "micro-entreprise"),
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
      situationConnue(answers["situation-conjugale"]) &&
      includesOption(answers["activites-annexes"], "micro-entreprise") &&
      (answers["situation-conjugale"] === "celibataire" ||
        includesOption(answers["qui-activite-independante"], "toi")),
  },
  {
    id: "chiffre-affaires-independant-2025",
    type: "number",
    prompt: `Quel est le montant total de ton chiffre d'affaires encaissé pour cette activité ${ANNEE_LABEL} ?`,
    helpText:
      "Montant brut total facturé et encaissé, avant tout abattement. Ne déduis aucune charge toi-même : l'abattement forfaitaire est calculé automatiquement selon ton type d'activité.",
    isVisible: (answers) =>
      situationConnue(answers["situation-conjugale"]) &&
      includesOption(answers["activites-annexes"], "micro-entreprise") &&
      (answers["situation-conjugale"] === "celibataire" ||
        includesOption(answers["qui-activite-independante"], "toi")),
    validate: (value) =>
      typeof value === "number" && value >= 0 ? undefined : "Indique un montant positif ou nul.",
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
      includesOption(answers["activites-annexes"], "micro-entreprise") &&
      includesOption(answers["qui-activite-independante"], "conjoint"),
  },
  {
    id: "chiffre-affaires-independant-2025-conjoint",
    type: "number",
    prompt: `Quel est le montant total du chiffre d'affaires encaissé par ton/ta conjoint·e pour cette activité ${ANNEE_LABEL} ?`,
    helpText:
      "Montant brut total facturé et encaissé, avant tout abattement. Ne déduis aucune charge toi-même : l'abattement forfaitaire est calculé automatiquement selon le type d'activité.",
    isVisible: (answers) =>
      answers["situation-conjugale"] === "couple" &&
      includesOption(answers["activites-annexes"], "micro-entreprise") &&
      includesOption(answers["qui-activite-independante"], "conjoint"),
    validate: (value) =>
      typeof value === "number" && value >= 0 ? undefined : "Indique un montant positif ou nul.",
  },
];
