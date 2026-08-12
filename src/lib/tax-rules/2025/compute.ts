import { UnsupportedSituationError } from "../errors";
import type { Answers, DeclarationLine, DeclarationResult } from "../types";
import {
  ABATTEMENT_10_PLAFOND_2025,
  ABATTEMENT_10_PLANCHER_2025,
  BAREME_2025,
  DECOTE_CELIBATAIRE_2025,
  DECOTE_COUPLE_2025,
  PLAFOND_QUOTIENT_FAMILIAL_DEMI_PART_2025,
} from "./constants";
import { estimateNetImposableFromBrut } from "./estimation";

/** CGI art. 83, 3° + BOI-BAREME-000035 : abattement 10%, plancher/plafond, jamais > au salaire lui-même. */
export function computeTaxableIncome(netImposable: number): number {
  if (netImposable <= 0) return 0;
  const rawAbattement = netImposable * 0.1;
  const clamped = Math.min(
    Math.max(rawAbattement, ABATTEMENT_10_PLANCHER_2025),
    ABATTEMENT_10_PLAFOND_2025,
  );
  const abattement = Math.min(clamped, netImposable);
  // CGI art. 1657 : base arrondie à l'euro le plus proche.
  return Math.round(netImposable - abattement);
}

/** CGI art. 197 : impôt par tranches sur un quotient (un « part » de revenu), sans décote. */
export function computeGrossTaxOnQuotient(quotient: number): number {
  let brutTax = 0;
  for (const bracket of BAREME_2025) {
    const upper = bracket.to ?? Infinity;
    const taxableInBracket = Math.min(quotient, upper) - bracket.from;
    if (taxableInBracket > 0) brutTax += taxableInBracket * bracket.rate;
  }
  return brutTax;
}

/** CGI art. 197, I-4°-a : décote, arrondie à l'euro (art. 1657). Constantes différentes selon la situation. */
export function computeDecote(brutTax: number, isCouple: boolean): number {
  const { montantForfaitaire, taux } = isCouple ? DECOTE_COUPLE_2025 : DECOTE_CELIBATAIRE_2025;
  const decote = Math.max(0, montantForfaitaire - taux * brutTax);
  return Math.round(Math.max(0, brutTax - decote));
}

/** CGI art. 197 : barème par tranches (1 part) + décote célibataire, arrondi à l'euro. */
export function computeProgressiveTax(taxableIncome: number): number {
  return computeDecote(computeGrossTaxOnQuotient(taxableIncome), false);
}

/**
 * CGI art. 194 : nombre de parts de quotient familial, cas général uniquement
 * (1 part célibataire, 2 parts couple, +0.5 part par enfant pour les 2 premiers,
 * +1 part par enfant supplémentaire). Un célibataire ne peut ici avoir d'enfant à
 * charge (cf. plan incrément 4, décision 1 : parent isolé non supporté) — la clé
 * `nombre-enfants-a-charge` est donc ignorée hors situation de couple.
 */
export function computeParts(answers: Answers): number {
  const isCouple = answers["situation-conjugale"] === "couple";
  const base = isCouple ? 2 : 1;
  const enfants = isCouple ? Number(answers["nombre-enfants-a-charge"] ?? 0) : 0;
  const partsEnfants = Math.min(enfants, 2) * 0.5 + Math.max(enfants - 2, 0) * 1;
  return base + partsEnfants;
}

/**
 * CGI art. 197, I-2 : plafonnement général des effets du quotient familial (cas
 * standard, hors parent isolé/veuvage). L'avantage procuré par les parts au-delà
 * du nombre de parts de référence (1 seul, 2 couple) est comparé à un plafond par
 * demi-part ; s'il le dépasse, l'impôt est recalculé comme si l'avantage était
 * exactement plafonné.
 */
export function computeQuotientFamilialTax(
  taxableIncome: number,
  parts: number,
  isCouple: boolean,
): { brutTax: number; isCapped: boolean } {
  const referenceParts = isCouple ? 2 : 1;
  const taxAtActualParts = computeGrossTaxOnQuotient(taxableIncome / parts) * parts;

  if (parts <= referenceParts) {
    return { brutTax: taxAtActualParts, isCapped: false };
  }

  const taxAtReferenceParts = computeGrossTaxOnQuotient(taxableIncome / referenceParts) * referenceParts;
  const ceiling = ((parts - referenceParts) / 0.5) * PLAFOND_QUOTIENT_FAMILIAL_DEMI_PART_2025;
  const reduction = taxAtReferenceParts - taxAtActualParts;

  if (reduction > ceiling) {
    return { brutTax: taxAtReferenceParts - ceiling, isCapped: true };
  }
  return { brutTax: taxAtActualParts, isCapped: false };
}

/**
 * Résout le salaire net imposable d'un déclarant à partir des réponses : soit
 * saisi directement (exact), soit estimé à partir du brut annuel (heuristique,
 * cf. estimation.ts). `suffix` distingue "vous" ("") du conjoint ("-conjoint").
 */
export function resolveNetImposable(
  answers: Answers,
  suffix: "" | "-conjoint" = "",
): { netImposable: number; isEstimate: boolean } {
  const ficheDePaieDisponible = answers[`fiche-paie-disponible${suffix}`] === true;

  if (ficheDePaieDisponible) {
    return {
      netImposable: Number(answers[`salaire-net-imposable-2025${suffix}`] ?? 0),
      isEstimate: false,
    };
  }

  const brutAnnuel = Number(answers[`salaire-brut-annuel-2025${suffix}`] ?? 0);
  return {
    netImposable: estimateNetImposableFromBrut(brutAnnuel),
    isEstimate: true,
  };
}

function formatParts(parts: number): string {
  return String(parts).replace(".", ",");
}

export function computeDeclaration(answers: Answers, year: number): DeclarationResult {
  if (year !== 2025) {
    throw new Error(`Année fiscale non supportée par ce module : ${year}`);
  }

  const situation = answers["situation-conjugale"];
  if (situation !== "celibataire" && situation !== "couple") {
    throw new UnsupportedSituationError();
  }
  const isCouple = situation === "couple";

  const vous = resolveNetImposable(answers, "");
  const conjointASalaire = isCouple && answers["conjoint-a-un-salaire"] === true;
  const conjoint = conjointASalaire
    ? resolveNetImposable(answers, "-conjoint")
    : { netImposable: 0, isEstimate: false };

  const taxableIncomeVous = computeTaxableIncome(vous.netImposable);
  const taxableIncomeConjoint = conjointASalaire ? computeTaxableIncome(conjoint.netImposable) : 0;
  const taxableIncome = taxableIncomeVous + taxableIncomeConjoint;

  const parts = computeParts(answers);
  const { brutTax, isCapped } = computeQuotientFamilialTax(taxableIncome, parts, isCouple);
  const tax = computeDecote(brutTax, isCouple);

  const lines: DeclarationLine[] = [
    {
      code: vous.isEstimate ? undefined : "1AJ",
      label: vous.isEstimate
        ? "Salaire net imposable estimé (vous)"
        : "Salaire net imposable à déclarer (vous)",
      value: vous.netImposable,
      explanation: vous.isEstimate
        ? "Estimation calculée à partir de votre salaire brut annuel (environ 80% du brut), à confirmer avec votre fiche de paie de décembre avant de déclarer."
        : "C'est le montant « Net imposable » indiqué sur votre bulletin de salaire de décembre 2025 (cumul annuel), à reporter dans la case 1AJ.",
      source: "impots.gouv.fr — Salaires et assimilés",
    },
  ];

  if (conjointASalaire) {
    lines.push({
      code: conjoint.isEstimate ? undefined : "1BJ",
      label: conjoint.isEstimate
        ? "Salaire net imposable estimé (conjoint·e)"
        : "Salaire net imposable à déclarer (conjoint·e)",
      value: conjoint.netImposable,
      explanation: conjoint.isEstimate
        ? "Estimation calculée à partir du salaire brut annuel de votre conjoint·e (environ 80% du brut), à confirmer avec sa fiche de paie de décembre avant de déclarer."
        : "C'est le montant « Net imposable » indiqué sur le bulletin de salaire de décembre 2025 de votre conjoint·e (cumul annuel), à reporter dans la case 1BJ.",
      source: "impots.gouv.fr — Salaires et assimilés",
    });
  }

  lines.push(
    {
      label: "Revenu imposable retenu pour le foyer, après abattement de 10% pour frais professionnels",
      value: taxableIncome,
      explanation:
        "L'administration applique automatiquement un abattement de 10% sur le salaire net imposable de chaque déclarant (au moins 509€, au plus 14 555€ chacun pour les revenus 2025), pour couvrir forfaitairement ses frais professionnels courants.",
      source: "CGI art. 83, 3° ; BOFiP BOI-BAREME-000035",
    },
    {
      label: "Impôt sur le revenu (avant réductions et crédits d'impôt éventuels)",
      value: tax,
      explanation: `Calculé par tranches selon le barème progressif applicable aux revenus 2025, en tenant compte de votre quotient familial (${formatParts(parts)} part${parts > 1 ? "s" : ""}) et de la décote pour les revenus modestes.`,
      source: "CGI art. 194 et 197",
    },
  );

  const warnings: string[] = [];
  if (vous.isEstimate || conjoint.isEstimate) {
    warnings.push(
      "Au moins un montant de salaire net imposable utilisé ici est une estimation basée sur un salaire brut, pas un montant exact. Confirmez-le avec la fiche de paie de décembre avant de déclarer.",
    );
  }
  if (isCapped) {
    warnings.push(
      "L'avantage fiscal lié à vos parts supplémentaires (enfants à charge) a été plafonné par la loi : au-delà d'un certain montant par demi-part, la réduction d'impôt n'augmente plus.",
    );
  }

  return { lines, warnings: warnings.length > 0 ? warnings : undefined };
}
