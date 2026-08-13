/**
 * Barème progressif de l'IR, revenus 2025 (imposition 2026), 1 part de quotient familial.
 * Base légale : CGI art. 197, I-1°-A/B (loi n°2026-103 du 19/02/2026 de finances pour 2026, art. 4).
 * https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000053542636 (en vigueur depuis le 21/02/2026)
 * Recoupé : service-public.gouv.fr/particuliers/actualites/A18045 ;
 *           bofip.impots.gouv.fr/bofip/14954-PGP.html/ACTU-2026-00022
 * Récupéré le 2026-08-12.
 */
export const BAREME_2025 = [
  { from: 0, to: 11_600, rate: 0 },
  { from: 11_600, to: 29_579, rate: 0.11 },
  { from: 29_579, to: 84_577, rate: 0.3 },
  { from: 84_577, to: 181_917, rate: 0.41 },
  { from: 181_917, to: null, rate: 0.45 },
] as const satisfies readonly { from: number; to: number | null; rate: number }[];

/**
 * Décote, foyer d'une part (célibataire sans personne à charge), revenus 2025.
 * décote = max(0, 897 − 0,4525 × impôt brut) ; ne peut jamais rendre l'impôt négatif.
 * Base légale : CGI art. 197, I-4°-a.
 * https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000053542636
 * Récupéré le 2026-08-12.
 */
export const DECOTE_CELIBATAIRE_2025 = {
  montantForfaitaire: 897,
  taux: 0.4525,
} as const;

/**
 * Déduction forfaitaire de 10% pour frais professionnels (traitements et salaires), revenus 2025.
 * Base légale : CGI art. 83, 3° (mécanisme + réindexation annuelle) ; montants indexés :
 * BOFiP BOI-BAREME-000035, §IV, à jour au 17/02/2026.
 * https://bofip.impots.gouv.fr/bofip/10855-PGP.html/identifiant=BOI-BAREME-000035-20260217
 * Recoupé : simulateur-ir-ifi.impots.gouv.fr/calcul_impot/2026/aides/frais.htm
 * Récupéré le 2026-08-12.
 */
export const ABATTEMENT_10_PLANCHER_2025 = 509;
export const ABATTEMENT_10_PLAFOND_2025 = 14_555;

/**
 * Décote, foyer soumis à imposition commune (marié/pacsé), revenus 2025.
 * décote = max(0, 1 483 − 0,4525 × impôt brut) ; ne peut jamais rendre l'impôt négatif.
 * Base légale : CGI art. 197, I-4°-a.
 * https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000053542636
 * Recoupé : bofip.impots.gouv.fr/bofip/2495-PGP.html/identifiant=BOI-IR-LIQ-20-20-30-20260407
 * Récupéré le 2026-08-12.
 */
export const DECOTE_COUPLE_2025 = {
  montantForfaitaire: 1_483,
  taux: 0.4525,
} as const;

/**
 * Plafonnement général des effets du quotient familial (cas standard, hors parent
 * isolé/veuvage), revenus 2025 : l'avantage fiscal procuré par chaque demi-part
 * au-delà du nombre de parts de référence (1 pour une personne seule, 2 pour un
 * couple) ne peut pas dépasser ce montant par demi-part.
 * Base légale : CGI art. 197, I-2.
 * https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000053542636
 * Recoupé : bofip.impots.gouv.fr/bofip/2494-PGP.html/identifiant=BOI-IR-LIQ-20-20-20-20260407
 * Récupéré le 2026-08-12.
 */
export const PLAFOND_QUOTIENT_FAMILIAL_DEMI_PART_2025 = 1_807;

/**
 * Abattement de 10% sur les pensions et retraites, revenus 2025 — mécanique
 * distincte de l'abattement salaires/chômage (constants ci-dessus) : ce même
 * abattement pool ne s'applique PAS aux pensions (BOFiP BOI-RSA-BASE-30-50-20,
 * cf. incrément 5). Plancher par pensionné, plafond partagé par foyer fiscal
 * (pas doublé pour un couple de deux pensionnés).
 * Base légale : CGI art. 158, 5°, a (2e et 3e alinéas).
 * https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000051765203
 * BOFiP : bofip.impots.gouv.fr/bofip/7458-PGP.html/identifiant=BOI-RSA-PENS-30-10-10-20170531
 * Recoupé : service-public.gouv.fr/particuliers/vosdroits/F415
 * Récupéré le 2026-08-13.
 */
export const PENSION_ABATTEMENT_PLANCHER_2025 = 454;
export const PENSION_ABATTEMENT_PLAFOND_2025 = 4_439;

/**
 * Régime micro-foncier (location non meublée), toutes années : applicable si les
 * recettes brutes annuelles du foyer fiscal n'excèdent pas ce seuil ; abattement
 * forfaitaire de 30% (sans plancher, contrairement aux abattements salaires/
 * pensions), taux laissé en dur dans compute.ts. Au-delà, le régime réel est
 * obligatoire — hors scope, `UnsupportedSituationError`.
 * Base légale : CGI art. 32 (« lorsque le montant du revenu brut annuel [...]
 * n'excède pas 15 000 €, le revenu net foncier imposable est égal au revenu brut
 * diminué d'un abattement de 30 % »).
 * https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000048847610
 * Récupéré le 2026-08-13.
 */
export const MICRO_FONCIER_SEUIL_2025 = 15_000;
