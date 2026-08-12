# Sources des règles fiscales

Chaque valeur/règle fiscale utilisée dans `src/lib/tax-rules/` doit avoir une ligne ici, en plus du commentaire dans le code source.

## Convention

- **Année** : année des revenus concernés (ex. "2025" = revenus perçus en 2025, déclarés en 2026).
- **Source** : URL officielle (impots.gouv.fr, BOFiP, service-public.fr) — pas de blog ni de source tierce non-officielle.
- **Date de récupération** : quand la valeur a été vérifiée/copiée depuis la source.

## Table

| Règle | Valeur | Année | Source (URL) | Article / réf. | Date de récupération | Vérifié par |
|---|---|---|---|---|---|---|
| _(à compléter au fur et à mesure de l'implémentation de `src/lib/tax-rules/2025/`)_ | | | | | | |

## Process de mise à jour annuelle

1. Copier `src/lib/tax-rules/2025/` vers `src/lib/tax-rules/2026/`.
2. Mettre à jour chaque valeur avec sa nouvelle source, en complétant une ligne dans cette table.
3. Faire tourner quelques scénarios de référence dans le simulateur officiel impots.gouv.fr et comparer.
4. Logger la comparaison dans `docs/updates/2026-tax-year-update.md`.
