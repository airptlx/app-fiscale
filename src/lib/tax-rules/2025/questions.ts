import { MICRO_ACTIVITE_INFO, type TypeActiviteIndependante } from "./compute";
import { ANNEE_REVENUS_2025, MICRO_FONCIER_SEUIL_2025 } from "./constants";
import type { Answers, Question } from "../types";

const ANNEE_LABEL = `l'année dernière (${ANNEE_REVENUS_2025})`;
const ANNEE_N_MOINS_1 = ANNEE_REVENUS_2025 - 1;
const ANNEE_N_MOINS_2 = ANNEE_REVENUS_2025 - 2;

function situationConnue(situation: unknown): situation is "celibataire" | "couple" {
  return situation === "celibataire" || situation === "couple";
}

function includesOption(value: unknown, option: string): boolean {
  return Array.isArray(value) && (value as string[]).includes(option);
}

function depasseSeuilMicro(answers: Answers, suffix: "" | "-conjoint"): boolean {
  const type = answers[`type-activite-independante${suffix}`] as TypeActiviteIndependante | undefined;
  if (!type) return false;
  const chiffreAffaires = Number(answers[`chiffre-affaires-independant-2025${suffix}`] ?? 0);
  return chiffreAffaires > MICRO_ACTIVITE_INFO[type].seuil;
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
      "Loyers : uniquement la location non meublée (la location meublée n'est pas encore prise en charge). Micro-entreprise : une vraie activité enregistrée, pas un job ponctuel non déclaré. Actions/PEA : coche « PEA » séparément si c'est dans cette enveloppe, les règles sont différentes.",
    options: [
      { value: "foncier", label: "Des loyers (location non meublée)" },
      { value: "micro-entreprise", label: "Une activité de micro-entrepreneur (auto-entrepreneur)" },
      {
        value: "crypto",
        label: "Un compte sur une plateforme d'échange crypto basée à l'étranger (Binance, Kraken, Coinbase...)",
      },
      { value: "dividendes", label: "Des dividendes d'actions (hors PEA)" },
      {
        value: "plus-value-titres",
        label: "Une plus-value en vendant des actions ou d'autres valeurs mobilières (hors PEA)",
      },
      { value: "pea", label: "Un PEA (Plan d'Épargne en Actions)" },
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
    id: "foncier-regime-reel-connu",
    type: "boolean",
    prompt:
      "As-tu déjà calculé le résultat net de tes revenus fonciers en dehors de cet outil (loyers moins charges déductibles : travaux, intérêts d'emprunt, taxe foncière, assurance, frais de gestion...) ?",
    helpText:
      "Au-delà de ce montant de loyers bruts par an, l'abattement automatique de 30% cède la place à un calcul basé sur tes charges réelles, que cet outil ne fait pas à ta place. Si tu l'as déjà (formulaire 2044, comptable...), tu peux l'indiquer directement.",
    isVisible: (answers) =>
      situationConnue(answers["situation-conjugale"]) &&
      includesOption(answers["activites-annexes"], "foncier") &&
      Number(answers["montant-foncier-2025"] ?? 0) > MICRO_FONCIER_SEUIL_2025,
  },
  {
    id: "foncier-net-reel-2025",
    type: "number",
    prompt: "Quel est ce résultat net (bénéfice) ?",
    helpText:
      "C'est le montant après déduction de toutes tes charges réelles. Si tu es en déficit foncier cette année, ce cas n'est pas encore pris en charge par cet outil.",
    isVisible: (answers) =>
      situationConnue(answers["situation-conjugale"]) &&
      includesOption(answers["activites-annexes"], "foncier") &&
      Number(answers["montant-foncier-2025"] ?? 0) > MICRO_FONCIER_SEUIL_2025 &&
      answers["foncier-regime-reel-connu"] === true,
    validate: (value) =>
      typeof value === "number" && value >= 0
        ? undefined
        : "Indique un montant positif ou nul — un déficit foncier n'est pas encore pris en charge par cet outil.",
  },
  {
    id: "montant-dividendes-2025",
    type: "number",
    prompt: `Quel est le montant brut total des dividendes que tu as touchés ${ANNEE_LABEL} ?`,
    helpText:
      "Montant brut avant tout prélèvement, indiqué sur le document envoyé par ta banque ou ton courtier (IFU). Pas besoin de déduire quoi que ce soit toi-même.",
    isVisible: (answers) =>
      situationConnue(answers["situation-conjugale"]) &&
      includesOption(answers["activites-annexes"], "dividendes"),
    validate: (value) =>
      typeof value === "number" && value >= 0 ? undefined : "Indique un montant positif ou nul.",
  },
  {
    id: "montant-plus-value-titres-2025",
    type: "number",
    prompt: `Quel est le montant net de cette plus-value ${ANNEE_LABEL} ?`,
    helpText:
      "Montant déjà calculé par ta banque ou ton courtier (IFU), après compensation des éventuelles moins-values. Si tu es en perte nette sur l'année, ce n'est pas géré par cet outil pour l'instant — tu peux quand même la reporter toi-même (case 3VH) pour la déduire de gains futurs.",
    isVisible: (answers) =>
      situationConnue(answers["situation-conjugale"]) &&
      includesOption(answers["activites-annexes"], "plus-value-titres"),
    validate: (value) =>
      typeof value === "number" && value >= 0 ? undefined : "Indique un montant positif ou nul.",
  },
  {
    id: "pea-cinq-ans",
    type: "boolean",
    prompt: "Ton PEA est-il ouvert depuis plus de 5 ans, sans retrait ayant entraîné sa clôture ?",
    helpText:
      "Un retrait avant 5 ans clôture en principe le PEA. Si tu n'es pas sûr·e, regarde simplement la date d'ouverture de ton PEA et si tu as déjà retiré de l'argent.",
    isVisible: (answers) =>
      situationConnue(answers["situation-conjugale"]) &&
      includesOption(answers["activites-annexes"], "pea"),
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
    id: "depassement-deux-ans-independant",
    type: "boolean",
    prompt: `As-tu déjà dépassé ce seuil deux années de suite avant cette déclaration (donc en ${ANNEE_N_MOINS_2} et en ${ANNEE_N_MOINS_1}) ?`,
    helpText:
      "Le régime micro-entreprise reste applicable tant que tu ne dépasses pas ce seuil deux années consécutives avant l'année déclarée : un dépassement isolé, comme celui de cette année, ne suffit pas à en sortir.",
    isVisible: (answers) =>
      situationConnue(answers["situation-conjugale"]) &&
      includesOption(answers["activites-annexes"], "micro-entreprise") &&
      (answers["situation-conjugale"] === "celibataire" ||
        includesOption(answers["qui-activite-independante"], "toi")) &&
      depasseSeuilMicro(answers, ""),
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
  {
    id: "depassement-deux-ans-independant-conjoint",
    type: "boolean",
    prompt: `Ton/ta conjoint·e a-t-il/elle déjà dépassé ce seuil deux années de suite avant cette déclaration (donc en ${ANNEE_N_MOINS_2} et en ${ANNEE_N_MOINS_1}) ?`,
    helpText:
      "Le régime micro-entreprise reste applicable tant que ce seuil n'est pas dépassé deux années consécutives avant l'année déclarée : un dépassement isolé, comme celui de cette année, ne suffit pas à en sortir.",
    isVisible: (answers) =>
      answers["situation-conjugale"] === "couple" &&
      includesOption(answers["activites-annexes"], "micro-entreprise") &&
      includesOption(answers["qui-activite-independante"], "conjoint") &&
      depasseSeuilMicro(answers, "-conjoint"),
  },
];
