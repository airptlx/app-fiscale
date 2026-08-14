import { UnsupportedSituationError } from "../errors";
import type { Answers, Conseil, DeclarationLine, DeclarationResult, TauxPrelevementSource } from "../types";
import {
  ABATTEMENT_10_PLAFOND_2025,
  ABATTEMENT_10_PLANCHER_2025,
  ANNEE_REVENUS_2025,
  BAREME_2025,
  DECOTE_CELIBATAIRE_2025,
  DECOTE_COUPLE_2025,
  MICRO_ABATTEMENT_PLANCHER_2025,
  MICRO_BIC_SERVICE_TAUX_2025,
  MICRO_BIC_VENTE_TAUX_2025,
  MICRO_BNC_TAUX_2025,
  MICRO_FONCIER_SEUIL_2025,
  MICRO_SEUIL_SERVICE_2025,
  MICRO_SEUIL_VENTE_2025,
  PENSION_ABATTEMENT_PLAFOND_2025,
  PENSION_ABATTEMENT_PLANCHER_2025,
  PFU_TAUX_GLOBAL_2025,
  PLAFOND_QUOTIENT_FAMILIAL_DEMI_PART_2025,
} from "./constants";
import { estimateNetImposableFromBrut } from "./estimation";

/** Les réponses aux questions à choix multiple (`revenus`, `activites-annexes`, ...) sont des tableaux de valeurs cochées. */
function includesOption(value: unknown, option: string): boolean {
  return Array.isArray(value) && (value as string[]).includes(option);
}

/** Même gabarit que `questions.ts` — jamais dérivé de la date du jour, cf. cette constante. */
const ANNEE_LABEL = `l'année dernière (${ANNEE_REVENUS_2025})`;

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
 * Le salaire est optionnel (choix multiple `revenus`/`revenus-conjoint`, cf. plan
 * incrément 9) : si non coché, retourne 0 sans passer par la branche estimation
 * (sinon on obtiendrait à tort un avertissement "estimation" sur un brut de 0€).
 */
export function resolveNetImposable(
  answers: Answers,
  suffix: "" | "-conjoint" = "",
): { netImposable: number; isEstimate: boolean } {
  if (!includesOption(answers[`revenus${suffix}`], "salaire")) {
    return { netImposable: 0, isEstimate: false };
  }

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
  if (!includesOption(answers[`revenus${suffix}`], "chomage")) return 0;
  return Number(answers[`montant-chomage-2025${suffix}`] ?? 0);
}

/**
 * BOI-RSA-BASE-30-50-20 : les pensions/retraites sont exclues de l'abattement
 * salaires/chômage. `suffix` distingue "vous" ("") du conjoint ("-conjoint").
 */
export function resolvePension(answers: Answers, suffix: "" | "-conjoint" = ""): number {
  if (!includesOption(answers[`revenus${suffix}`], "pension")) return 0;
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

/**
 * Revenus fonciers : revenu commun au foyer (une seule réponse, pas de suffixe
 * vous/conjoint — contrairement au salaire/chômage/pension), cf. plan incrément 7.
 */
export function resolveFoncier(answers: Answers): number {
  if (!includesOption(answers["activites-annexes"], "foncier")) return 0;
  return Number(answers["montant-foncier-2025"] ?? 0);
}

/**
 * CGI art. 32 : régime micro-foncier (location non meublée), applicable jusqu'à
 * `MICRO_FONCIER_SEUIL_2025` de recettes brutes annuelles pour le foyer.
 * Abattement forfaitaire de 30%, sans plancher (contrairement aux abattements
 * salaires/pensions). Au-delà du seuil, le régime réel est obligatoire : c'est à
 * `computeDeclaration` de lever `UnsupportedSituationError`, pas à cette fonction.
 */
export function computeFoncierTaxableIncome(recettesBrutes: number): number {
  if (recettesBrutes <= 0) return 0;
  return Math.round(recettesBrutes * 0.7);
}

/**
 * Dividendes (case 2DC) : revenu commun au foyer (une seule réponse, pas de
 * suffixe vous/conjoint) — comme le foncier, et pour la même raison
 * supplémentaire propre au PFU : le montant d'impôt dû ne dépend pas de qui,
 * dans le couple, détient le compte-titres (taux fixe, cf. `computePFU`).
 */
export function resolveDividendes(answers: Answers): number {
  if (!includesOption(answers["activites-annexes"], "dividendes")) return 0;
  return Number(answers["montant-dividendes-2025"] ?? 0);
}

/**
 * Plus-value de cession de valeurs mobilières hors PEA (case 3VG) : même
 * logique foyer que `resolveDividendes`. Montant déjà net (après compensation
 * des moins-values), tel que fourni par l'IFU du courtier — cf. plan incrément 11.
 */
export function resolvePlusValueTitres(answers: Answers): number {
  if (!includesOption(answers["activites-annexes"], "plus-value-titres")) return 0;
  return Number(answers["montant-plus-value-titres-2025"] ?? 0);
}

/**
 * CGI art. 200 A : prélèvement forfaitaire unique (PFU) à 30% pour les revenus
 * 2025 (12,8% IR + 17,2% prélèvements sociaux), applicable par défaut aux
 * dividendes et plus-values de cession de valeurs mobilières hors PEA. Taux
 * fixe, sans lien avec le quotient familial ou le barème — jamais fusionné
 * avec `computeProgressiveTax`/`computeQuotientFamilialTax`.
 */
export function computePFU(dividendes: number, plusValue: number): number {
  return Math.round((dividendes + plusValue) * PFU_TAUX_GLOBAL_2025);
}

export type TypeActiviteIndependante = "vente" | "service" | "liberale";

/**
 * CGI art. 50-0 (micro-BIC) et art. 102 ter (micro-BNC) : taux d'abattement, seuil
 * d'éligibilité et code de case (formulaire 2042-C-PRO, régime sans versement
 * libératoire) par type d'activité et par déclarant.
 */
const MICRO_ACTIVITE_INFO: Record<
  TypeActiviteIndependante,
  { taux: number; seuil: number; codeVous: string; codeConjoint: string; libelle: string }
> = {
  vente: {
    taux: MICRO_BIC_VENTE_TAUX_2025,
    seuil: MICRO_SEUIL_VENTE_2025,
    codeVous: "5KO",
    codeConjoint: "5LO",
    libelle: "vente de marchandises",
  },
  service: {
    taux: MICRO_BIC_SERVICE_TAUX_2025,
    seuil: MICRO_SEUIL_SERVICE_2025,
    codeVous: "5KP",
    codeConjoint: "5LP",
    libelle: "prestation de service",
  },
  liberale: {
    taux: MICRO_BNC_TAUX_2025,
    seuil: MICRO_SEUIL_SERVICE_2025,
    codeVous: "5HQ",
    codeConjoint: "5IQ",
    libelle: "activité libérale",
  },
};

/**
 * Une seule activité de micro-entrepreneur par déclarant (pas de cumul vente +
 * service + libérale pour la même personne, cf. plan incrément 8). `suffix`
 * distingue "vous" ("") du conjoint ("-conjoint"). Rattachée au choix multiple
 * `activites-annexes` (option "micro-entreprise") ; pour un couple, la question
 * `qui-activite-independante` précise en plus à qui elle appartient — en
 * célibataire, elle est nécessairement "à toi", pas de question supplémentaire
 * (cf. plan incrément 9).
 */
export function resolveActiviteIndependante(
  answers: Answers,
  suffix: "" | "-conjoint" = "",
): { type: TypeActiviteIndependante | undefined; chiffreAffaires: number } {
  if (!includesOption(answers["activites-annexes"], "micro-entreprise")) {
    return { type: undefined, chiffreAffaires: 0 };
  }

  const isCouple = answers["situation-conjugale"] === "couple";
  if (isCouple) {
    const personne = suffix === "-conjoint" ? "conjoint" : "toi";
    if (!includesOption(answers["qui-activite-independante"], personne)) {
      return { type: undefined, chiffreAffaires: 0 };
    }
  } else if (suffix === "-conjoint") {
    return { type: undefined, chiffreAffaires: 0 };
  }

  const type = answers[`type-activite-independante${suffix}`] as TypeActiviteIndependante | undefined;
  const chiffreAffaires = Number(answers[`chiffre-affaires-independant-2025${suffix}`] ?? 0);
  return { type, chiffreAffaires };
}

/**
 * CGI art. 50-0 / 102 ter : abattement forfaitaire selon le type d'activité,
 * plancher de 305€ commun aux trois catégories, plafonné au chiffre d'affaires
 * lui-même (comme `computeTaxableIncome` le fait pour le salaire).
 */
export function computeMicroTaxableIncome(
  chiffreAffaires: number,
  type: TypeActiviteIndependante,
): number {
  if (chiffreAffaires <= 0) return 0;
  const abattement = Math.min(
    Math.max(chiffreAffaires * MICRO_ACTIVITE_INFO[type].taux, MICRO_ABATTEMENT_PLANCHER_2025),
    chiffreAffaires,
  );
  return Math.round(chiffreAffaires - abattement);
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

  const recettesBrutesFoncier = resolveFoncier(answers);
  if (recettesBrutesFoncier > MICRO_FONCIER_SEUIL_2025) {
    throw new UnsupportedSituationError(
      "Tes revenus fonciers dépassent 15 000 € par an pour le foyer : le régime réel s'applique alors obligatoirement (déduction des charges réelles), ce que cet outil ne prend pas encore en charge. Vérifie ta déclaration sur impots.gouv.fr ou auprès d'un professionnel.",
    );
  }

  const dividendes = resolveDividendes(answers);
  const plusValueTitres = resolvePlusValueTitres(answers);
  const pfu = computePFU(dividendes, plusValueTitres);

  const activiteVous = resolveActiviteIndependante(answers, "");
  if (activiteVous.type && activiteVous.chiffreAffaires > MICRO_ACTIVITE_INFO[activiteVous.type].seuil) {
    throw new UnsupportedSituationError(
      "Le chiffre d'affaires de ton activité de micro-entrepreneur dépasse le seuil du régime micro-entreprise pour ce type d'activité : le régime réel (BIC) ou la déclaration contrôlée (BNC) s'applique alors obligatoirement, ce que cet outil ne prend pas encore en charge. Vérifie ta déclaration sur impots.gouv.fr ou auprès d'un professionnel.",
    );
  }
  const activiteConjoint = isCouple ? resolveActiviteIndependante(answers, "-conjoint") : { type: undefined, chiffreAffaires: 0 };
  if (
    activiteConjoint.type &&
    activiteConjoint.chiffreAffaires > MICRO_ACTIVITE_INFO[activiteConjoint.type].seuil
  ) {
    throw new UnsupportedSituationError(
      "Le chiffre d'affaires de l'activité de micro-entrepreneur de ton/ta conjoint·e dépasse le seuil du régime micro-entreprise pour ce type d'activité : le régime réel (BIC) ou la déclaration contrôlée (BNC) s'applique alors obligatoirement, ce que cet outil ne prend pas encore en charge. Vérifie ta déclaration sur impots.gouv.fr ou auprès d'un professionnel.",
    );
  }

  const vous = resolveNetImposable(answers, "");
  const conjointASalaire = isCouple && includesOption(answers["revenus-conjoint"], "salaire");
  const conjoint = conjointASalaire
    ? resolveNetImposable(answers, "-conjoint")
    : { netImposable: 0, isEstimate: false };

  const chomageDeclare = includesOption(answers["revenus"], "chomage");
  const chomageVous = resolveChomage(answers, "");
  const chomageConjointDeclare = isCouple && includesOption(answers["revenus-conjoint"], "chomage");
  const chomageConjoint = chomageConjointDeclare ? resolveChomage(answers, "-conjoint") : 0;
  const conjointADesRevenus = conjointASalaire || chomageConjointDeclare;

  const brutVous = vous.netImposable + chomageVous;
  const brutConjoint = conjoint.netImposable + chomageConjoint;
  const taxableIncomeVous = computeTaxableIncome(brutVous);
  const taxableIncomeConjoint = conjointADesRevenus ? computeTaxableIncome(brutConjoint) : 0;

  const pensionDeclare = includesOption(answers["revenus"], "pension");
  const pensionVous = resolvePension(answers, "");
  const pensionConjointDeclare = isCouple && includesOption(answers["revenus-conjoint"], "pension");
  const pensionConjoint = pensionConjointDeclare ? resolvePension(answers, "-conjoint") : 0;
  const taxableIncomePensions = computePensionTaxableIncome(pensionVous, pensionConjoint);

  const foncierDeclare = includesOption(answers["activites-annexes"], "foncier");
  const taxableIncomeFoncier = computeFoncierTaxableIncome(recettesBrutesFoncier);

  const dividendesDeclare = includesOption(answers["activites-annexes"], "dividendes");
  const plusValueTitresDeclare = includesOption(answers["activites-annexes"], "plus-value-titres");

  const taxableIncomeActiviteVous = activiteVous.type
    ? computeMicroTaxableIncome(activiteVous.chiffreAffaires, activiteVous.type)
    : 0;
  const taxableIncomeActiviteConjoint = activiteConjoint.type
    ? computeMicroTaxableIncome(activiteConjoint.chiffreAffaires, activiteConjoint.type)
    : 0;

  const taxableIncome =
    taxableIncomeVous +
    taxableIncomeConjoint +
    taxableIncomePensions +
    taxableIncomeFoncier +
    taxableIncomeActiviteVous +
    taxableIncomeActiviteConjoint;

  const parts = computeParts(answers);
  const { brutTax, isCapped } = computeQuotientFamilialTax(taxableIncome, parts, isCouple);
  const tax = computeDecote(brutTax, isCouple);

  const lines: DeclarationLine[] = [
    {
      code: vous.isEstimate ? undefined : "1AJ",
      label: vous.isEstimate
        ? "Salaire net imposable estimé (toi)"
        : "Salaire net imposable à déclarer (toi)",
      value: vous.netImposable,
      explanation: vous.isEstimate
        ? "Estimation calculée à partir de ton salaire brut annuel (environ 80% du brut) — à confirmer avec ta fiche de paie de décembre avant de déclarer."
        : `C'est le montant « Net imposable » indiqué sur ton bulletin de salaire de décembre de ${ANNEE_LABEL} (cumul annuel), à reporter dans la case 1AJ.`,
      source: "impots.gouv.fr — Salaires et assimilés",
    },
  ];

  if (chomageDeclare) {
    lines.push({
      code: "1AP",
      label: "Allocations chômage à déclarer (toi)",
      value: chomageVous,
      explanation:
        "C'est le montant imposable indiqué sur ton attestation fiscale annuelle de France Travail, à reporter dans la case 1AP.",
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
        ? "Estimation calculée à partir du salaire brut annuel de ton/ta conjoint·e (environ 80% du brut) — à confirmer avec sa fiche de paie de décembre avant de déclarer."
        : `C'est le montant « Net imposable » indiqué sur le bulletin de salaire de décembre de ${ANNEE_LABEL} de ton/ta conjoint·e (cumul annuel), à reporter dans la case 1BJ.`,
      source: "impots.gouv.fr — Salaires et assimilés",
    });
  }

  if (chomageConjointDeclare) {
    lines.push({
      code: "1BP",
      label: "Allocations chômage à déclarer (conjoint·e)",
      value: chomageConjoint,
      explanation:
        "C'est le montant imposable indiqué sur l'attestation fiscale annuelle de France Travail de ton/ta conjoint·e, à reporter dans la case 1BP.",
      source: "impots.gouv.fr — Autres revenus imposables ; BOFiP BOI-RSA-BASE-30-50-20",
    });
  }

  if (pensionDeclare) {
    lines.push({
      code: "1AS",
      label: "Pension de retraite à déclarer (toi)",
      value: pensionVous,
      explanation:
        "C'est le montant brut de ta pension, avant abattement, à reporter dans la case 1AS.",
      source: "impots.gouv.fr — Pensions de retraite ; CGI art. 158, 5°, a",
    });
  }

  if (pensionConjointDeclare) {
    lines.push({
      code: "1BS",
      label: "Pension de retraite à déclarer (conjoint·e)",
      value: pensionConjoint,
      explanation:
        "C'est le montant brut de la pension de ton/ta conjoint·e, avant abattement, à reporter dans la case 1BS.",
      source: "impots.gouv.fr — Pensions de retraite ; CGI art. 158, 5°, a",
    });
  }

  if (foncierDeclare) {
    lines.push({
      code: "4BE",
      label: "Revenus fonciers bruts à déclarer (location non meublée)",
      value: recettesBrutesFoncier,
      explanation:
        "C'est le montant brut des loyers perçus par ton foyer, hors charges et avant abattement, à reporter dans la case 4BE.",
      source: "impots.gouv.fr — Revenus fonciers ; CGI art. 32 (régime micro-foncier)",
    });
  }

  if (dividendesDeclare) {
    lines.push({
      code: "2DC",
      label: "Dividendes à déclarer",
      value: dividendes,
      explanation:
        "C'est le montant brut de dividendes perçus par ton foyer, avant tout prélèvement, à reporter dans la case 2DC. Si tu es en couple, ce montant peut se répartir entre vos cases respectives selon vos IFU — ça ne change pas le montant total dû, le taux du PFU étant le même quelle que soit la répartition.",
      source: "impots.gouv.fr — Revenus des valeurs et capitaux mobiliers ; CGI art. 200 A",
    });
  }

  if (plusValueTitresDeclare) {
    lines.push({
      code: "3VG",
      label: "Plus-value de cession de valeurs mobilières à déclarer (hors PEA)",
      value: plusValueTitres,
      explanation:
        "C'est le montant net de la plus-value réalisée par ton foyer (après compensation des moins-values), tel que calculé par ta banque ou ton courtier, à reporter dans la case 3VG. Même remarque que pour les dividendes : la répartition vous/conjoint ne change pas le montant total dû.",
      source: "impots.gouv.fr — Plus-values de cession de valeurs mobilières ; CGI art. 200 A",
    });
  }

  if (activiteVous.type) {
    const info = MICRO_ACTIVITE_INFO[activiteVous.type];
    lines.push({
      code: info.codeVous,
      label: `Chiffre d'affaires à déclarer (toi) — ${info.libelle}`,
      value: activiteVous.chiffreAffaires,
      explanation: `C'est le montant brut total encaissé pour ton activité de micro-entrepreneur (${info.libelle}), avant abattement, à reporter dans la case ${info.codeVous}.`,
      source: "impots.gouv.fr — Revenus des professions non salariées ; CGI art. 50-0 / 102 ter (régime micro-entreprise)",
    });
  }

  if (activiteConjoint.type) {
    const info = MICRO_ACTIVITE_INFO[activiteConjoint.type];
    lines.push({
      code: info.codeConjoint,
      label: `Chiffre d'affaires à déclarer (conjoint·e) — ${info.libelle}`,
      value: activiteConjoint.chiffreAffaires,
      explanation: `C'est le montant brut total encaissé pour l'activité de micro-entrepreneur de ton/ta conjoint·e (${info.libelle}), avant abattement, à reporter dans la case ${info.codeConjoint}.`,
      source: "impots.gouv.fr — Revenus des professions non salariées ; CGI art. 50-0 / 102 ter (régime micro-entreprise)",
    });
  }

  lines.push({
    label: "Revenu imposable retenu pour le foyer, après abattement de 10% pour frais professionnels",
    value: taxableIncomeVous + taxableIncomeConjoint,
    explanation: `L'administration applique automatiquement un abattement de 10% sur l'ensemble des sommes touchées par chaque déclarant au titre du salaire et, le cas échéant, des allocations chômage (au moins 509€, au plus 14 555€ chacun pour les revenus de ${ANNEE_LABEL}), pour couvrir forfaitairement ses frais professionnels courants.`,
    source: "CGI art. 83, 3° ; BOFiP BOI-BAREME-000035, BOI-RSA-BASE-30-50-20",
  });

  if (pensionDeclare || pensionConjointDeclare) {
    lines.push({
      label: "Revenu imposable retenu pour le foyer, pensions et retraites, après abattement de 10%",
      value: taxableIncomePensions,
      explanation:
        "L'administration applique un abattement de 10% distinct de celui des salaires sur l'ensemble des pensions du foyer (au moins 454€ par pensionné, mais 4 439€ au maximum pour tout le foyer, même quand les deux membres du couple touchent une pension).",
      source: "CGI art. 158, 5°, a",
    });
  }

  if (foncierDeclare) {
    lines.push({
      label: "Revenu foncier imposable retenu, après abattement de 30% (régime micro-foncier)",
      value: taxableIncomeFoncier,
      explanation:
        "L'administration applique automatiquement un abattement forfaitaire de 30% sur les loyers bruts perçus, sans justificatif, tant que le total ne dépasse pas 15 000€ par an pour le foyer.",
      source: "CGI art. 32",
    });
  }

  if (activiteVous.type) {
    const info = MICRO_ACTIVITE_INFO[activiteVous.type];
    lines.push({
      label: `Revenu imposable retenu (toi), après abattement forfaitaire de ${Math.round(info.taux * 100)}% (activité indépendante)`,
      value: taxableIncomeActiviteVous,
      explanation: `L'administration applique automatiquement un abattement forfaitaire de ${Math.round(info.taux * 100)}% sur ton chiffre d'affaires (${info.libelle}), sans justificatif — au moins 305€.`,
      source: "CGI art. 50-0 / 102 ter",
    });
  }

  if (activiteConjoint.type) {
    const info = MICRO_ACTIVITE_INFO[activiteConjoint.type];
    lines.push({
      label: `Revenu imposable retenu (conjoint·e), après abattement forfaitaire de ${Math.round(info.taux * 100)}% (activité indépendante)`,
      value: taxableIncomeActiviteConjoint,
      explanation: `L'administration applique automatiquement un abattement forfaitaire de ${Math.round(info.taux * 100)}% sur le chiffre d'affaires de ton/ta conjoint·e (${info.libelle}), sans justificatif — au moins 305€.`,
      source: "CGI art. 50-0 / 102 ter",
    });
  }

  lines.push(
    {
      label: "Impôt sur le revenu (avant réductions et crédits d'impôt éventuels)",
      value: tax,
      explanation: `Calculé par tranches selon le barème progressif applicable aux revenus de ${ANNEE_LABEL}, en tenant compte de ton quotient familial (${formatParts(parts)} part${parts > 1 ? "s" : ""}) et de la décote pour les revenus modestes.`,
      source: "CGI art. 194 et 197",
    },
  );

  if (dividendesDeclare || plusValueTitresDeclare) {
    lines.push({
      label: "Prélèvement forfaitaire unique (PFU) sur tes revenus du capital",
      value: pfu,
      explanation:
        "30% de tes dividendes et plus-values (12,8% d'impôt sur le revenu + 17,2% de prélèvements sociaux), à taux fixe — ce montant s'ajoute à l'impôt sur le revenu ci-dessus, il n'est pas calculé par tranches ni affecté par ton quotient familial.",
      source: "CGI art. 200 A",
    });
  }

  const warnings: string[] = [];
  if (vous.isEstimate || conjoint.isEstimate) {
    warnings.push(
      "Au moins un montant de salaire net imposable utilisé ici est une estimation basée sur un salaire brut, pas un montant exact. Confirme-le avec la fiche de paie de décembre avant de déclarer.",
    );
  }
  if (isCapped) {
    warnings.push(
      "L'avantage fiscal lié à tes parts supplémentaires (enfants à charge) a été plafonné par la loi : au-delà d'un certain montant par demi-part, la réduction d'impôt n'augmente plus.",
    );
  }

  const conseils: Conseil[] = [];
  if (includesOption(answers["activites-annexes"], "crypto")) {
    conseils.push({
      text: "Tu as un compte sur une plateforme crypto basée à l'étranger : aux yeux de l'administration, c'est un compte à l'étranger. Tu dois déclarer son existence chaque année avec le formulaire 3916-bis, séparément de ta déclaration de revenus — même si tu n'as rien vendu et même si le compte est presque vide (une plateforme basée en France n'est pas concernée). Oublier cette déclaration coûte 750€ par compte non déclaré, 1 500€ si sa valeur a dépassé 50 000€ à un moment de l'année. Si tu as aussi vendu des cryptos contre des euros avec un gain, il y a un formulaire séparé (2086) pour ça — non calculé par cet outil pour l'instant.",
      source: "CGI art. 1649 bis C (obligation), art. 1736 X (sanctions) ; impots.gouv.fr — Modalités de déclaration des comptes d'actifs numériques détenus à l'étranger",
    });
  }
  if (includesOption(answers["activites-annexes"], "pea")) {
    if (answers["pea-cinq-ans"] === true) {
      conseils.push({
        text: "Ton PEA est ouvert depuis plus de 5 ans sans clôture : ses gains sont exonérés d'impôt sur le revenu, tu n'as rien à indiquer dans cette déclaration pour lui. Seuls les prélèvements sociaux (17,2%) restent dus, mais ils sont généralement déjà prélevés directement par ta banque au moment d'un retrait — vérifie juste que ça a bien été fait avant de considérer que c'est réglé.",
        source: "CGI art. 150-0 A, III-5 ; service-public.fr — Impôt sur le revenu, plus-values sur valeurs mobilières",
      });
    } else {
      conseils.push({
        text: "Un PEA de moins de 5 ans, ou avec un retrait ayant entraîné sa clôture, suit un régime plus complexe (le calcul dépend de la date d'ouverture et du motif du retrait) — cet outil ne le calcule pas. Vérifie ta situation sur impots.gouv.fr ou avec un professionnel avant de déclarer.",
        source: "CGI art. 150-0 A, III-5 ; service-public.fr — Impôt sur le revenu, plus-values sur valeurs mobilières",
      });
    }
  }

  const rawVous = vous.netImposable + chomageVous + pensionVous + activiteVous.chiffreAffaires;
  const rawConjoint =
    conjoint.netImposable + chomageConjoint + pensionConjoint + activiteConjoint.chiffreAffaires;
  const tauxFoyer = computeTauxPrelevementSourceFoyer(
    tax,
    rawVous + rawConjoint + recettesBrutesFoncier,
  );

  let tauxPrelevementSource: TauxPrelevementSource;
  if (isCouple && recettesBrutesFoncier > 0) {
    // Le foncier est un revenu commun au foyer (pas attribuable à vous/conjoint) :
    // la formule du taux individualisé implémentée ici suppose l'absence de
    // revenus communs (cf. plan incrément 7, décision 3). On se limite au taux
    // foyer plutôt que de calculer un taux individualisé potentiellement faux.
    tauxPrelevementSource = { foyer: tauxFoyer };
    warnings.push(
      "Le taux individualisé par conjoint n'est pas calculé ici car tes revenus fonciers sont communs au foyer : seul le taux foyer ci-dessous est indiqué. Consulte ton espace impots.gouv.fr pour le détail par conjoint.",
    );
  } else if (isCouple) {
    const taxableIncomeVousSeul =
      taxableIncomeVous + computePensionTaxableIncome(pensionVous, 0) + taxableIncomeActiviteVous;
    const taxableIncomeConjointSeul =
      taxableIncomeConjoint +
      computePensionTaxableIncome(pensionConjoint, 0) +
      taxableIncomeActiviteConjoint;
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

  const fraisReelsComparaison = {
    vous:
      brutVous > 0 ? { brut: brutVous, abattementActuel: brutVous - taxableIncomeVous } : undefined,
    conjoint:
      conjointADesRevenus && brutConjoint > 0
        ? { brut: brutConjoint, abattementActuel: brutConjoint - taxableIncomeConjoint }
        : undefined,
  };

  return {
    lines,
    warnings: warnings.length > 0 ? warnings : undefined,
    conseils: conseils.length > 0 ? conseils : undefined,
    tauxPrelevementSource,
    fraisReelsComparaison:
      fraisReelsComparaison.vous || fraisReelsComparaison.conjoint ? fraisReelsComparaison : undefined,
  };
}
