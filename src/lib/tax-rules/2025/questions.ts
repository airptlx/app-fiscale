import type { Question } from "../types";

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
    id: "fiche-paie-disponible",
    type: "boolean",
    prompt: "Tu as sous les yeux ta fiche de paie de décembre 2025 (cumul annuel) ?",
    helpText:
      "Si tu ne l'as pas encore reçue — par exemple parce que tu veux anticiper une augmentation de salaire en cours d'année — tu pourras indiquer ton salaire brut annuel à la place, et on calculera une estimation.",
    isVisible: (answers) =>
      answers["situation-conjugale"] === "celibataire" ||
      answers["situation-conjugale"] === "couple",
  },
  {
    id: "salaire-net-imposable-2025",
    type: "number",
    prompt: "Quel est le montant total que tu as gagné en 2025 grâce à ton emploi ?",
    helpText:
      "Reporte le montant « Net imposable » (cumul annuel) de ta fiche de paie de décembre 2025. Attention : ce n'est pas le montant « Net à payer » viré sur ton compte — le net imposable est toujours un peu plus élevé.",
    isVisible: (answers) =>
      (answers["situation-conjugale"] === "celibataire" ||
        answers["situation-conjugale"] === "couple") &&
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
      (answers["situation-conjugale"] === "celibataire" ||
        answers["situation-conjugale"] === "couple") &&
      answers["fiche-paie-disponible"] === false,
    validate: (value) =>
      typeof value === "number" && value >= 0 ? undefined : "Indique un montant positif ou nul.",
  },
  {
    id: "chomage",
    type: "boolean",
    prompt: "Tu as aussi touché des allocations chômage (France Travail) en 2025 ?",
    isVisible: (answers) =>
      answers["situation-conjugale"] === "celibataire" ||
      answers["situation-conjugale"] === "couple",
  },
  {
    id: "montant-chomage-2025",
    type: "number",
    prompt: "Quel est le montant imposable de tes allocations chômage perçues en 2025 ?",
    helpText:
      "Ce montant figure sur ton attestation fiscale annuelle, envoyée par France Travail (ex Pôle emploi) en début d'année suivante. Ce n'est pas le total versé sur ton compte : l'attestation indique déjà la part imposable.",
    isVisible: (answers) =>
      (answers["situation-conjugale"] === "celibataire" ||
        answers["situation-conjugale"] === "couple") &&
      answers["chomage"] === true,
    validate: (value) =>
      typeof value === "number" && value >= 0 ? undefined : "Indique un montant positif ou nul.",
  },
  {
    id: "pension",
    type: "boolean",
    prompt: "Tu as perçu une pension de retraite en 2025 ?",
    isVisible: (answers) =>
      answers["situation-conjugale"] === "celibataire" ||
      answers["situation-conjugale"] === "couple",
  },
  {
    id: "montant-pension-2025",
    type: "number",
    prompt: "Quel est le montant imposable de ta pension de retraite perçue en 2025 ?",
    helpText:
      "C'est le montant brut, avant tout abattement — souvent déjà pré-rempli sur ta déclaration si ta caisse de retraite l'a transmis à l'administration. Ne déduis rien toi-même : l'abattement est calculé automatiquement.",
    isVisible: (answers) =>
      (answers["situation-conjugale"] === "celibataire" ||
        answers["situation-conjugale"] === "couple") &&
      answers["pension"] === true,
    validate: (value) =>
      typeof value === "number" && value >= 0 ? undefined : "Indique un montant positif ou nul.",
  },
  {
    id: "conjoint-a-un-salaire",
    type: "boolean",
    prompt: "Ton/ta conjoint·e a aussi un salaire à déclarer ?",
    isVisible: (answers) => answers["situation-conjugale"] === "couple",
  },
  {
    id: "fiche-paie-disponible-conjoint",
    type: "boolean",
    prompt: "Tu as sous les yeux la fiche de paie de décembre 2025 (cumul annuel) de ton/ta conjoint·e ?",
    helpText:
      "Si tu ne l'as pas encore reçue, tu pourras indiquer son salaire brut annuel à la place, et on calculera une estimation.",
    isVisible: (answers) =>
      answers["situation-conjugale"] === "couple" && answers["conjoint-a-un-salaire"] === true,
  },
  {
    id: "salaire-net-imposable-2025-conjoint",
    type: "number",
    prompt: "Quel est le montant total que ton/ta conjoint·e a gagné en 2025 grâce à son emploi ?",
    helpText:
      "Reporte le montant « Net imposable » (cumul annuel) de sa fiche de paie de décembre 2025. Attention : ce n'est pas le montant « Net à payer » viré sur son compte — le net imposable est toujours un peu plus élevé.",
    isVisible: (answers) =>
      answers["situation-conjugale"] === "couple" &&
      answers["conjoint-a-un-salaire"] === true &&
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
      answers["conjoint-a-un-salaire"] === true &&
      answers["fiche-paie-disponible-conjoint"] === false,
    validate: (value) =>
      typeof value === "number" && value >= 0 ? undefined : "Indique un montant positif ou nul.",
  },
  {
    id: "chomage-conjoint",
    type: "boolean",
    prompt: "Ton/ta conjoint·e a aussi touché des allocations chômage en 2025 ?",
    isVisible: (answers) => answers["situation-conjugale"] === "couple",
  },
  {
    id: "montant-chomage-2025-conjoint",
    type: "number",
    prompt: "Quel est le montant imposable des allocations chômage perçues par ton/ta conjoint·e en 2025 ?",
    helpText:
      "Ce montant figure sur son attestation fiscale annuelle, envoyée par France Travail (ex Pôle emploi) en début d'année suivante. Ce n'est pas le total versé sur son compte : l'attestation indique déjà la part imposable.",
    isVisible: (answers) =>
      answers["situation-conjugale"] === "couple" && answers["chomage-conjoint"] === true,
    validate: (value) =>
      typeof value === "number" && value >= 0 ? undefined : "Indique un montant positif ou nul.",
  },
  {
    id: "pension-conjoint",
    type: "boolean",
    prompt: "Ton/ta conjoint·e a perçu une pension de retraite en 2025 ?",
    isVisible: (answers) => answers["situation-conjugale"] === "couple",
  },
  {
    id: "montant-pension-2025-conjoint",
    type: "number",
    prompt: "Quel est le montant imposable de la pension de retraite perçue par ton/ta conjoint·e en 2025 ?",
    helpText:
      "C'est le montant brut, avant tout abattement — souvent déjà pré-rempli sur ta déclaration si sa caisse de retraite l'a transmis à l'administration. Ne déduis rien toi-même : l'abattement est calculé automatiquement.",
    isVisible: (answers) =>
      answers["situation-conjugale"] === "couple" && answers["pension-conjoint"] === true,
    validate: (value) =>
      typeof value === "number" && value >= 0 ? undefined : "Indique un montant positif ou nul.",
  },
  {
    id: "foncier",
    type: "boolean",
    prompt: "Tu as mis un logement en location (non meublée) en 2025, et perçu des loyers ?",
    helpText:
      "Cette question concerne uniquement la location non meublée (location « nue »). La location meublée relève d'un régime différent, pas encore pris en charge par cet outil.",
    isVisible: (answers) =>
      answers["situation-conjugale"] === "celibataire" ||
      answers["situation-conjugale"] === "couple",
  },
  {
    id: "montant-foncier-2025",
    type: "number",
    prompt: "Quel est le montant total des loyers bruts perçus par ton foyer en 2025 ?",
    helpText:
      "Montant brut, hors charges, avant tout abattement. S'il y a plusieurs logements ou que tu es en couple, indique le total pour tout le foyer — une seule réponse suffit.",
    isVisible: (answers) =>
      (answers["situation-conjugale"] === "celibataire" ||
        answers["situation-conjugale"] === "couple") &&
      answers["foncier"] === true,
    validate: (value) =>
      typeof value === "number" && value >= 0 ? undefined : "Indique un montant positif ou nul.",
  },
  {
    id: "activite-independante",
    type: "boolean",
    prompt: "Tu as une activité de micro-entrepreneur (auto-entrepreneur) en 2025 ?",
    helpText:
      "On parle d'une vraie activité enregistrée en micro-entreprise (auto-entrepreneur), pas d'un petit job ponctuel non déclaré.",
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
    prompt: "Quel est le montant total de ton chiffre d'affaires encaissé pour cette activité en 2025 ?",
    helpText:
      "Montant brut total facturé et encaissé, avant tout abattement. Ne déduis aucune charge toi-même : l'abattement forfaitaire est calculé automatiquement selon ton type d'activité.",
    isVisible: (answers) =>
      (answers["situation-conjugale"] === "celibataire" ||
        answers["situation-conjugale"] === "couple") &&
      answers["activite-independante"] === true,
    validate: (value) =>
      typeof value === "number" && value >= 0 ? undefined : "Indique un montant positif ou nul.",
  },
  {
    id: "activite-independante-conjoint",
    type: "boolean",
    prompt: "Ton/ta conjoint·e a aussi une activité de micro-entrepreneur (auto-entrepreneur) en 2025 ?",
    helpText:
      "On parle d'une vraie activité enregistrée en micro-entreprise (auto-entrepreneur), pas d'un petit job ponctuel non déclaré.",
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
    prompt: "Quel est le montant total du chiffre d'affaires encaissé par ton/ta conjoint·e pour cette activité en 2025 ?",
    helpText:
      "Montant brut total facturé et encaissé, avant tout abattement. Ne déduis aucune charge toi-même : l'abattement forfaitaire est calculé automatiquement selon le type d'activité.",
    isVisible: (answers) =>
      answers["situation-conjugale"] === "couple" &&
      answers["activite-independante-conjoint"] === true,
    validate: (value) =>
      typeof value === "number" && value >= 0 ? undefined : "Indique un montant positif ou nul.",
  },
];
