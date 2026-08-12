import { UnsupportedSituationError } from "../errors";
import type { Answers, DeclarationResult } from "../types";
import {
  ABATTEMENT_10_PLAFOND_2025,
  ABATTEMENT_10_PLANCHER_2025,
  BAREME_2025,
  DECOTE_CELIBATAIRE_2025,
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

/** CGI art. 197 : barème par tranches + décote (foyer 1 part), arrondi à l'euro (art. 1657). */
export function computeProgressiveTax(taxableIncome: number): number {
  let brutTax = 0;
  for (const bracket of BAREME_2025) {
    const upper = bracket.to ?? Infinity;
    const taxableInBracket = Math.min(taxableIncome, upper) - bracket.from;
    if (taxableInBracket > 0) brutTax += taxableInBracket * bracket.rate;
  }
  const decote = Math.max(
    0,
    DECOTE_CELIBATAIRE_2025.montantForfaitaire - DECOTE_CELIBATAIRE_2025.taux * brutTax,
  );
  return Math.round(Math.max(0, brutTax - decote));
}

/**
 * Résout le salaire net imposable à partir des réponses : soit saisi directement
 * (exact), soit estimé à partir du brut annuel (heuristique, cf. estimation.ts).
 */
export function resolveNetImposable(answers: Answers): {
  netImposable: number;
  isEstimate: boolean;
} {
  const ficheDePaieDisponible = answers["fiche-paie-disponible"] === true;

  if (ficheDePaieDisponible) {
    return {
      netImposable: Number(answers["salaire-net-imposable-2025"] ?? 0),
      isEstimate: false,
    };
  }

  const brutAnnuel = Number(answers["salaire-brut-annuel-2025"] ?? 0);
  return {
    netImposable: estimateNetImposableFromBrut(brutAnnuel),
    isEstimate: true,
  };
}

export function computeDeclaration(answers: Answers, year: number): DeclarationResult {
  if (year !== 2025) {
    throw new Error(`Année fiscale non supportée par ce module : ${year}`);
  }
  if (answers["situation-familiale-simple"] !== true) {
    throw new UnsupportedSituationError();
  }

  const { netImposable, isEstimate } = resolveNetImposable(answers);
  const taxableIncome = computeTaxableIncome(netImposable);
  const tax = computeProgressiveTax(taxableIncome);

  const netImposableExplanation = isEstimate
    ? "Estimation calculée à partir de votre salaire brut annuel (environ 80% du brut), à confirmer avec votre fiche de paie de décembre avant de déclarer."
    : "C'est le montant « Net imposable » indiqué sur votre bulletin de salaire de décembre 2025 (cumul annuel), à reporter dans la case 1AJ.";

  return {
    lines: [
      {
        code: isEstimate ? undefined : "1AJ",
        label: isEstimate
          ? "Salaire net imposable estimé"
          : "Salaire net imposable à déclarer",
        value: netImposable,
        explanation: netImposableExplanation,
        source: "impots.gouv.fr — Salaires et assimilés",
      },
      {
        label: "Revenu imposable retenu, après abattement de 10% pour frais professionnels",
        value: taxableIncome,
        explanation:
          "L'administration applique automatiquement un abattement de 10% sur votre salaire net imposable (au moins 509€, au plus 14 555€ pour les revenus 2025), pour couvrir forfaitairement vos frais professionnels courants.",
        source: "CGI art. 83, 3° ; BOFiP BOI-BAREME-000035",
      },
      {
        label: "Impôt sur le revenu (avant réductions et crédits d'impôt éventuels)",
        value: tax,
        explanation:
          "Calculé par tranches selon le barème progressif applicable aux revenus 2025, décote comprise pour les revenus modestes.",
        source: "CGI art. 197",
      },
    ],
    warnings: isEstimate
      ? [
          "Le montant de salaire net imposable utilisé ici est une estimation basée sur votre salaire brut, pas un montant exact. Confirmez-le avec votre fiche de paie de décembre avant de déclarer.",
        ]
      : undefined,
  };
}
