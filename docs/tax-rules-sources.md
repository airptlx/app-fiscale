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

Note : le ratio d'estimation brut → net imposable (80%, `src/lib/tax-rules/2025/estimation.ts`) n'apparaît **pas** dans cette table — ce n'est pas une règle fiscale sourcée officiellement, mais une heuristique documentée directement dans le fichier concerné.

## Process de mise à jour annuelle

1. Copier `src/lib/tax-rules/2025/` vers `src/lib/tax-rules/2026/`.
2. Mettre à jour chaque valeur avec sa nouvelle source, en complétant une ligne dans cette table.
3. Faire tourner quelques scénarios de référence dans le simulateur officiel impots.gouv.fr et comparer.
4. Logger la comparaison dans `docs/updates/2026-tax-year-update.md`.
