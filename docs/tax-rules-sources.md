# Sources des règles fiscales

Chaque valeur/règle fiscale utilisée dans `src/lib/tax-rules/` doit avoir une ligne ici, en plus du commentaire dans le code source.

## Convention

- **Année** : année des revenus concernés (ex. "2025" = revenus perçus en 2025, déclarés en 2026).
- **Source** : URL officielle (impots.gouv.fr, BOFiP, service-public.fr) — pas de blog ni de source tierce non-officielle.
- **Date de récupération** : quand la valeur a été vérifiée/copiée depuis la source.

## Table

| Règle | Valeur | Année | Source (URL) | Article / réf. | Date de récupération | Vérifié par |
|---|---|---|---|---|---|---|
| Barème progressif IR, 1 part | 0% ≤11 600 / 11% ≤29 579 / 30% ≤84 577 / 41% ≤181 917 / 45% >181 917 | 2025 | https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000053542636 | CGI art. 197, I-1°-A/B (LF 2026, art. 4) | 2026-08-12 | simulateur officiel, cf. `docs/updates/2025-verification-increment-2.md` |
| Décote, foyer 1 part (célibataire) | 897 € − 45,25% × impôt brut, nul au-delà d'un impôt brut ≈1 982,32€ | 2025 | https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000053542636 | CGI art. 197, I-4°-a | 2026-08-12 | simulateur officiel, cf. `docs/updates/2025-verification-increment-2.md` |
| Déduction forfaitaire 10% — plancher | 509 € | 2025 | https://bofip.impots.gouv.fr/bofip/10855-PGP.html/identifiant=BOI-BAREME-000035-20260217 | CGI art. 83, 3° ; BOI-BAREME-000035 §IV | 2026-08-12 | simulateur officiel, cf. `docs/updates/2025-verification-increment-2.md` |
| Déduction forfaitaire 10% — plafond | 14 555 € | 2025 | https://bofip.impots.gouv.fr/bofip/10855-PGP.html/identifiant=BOI-BAREME-000035-20260217 | CGI art. 83, 3° ; BOI-BAREME-000035 §IV | 2026-08-12 | simulateur officiel, cf. `docs/updates/2025-verification-increment-2.md` |
| Arrondi bases/impôt | à l'euro le plus proche, 0,50 arrondi au-dessus | toutes années | https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000051219510 | CGI art. 1657 | 2026-08-12 | — |
| Case 1AJ = salaire net imposable (≠ brut, ≠ net à payer) | — | 2025 | https://www.impots.gouv.fr/particulier/salaires-et-assimiles | Notice 2042 | 2026-08-12 | — |
| Décote, foyer imposition commune (couple) | 1 483 € − 45,25% × impôt brut, nul au-delà d'un impôt brut ≈3 277€ | 2025 | https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000053542636 | CGI art. 197, I-4°-a | 2026-08-12 | BOFiP BOI-IR-LIQ-20-20-30 (id. 20260407) |
| Plafonnement du quotient familial — plafond général par demi-part | 1 807 € | 2025 | https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000053542636 | CGI art. 197, I-2 | 2026-08-12 | BOFiP BOI-IR-LIQ-20-20-20 (id. 20260407) |
| Parts de quotient familial (cas général) | 1 part célibataire, 2 parts couple, +0,5 part/enfant (2 premiers), +1 part/enfant suivant | toutes années | https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006307074 | CGI art. 194 | 2026-08-12 | — |
| Champ d'application de l'abattement 10% — inclut les allocations chômage (France Travail) et indemnités de préretraite dans le même pool que le salaire ; exclut les pensions/retraites | — | toutes années | https://bofip.impots.gouv.fr/bofip/2287-PGP.html/identifiant=BOI-RSA-BASE-30-50-20-20190301 | BOI-RSA-BASE-30-50-20 | 2026-08-12 | — |
| Case 1AP/1BP = allocations chômage et indemnités de préretraite (« autres revenus imposables ») | — | 2025 | https://www.impots.gouv.fr/particulier/salaires-et-assimiles | Notice 2042 ; vérifié sur simulateur-ir-ifi.impots.gouv.fr | 2026-08-12 | — |
| Abattement 10% pensions/retraites — plancher, par pensionné | 454 € | 2025 | https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000051765203 | CGI art. 158, 5°, a | 2026-08-13 | service-public.gouv.fr/particuliers/vosdroits/F415 ; simulateur officiel, cf. `docs/updates/2025-verification-increment-6.md` |
| Abattement 10% pensions/retraites — plafond, par foyer fiscal (pas doublé pour un couple) | 4 439 € | 2025 | https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000051765203 | CGI art. 158, 5°, a | 2026-08-13 | service-public.gouv.fr/particuliers/vosdroits/F415 ; simulateur officiel, cf. `docs/updates/2025-verification-increment-6.md` |
| Case 1AS/1BS = pensions et retraites | — | 2025 | https://www.impots.gouv.fr/particulier/pensions-de-retraite | Notice 2042 ; vérifié sur simulateur-ir-ifi.impots.gouv.fr | 2026-08-13 | — |
| Taux de prélèvement à la source — taux foyer | IR / revenus bruts dans le champ du PAS (avant abattement 10%), arrondi à la décimale la plus proche (0,50 arrondi au-dessus), plancher 0% | toutes années | https://bofip.impots.gouv.fr/bofip/11247-PGP.html/identifiant=BOI-IR-PAS-20-20-10-20240618 | CGI art. 204 H | 2026-08-13 | simulateur officiel, cf. `docs/updates/2025-verification-increment-5.md` (recoupement empirique 845€/25 000€ = 3,4%) |
| Taux de prélèvement à la source — taux individualisé (défaut couples depuis le 01/09/2025) | Conjoint aux revenus faibles : IR (art. 197 I 1-4°) sur son revenu seul / son revenu brut. Conjoint aux revenus élevés : reliquat, cf. formule dans `compute.ts` | toutes années | https://bofip.impots.gouv.fr/bofip/11256-PGP.html/identifiant=BOI-IR-PAS-20-20-20-20250507 | CGI art. 204 H ; loi de finances 2024 | 2026-08-13 | exemple chiffré officiel BOFiP (24 000€/120 000€, IR 25 211€ -> 3,0%/20,4%), reproduit exactement dans `compute.test.ts` |
| Régime micro-foncier — seuil d'éligibilité (location non meublée) | 15 000 € de recettes brutes/an, par foyer fiscal | toutes années | https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000048847610 | CGI art. 32 | 2026-08-13 | texte de loi consulté directement |
| Régime micro-foncier — abattement forfaitaire | 30%, sans plancher | toutes années | https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000048847610 | CGI art. 32 | 2026-08-13 | texte de loi consulté directement ; simulateur officiel, cf. `docs/updates/2025-verification-increment-7.md` |
| Case 4BE = recettes brutes foncières (régime micro-foncier) | — | 2025 | https://www.impots.gouv.fr/particulier/les-revenus-fonciers | Notice 2042 ; vérifié sur simulateur-ir-ifi.impots.gouv.fr | 2026-08-13 | — |
| Régime micro-entreprise — seuils d'éligibilité (revenus 2023 à 2025) | 188 700 € (vente de marchandises) / 77 700 € (prestation de service BIC ou activité libérale BNC) | 2025 | https://www.impots.gouv.fr/professionnel/questions/pour-rester-micro-entrepreneur-quel-montant-de-chiffre-daffaires-ou-de | CGI art. 50-0 (micro-BIC) ; art. 102 ter (micro-BNC) | 2026-08-13 | page datée impots.gouv.fr (distincte des seuils 2026-2028 affichés en direct sur Légifrance) |
| Régime micro-entreprise — abattements forfaitaires | 71% (vente), 50% (service BIC), 34% (libérale BNC), plancher commun 305€ | toutes années | https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042159220 (micro-BIC) ; https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000047622381 (micro-BNC) | CGI art. 50-0 / 102 ter | 2026-08-13 | texte de loi consulté directement |
| Cases 5KO/5LO (vente), 5KP/5LP (service BIC), 5HQ/5IQ (libérale BNC) = chiffre d'affaires micro-entreprise (régime sans versement libératoire) | — | 2025 | https://www.impots.gouv.fr/particulier/questions/comment-declarer-les-revenus-provenant-de-mon-activite-dauto-entrepreneur | Notice 2042-C-PRO | 2026-08-13 | deux sources indépendantes concordantes |
| Dénominateur du taux de PAS — revenus BIC/BNC retenus bruts (avant abattement) | — | toutes années | https://bofip.impots.gouv.fr/bofip/11247-PGP.html/identifiant=BOI-IR-PAS-20-20-10-20240618 | BOI-IR-PAS-20-20-10 | 2026-08-13 | — |
| Comptes d'actifs numériques à l'étranger — obligation déclarative (formulaire 3916-bis, distinct de la 2042 ; exception : plateforme basée en France) | — (conseil, pas de calcul) | toutes années | https://www.impots.gouv.fr/actualite/modalites-de-declaration-des-comptes-dactifs-numeriques-detenus-letranger | CGI art. 1649 bis C | 2026-08-14 | — |
| Comptes d'actifs numériques à l'étranger — sanctions pour non-déclaration | 750€/compte non déclaré (125€/omission ou inexactitude, plafond 10 000€/déclaration) ; 1 500€/250€ si valeur du compte > 50 000€ à un moment de l'année | toutes années | https://www.doctrine.fr/l/texts/codes/LEGITEXT000006069577/articles/LEGIARTI000006306944 | CGI art. 1736 X | 2026-08-14 | — |
| PFU (dividendes et plus-values de cession de valeurs mobilières hors PEA) — taux global | 30% (12,8% IR + 17,2% prélèvements sociaux) | 2025 | https://www.impots.gouv.fr/particulier/questions/jai-realise-une-plus-value-mobiliere-comment-est-elle-imposee | CGI art. 200 A | 2026-08-14 | attention : la majorité des sources en ligne affichent déjà le taux 2026 (31,4% = 12,8% + 18,6%) — 30% confirmé explicitement pour les revenus 2025 par une source datée distincte |
| Cases 2DC (dividendes) / 3VG (plus-value, 3VH pour une moins-value) | — | 2025 | https://myimpots.com/cases/2042C-3VG ; notice 2042 | Notice 2042 | 2026-08-14 | deux sources indépendantes concordantes |
| PEA — exonération d'IR après 5 ans sans retrait disqualifiant ; rien à déclarer avant clôture | — (conseil, pas de calcul) | toutes années | https://www.service-public.gouv.fr/particuliers/vosdroits/F21618 | CGI art. 150-0 A, III-5 | 2026-08-14 | — |
| Frais réels — pas de plafond (contrairement à l'abattement 10%) ; montant total à déclarer sans le soustraire du salaire ; comparaison brute insuffisante si l'employeur rembourse une partie des frais (remboursement alors réintégré au revenu imposable) | — | toutes années | https://www.impots.gouv.fr/particulier/la-deduction-de-mes-frais-reels-est-elle-plus-favorable | CGI art. 83, 3° | 2026-08-14 | page dédiée impots.gouv.fr sur la comparaison frais réels / abattement 10% |
| Case 1AK (1BK pour un 2e déclarant) = frais réels | — | 2025 | https://www.impots.gouv.fr/particulier/salaires-et-assimiles | Notice 2042 | 2026-08-14 | — |

Note : le ratio d'estimation brut → net imposable (80%, `src/lib/tax-rules/2025/estimation.ts`) n'apparaît **pas** dans cette table — ce n'est pas une règle fiscale sourcée officiellement, mais une heuristique documentée directement dans le fichier concerné.

## Process de mise à jour annuelle

1. Copier `src/lib/tax-rules/2025/` vers `src/lib/tax-rules/2026/`.
2. Mettre à jour chaque valeur avec sa nouvelle source, en complétant une ligne dans cette table.
3. Faire tourner quelques scénarios de référence dans le simulateur officiel impots.gouv.fr et comparer.
4. Logger la comparaison dans `docs/updates/2026-tax-year-update.md`.
