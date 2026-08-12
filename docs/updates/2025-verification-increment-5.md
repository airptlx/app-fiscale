# Vérification — Incrément 5 (allocations chômage, cases 1AP/1BP)

Comparaison entre `src/lib/tax-rules/2025/compute.ts` et le simulateur officiel
[simulateur-ir-ifi.impots.gouv.fr](https://simulateur-ir-ifi.impots.gouv.fr/calcul_impot/2026/simplifie/index.htm)
(modèle simplifié), version Mars 2026 — « Calcul de l'impôt 2026 sur les revenus 2025 ».

| Cas | Paramétrage | 1AJ | 1AP/1BP | Nos parts / simulateur | Notre `taxableIncome` / simulateur | Notre `tax` / simulateur | Résultat |
|---|---|---|---|---|---|---|---|
| 1 | Célibataire, résidence Métropole, née 1990, salaire + chômage cumulés | 20 000 € | 1AP = 5 000 € | 1 / 1 | 22 500 € / 22 500 € | 845 € / 845 € (droits simples 1 199, décote 354) | ✅ Exact |
| 2 | Couple marié, résidence Métropole, nés 1990, vous salarié, conjoint·e chômage seul (pas de salaire) | 20 000 € | 1BP = 8 000 € | 2 / 2 | 25 200 € / 25 200 € | 0 € / 0 € (droits simples 220, décote 220) | ✅ Exact |

Ces deux cas valident : le regroupement du chômage dans le même pool d'abattement de 10% que le salaire (`resolveChomage` + `computeTaxableIncome` réutilisée telle quelle, cf. BOI-RSA-BASE-30-50-20), et la contribution du conjoint au revenu imposable total et au nombre de parts même sans salaire propre (absence de ligne 1BJ, présence de la ligne 1BP, « Nombre de parts » confirmé à 2 par le simulateur officiel).

**Conclusion** : le moteur de calcul de l'incrément 5 produit des résultats identiques à l'euro près au simulateur officiel de la DGFiP pour les deux scénarios ci-dessus (célibataire salaire+chômage ; couple avec conjoint chômage-seul). Vérifié le 2026-08-12.
