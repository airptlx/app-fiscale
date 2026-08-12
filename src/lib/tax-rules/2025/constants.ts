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
