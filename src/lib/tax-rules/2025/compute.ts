import { UnsupportedSituationError } from "../errors";
import type { Answers, DeclarationLine, DeclarationResult, TauxPrelevementSource } from "../types";
import {
  ABATTEMENT_10_PLAFOND_2025,
  ABATTEMENT_10_PLANCHER_2025,
  BAREME_2025,
  DECOTE_CELIBATAIRE_2025,
  DECOTE_COUPLE_2025,
  PENSION_ABATTEMENT_PLAFOND_2025,
  PENSION_ABATTEMENT_PLANCHER_2025,
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

/**
 * BOI-RSA-BASE-30-50-20 : les allocations chômage (France Travail) sont soumises
 * aux mêmes règles que les traitements et salaires — même abattement de 10%, dans
 * le même pool que le salaire du déclarant (cf. computeTaxableIncome), pas un
 * abattement séparé. `suffix` distingue "vous" ("") du conjoint ("-conjoint").
 */
export function resolveChomage(answers: Answers, suffix: "" | "-conjoint" = ""): number {
  if (answers[`chomage${suffix}`] !== true) return 0;
  return Number(answers[`montant-chomage-2025${suffix}`] ?? 0);
}

/**
 * BOI-RSA-BASE-30-50-20 : les pensions/retraites sont exclues de l'abattement
 * salaires/chômage. `suffix` distingue "vous" ("") du conjoint ("-conjoint").
 */
export function resolvePension(answers: Answers, suffix: "" | "-conjoint" = ""): number {
  if (answers[`pension${suffix}`] !== true) return 0;
  return Number(answers[`montant-pension-2025${suffix}`] ?? 0);
}

/**
 * CGI art. 158, 5°, a : abattement de 10% sur les pensions et retraites, distinct
 * de celui des salaires/chômage. Le plancher (454€) s'apprécie par pensionné,
 * mais le plafond (4 439€) est commun à tout le foyer fiscal — pas doublé pour un
 * couple de deux pensionnés. Chaque abattement individuel est plafonné à sa
 * propre pension avant d'être sommé, puis la somme est plafonnée au niveau foyer.
 */
export function computePensionTaxableIncome(pensionVous: number, pensionConjoint: number): number {
  const totalPensions = pensionVous + pensionConjoint;
  if (totalPensions <= 0) return 0;

  const individualAbattement = (pension: number): number => {
    if (pension <= 0) return 0;
    return Math.min(Math.max(pension * 0.1, PENSION_ABATTEMENT_PLANCHER_2025), pension);
  };

  const rawAbattement = individualAbattement(pensionVous) + individualAbattement(pensionConjoint);
  const abattement = Math.min(rawAbattement, PENSION_ABATTEMENT_PLAFOND_2025, totalPensions);
  return Math.round(totalPensions - abattement);
}

function formatParts(parts: number): string {
  return String(parts).replace(".", ",");
}

/** CGI art. 204 H : arrondi à la décimale la plus proche (0,50 arrondi au-dessus), plancher 0%. */
function roundTaux(value: number): number {
  return Math.max(0, Math.round(value * 10) / 10);
}

/**
 * CGI art. 204 H ; BOI-IR-PAS-20-20-10 : taux de droit commun (« taux foyer »).
 * Le dénominateur est le revenu brut entrant dans le champ du PAS (avant
 * abattement de 10%, salaire/chômage/pension confondus), pas le revenu imposable
 * retenu pour l'IR — vérifié par recoupement avec le simulateur officiel DGFiP
 * (cf. docs/updates/2025-verification-increment-5.md).
 */
export function computeTauxPrelevementSourceFoyer(tax: number, totalRevenuBrut: number): number {
  if (totalRevenuBrut <= 0) return 0;
  return roundTaux((tax / totalRevenuBrut) * 100);
}

/**
 * BOI-IR-PAS-20-20-20 : taux individualisé, taux de droit commun pour les couples
 * depuis le 1er septembre 2025. Le conjoint aux revenus bruts les plus faibles se
 * voit d'abord attribuer un taux calculé en appliquant le mécanisme complet de
 * l'art. 197, I-1° à 4° (barème, plafonnement du quotient familial, décote — nos
 * fonctions `computeQuotientFamilialTax`/`computeDecote`) à son seul revenu
 * imposable, avec le nombre de parts réel du foyer. L'autre conjoint récupère le
 * reliquat. Formule et arrondi intermédiaire vérifiés sur l'exemple chiffré
 * officiel de la documentation BOFiP (couple 24 000€/120 000€, IR 25 211€ ->
 * 3,0%/20,4%, cf. compute.test.ts).
 */
export function computeTauxPrelevementSourceIndividualise(
  tax: number,
  rawVous: number,
  rawConjoint: number,
  taxableIncomeVousSeul: number,
  taxableIncomeConjointSeul: number,
  parts: number,
): { vous: number; conjoint: number } {
  const vousEstLePlusFaible = rawVous <= rawConjoint;
  const rawFaible = vousEstLePlusFaible ? rawVous : rawConjoint;
  const rawEleve = vousEstLePlusFaible ? rawConjoint : rawVous;
  const taxableFaible = vousEstLePlusFaible ? taxableIncomeVousSeul : taxableIncomeConjointSeul;

  const irFaible = computeDecote(computeQuotientFamilialTax(taxableFaible, parts, true).brutTax, true);
  const tauxFaible = rawFaible > 0 ? roundTaux((irFaible / rawFaible) * 100) : 0;
  const tauxEleve =
    rawEleve > 0 ? roundTaux(((tax - (tauxFaible / 100) * rawFaible) / rawEleve) * 100) : 0;

  return vousEstLePlusFaible
    ? { vous: tauxFaible, conjoint: tauxEleve }
    : { vous: tauxEleve, conjoint: tauxFaible };
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

  const chomageDeclare = answers["chomage"] === true;
  const chomageVous = resolveChomage(answers, "");
  const chomageConjointDeclare = isCouple && answers["chomage-conjoint"] === true;
  const chomageConjoint = chomageConjointDeclare ? resolveChomage(answers, "-conjoint") : 0;
  const conjointADesRevenus = conjointASalaire || chomageConjointDeclare;

  const taxableIncomeVous = computeTaxableIncome(vous.netImposable + chomageVous);
  const taxableIncomeConjoint = conjointADesRevenus
    ? computeTaxableIncome(conjoint.netImposable + chomageConjoint)
    : 0;

  const pensionDeclare = answers["pension"] === true;
  const pensionVous = resolvePension(answers, "");
  const pensionConjointDeclare = isCouple && answers["pension-conjoint"] === true;
  const pensionConjoint = pensionConjointDeclare ? resolvePension(answers, "-conjoint") : 0;
  const taxableIncomePensions = computePensionTaxableIncome(pensionVous, pensionConjoint);

  const taxableIncome = taxableIncomeVous + taxableIncomeConjoint + taxableIncomePensions;

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

  if (chomageDeclare) {
    lines.push({
      code: "1AP",
      label: "Allocations chômage à déclarer (vous)",
      value: chomageVous,
      explanation:
        "C'est le montant imposable indiqué sur votre attestation fiscale annuelle de France Travail, à reporter dans la case 1AP.",
      source: "impots.gouv.fr — Autres revenus imposables ; BOFiP BOI-RSA-BASE-30-50-20",
    });
  }

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

  if (chomageConjointDeclare) {
    lines.push({
      code: "1BP",
      label: "Allocations chômage à déclarer (conjoint·e)",
      value: chomageConjoint,
      explanation:
        "C'est le montant imposable indiqué sur l'attestation fiscale annuelle de France Travail de votre conjoint·e, à reporter dans la case 1BP.",
      source: "impots.gouv.fr — Autres revenus imposables ; BOFiP BOI-RSA-BASE-30-50-20",
    });
  }

  if (pensionDeclare) {
    lines.push({
      code: "1AS",
      label: "Pension de retraite à déclarer (vous)",
      value: pensionVous,
      explanation:
        "C'est le montant brut de votre pension, avant abattement, à reporter dans la case 1AS.",
      source: "impots.gouv.fr — Pensions de retraite ; CGI art. 158, 5°, a",
    });
  }

  if (pensionConjointDeclare) {
    lines.push({
      code: "1BS",
      label: "Pension de retraite à déclarer (conjoint·e)",
      value: pensionConjoint,
      explanation:
        "C'est le montant brut de la pension de votre conjoint·e, avant abattement, à reporter dans la case 1BS.",
      source: "impots.gouv.fr — Pensions de retraite ; CGI art. 158, 5°, a",
    });
  }

  lines.push({
    label: "Revenu imposable retenu pour le foyer, après abattement de 10% pour frais professionnels",
    value: taxableIncomeVous + taxableIncomeConjoint,
    explanation:
      "L'administration applique automatiquement un abattement de 10% sur l'ensemble des sommes touchées par chaque déclarant au titre du salaire et, le cas échéant, des allocations chômage (au moins 509€, au plus 14 555€ chacun pour les revenus 2025), pour couvrir forfaitairement ses frais professionnels courants.",
    source: "CGI art. 83, 3° ; BOFiP BOI-BAREME-000035, BOI-RSA-BASE-30-50-20",
  });

  if (pensionDeclare || pensionConjointDeclare) {
    lines.push({
      label: "Revenu imposable retenu pour le foyer, pensions et retraites, après abattement de 10%",
      value: taxableIncomePensions,
      explanation:
        "L'administration applique un abattement de 10% distinct de celui des salaires sur l'ensemble des pensions du foyer (au moins 454€ par pensionné, mais 4 439€ au maximum pour tout le foyer, même si vous êtes deux à percevoir une pension).",
      source: "CGI art. 158, 5°, a",
    });
  }

  lines.push(
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

  const rawVous = vous.netImposable + chomageVous + pensionVous;
  const rawConjoint = conjoint.netImposable + chomageConjoint + pensionConjoint;
  const tauxFoyer = computeTauxPrelevementSourceFoyer(tax, rawVous + rawConjoint);

  let tauxPrelevementSource: TauxPrelevementSource;
  if (isCouple) {
    const taxableIncomeVousSeul = taxableIncomeVous + computePensionTaxableIncome(pensionVous, 0);
    const taxableIncomeConjointSeul =
      taxableIncomeConjoint + computePensionTaxableIncome(pensionConjoint, 0);
    const individualise = computeTauxPrelevementSourceIndividualise(
      tax,
      rawVous,
      rawConjoint,
      taxableIncomeVousSeul,
      taxableIncomeConjointSeul,
      parts,
    );
    tauxPrelevementSource = { foyer: tauxFoyer, vous: individualise.vous, conjoint: individualise.conjoint };
  } else {
    tauxPrelevementSource = { foyer: tauxFoyer };
  }

  return { lines, warnings: warnings.length > 0 ? warnings : undefined, tauxPrelevementSource };
}
