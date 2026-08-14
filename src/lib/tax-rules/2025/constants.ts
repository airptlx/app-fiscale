/**
 * Année des revenus concernés par ce dossier (déclarés en ANNEE_REVENUS_2025 + 1).
 * Source de vérité unique pour l'année affichée dans les questions/explications
 * (`questions.ts`, `compute.ts`) et pour `registry.ts` — jamais dérivée de la date
 * du jour : l'outil ne devient pertinent pour une nouvelle année que le jour où ce
 * dossier est dupliqué et son barème mis à jour (cf. « Process de mise à jour
 * annuelle », docs/tax-rules-sources.md), pas automatiquement au 1er janvier.
 */
export const ANNEE_REVENUS_2025 = 2025;

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

/**
 * Régime micro-entreprise (micro-BIC/micro-BNC), revenus 2025 (seuils applicables
 * pour les revenus 2023 à 2025 — un nouveau palier s'applique aux revenus 2026-2028,
 * cf. page datée impots.gouv.fr ci-dessous ; à ne pas confondre avec le texte de
 * loi actuellement en vigueur sur Légifrance qui affiche déjà les seuils 2026-2028).
 * Trois catégories, taux d'abattement distincts, plancher commun de 305€ :
 * - vente de marchandises/produits (BIC) : abattement 71%, seuil 188 700€.
 * - prestation de service (BIC) : abattement 50%, seuil 77 700€.
 * - activité libérale (BNC) : abattement 34%, seuil 77 700€ (même seuil que service).
 * Au-delà du seuil, passage obligatoire au régime réel (BIC) ou à la déclaration
 * contrôlée (BNC) — hors scope, `UnsupportedSituationError`.
 * Base légale : CGI art. 50-0 (micro-BIC) et art. 102 ter (micro-BNC).
 * https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042159220 (micro-BIC)
 * https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000047622381 (micro-BNC)
 * Seuils 2023-2025 : https://www.impots.gouv.fr/professionnel/questions/pour-rester-micro-entrepreneur-quel-montant-de-chiffre-daffaires-ou-de
 * Récupéré le 2026-08-13.
 */
export const MICRO_BIC_VENTE_TAUX_2025 = 0.71;
export const MICRO_BIC_SERVICE_TAUX_2025 = 0.5;
export const MICRO_BNC_TAUX_2025 = 0.34;
export const MICRO_ABATTEMENT_PLANCHER_2025 = 305;

/**
 * Prélèvement forfaitaire unique (PFU, « flat tax »), applicable par défaut aux
 * dividendes (case 2DC) et plus-values de cession de valeurs mobilières hors PEA
 * (case 3VG) — l'option pour le barème progressif (case 2OP, avec abattement de
 * 40% sur les dividendes) est hors scope, comme le versement libératoire déjà
 * exclu pour la micro-entreprise.
 * Taux valables pour les revenus 2025 uniquement : 12,8% (IR) + 17,2% (prélèvements
 * sociaux) = 30%. Attention, la plupart des sources en ligne aujourd'hui affichent
 * déjà le taux 2026 (12,8% + 18,6% = 31,4%, hausse de CSG actée par la LFSS 2026) —
 * ne pas confondre : ce taux ne s'applique qu'aux revenus perçus à partir du
 * 1er janvier 2026.
 * https://www.impots.gouv.fr/particulier/questions/jai-realise-une-plus-value-mobiliere-comment-est-elle-imposee
 * CGI art. 200 A.
 * Récupéré le 2026-08-14.
 */
export const PFU_TAUX_IR_2025 = 0.128;
export const PFU_TAUX_SOCIAL_2025 = 0.172;
export const PFU_TAUX_GLOBAL_2025 = PFU_TAUX_IR_2025 + PFU_TAUX_SOCIAL_2025;

/**
 * PEA (plan d'épargne en actions), toutes années : tant qu'aucun retrait
 * n'intervient avant 5 ans, les gains restent dans le plan et n'ont rien à être
 * déclarés. Après 5 ans, exonération d'IR, seuls les prélèvements sociaux restent
 * dus (généralement déjà prélevés par l'établissement au retrait) — purement
 * informatif dans cet outil, aucune valeur numérique associée.
 * https://www.service-public.gouv.fr/particuliers/vosdroits/F21618
 * CGI art. 150-0 A, III-5.
 * Récupéré le 2026-08-14.
 */
export const MICRO_SEUIL_VENTE_2025 = 188_700;
export const MICRO_SEUIL_SERVICE_2025 = 77_700;
