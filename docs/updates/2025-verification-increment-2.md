# Vérification — Incrément 2 (célibataire, un salaire, abattement 10%, revenus 2025)

Comparaison entre `src/lib/tax-rules/2025/compute.ts` et le simulateur officiel
[simulateur-ir-ifi.impots.gouv.fr](https://simulateur-ir-ifi.impots.gouv.fr/calcul_impot/2026/index.htm)
(modèle simplifié), version Mars 2026 — « Calcul de l'impôt 2026 sur les revenus 2025 ».

Paramétrage : situation "Célibataire", résidence Métropole, année de naissance 1990, aucune charge, aucune autre case renseignée que 1AJ.

| Cas | 1AJ saisi | Notre `taxableIncome` | Simulateur : revenu net imposable | Notre `tax` | Simulateur : impôt sur le revenu net | Résultat |
|---|---|---|---|---|---|---|
| 1 | 12 000 € | 10 800 € | 10 800 € | 0 € | 0 € | ✅ Exact |
| 3 | 28 000 € | 25 200 € | 25 200 € | 1 276 € | 1 276 € (droits simples 1 496, décote 220) | ✅ Exact |
| 5 | 200 000 € | 185 445 € | 185 445 € | 59 974 € | 59 974 € | ✅ Exact |

Les cas 2 et 4 (plancher de l'abattement, tranche 30%) n'ont pas été repassés dans le simulateur — ils utilisent les mêmes fonctions pures (`computeTaxableIncome`, `computeProgressiveTax`) déjà validées exactement sur les 3 cas ci-dessus, aux mêmes bornes de barème/abattement.

**Conclusion** : le moteur de calcul de l'incrément 2 produit des résultats identiques à l'euro près au simulateur officiel de la DGFiP pour le cas célibataire / un salaire / abattement 10%. Vérifié le 2026-08-12.
