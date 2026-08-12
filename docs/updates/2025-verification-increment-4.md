# Vérification — Incrément 4 (situations familiales couple, second salaire, quotient familial)

Comparaison entre `src/lib/tax-rules/2025/compute.ts` et le simulateur officiel
[simulateur-ir-ifi.impots.gouv.fr](https://simulateur-ir-ifi.impots.gouv.fr/calcul_impot/2026/simplifie/index.htm)
(modèle simplifié), version Mars 2026 — « Calcul de l'impôt 2026 sur les revenus 2025 ».

Paramétrage commun : couple marié (case M), résidence Métropole, années de naissance 1990 pour les deux déclarants, 1AJ = 1BJ = 20 000 € (salaires identiques pour les deux déclarants dans les 3 scénarios — cf. limitation ci-dessous).

| Cas | Enfants à charge | Nombre de parts (nous / simulateur) | Droits simples (nous / simulateur) | Décote (nous / simulateur) | Impôt net (nous / simulateur) | Résultat |
|---|---|---|---|---|---|---|
| 1 | 0 | 2 / 2 | 1 408 € / 1 408 € | 846 € / 846 € | 562 € / 562 € | ✅ Exact |
| 2 | 1 | 2,5 / 2,5 | 770 € / 770 € | 770 € / 770 € | 0 € / 0 € | ✅ Exact |
| 3 | 2 | 3 / 3 | 132 € / 132 € | 132 € / 132 € | 0 € / 0 € | ✅ Exact |

Ces trois cas valident : le calcul du nombre de parts (`computeParts`, couple sans enfant / +1 / +2), la décote spécifique aux foyers en imposition commune (`DECOTE_COUPLE_2025`, y compris son plancher à 0 quand elle dépasse les droits simples), et la branche non plafonnée de `computeQuotientFamilialTax`.

## Limitation connue de cette vérification

Les 3 scénarios ci-dessus portent tous sur les mêmes salaires (20 000 € / 20 000 €) : un problème de synchronisation des champs de saisie du formulaire officiel (les champs 1AJ/1BJ affichaient bien la valeur saisie via l'outil d'automatisation utilisé, mais la valeur soumise au calcul restait celle d'une saisie précédente) a empêché de tester un cas à hauts revenus pendant cette session. La **branche plafonnée** de `computeQuotientFamilialTax` (celle où l'avantage du quotient familial dépasse `PLAFOND_QUOTIENT_FAMILIAL_DEMI_PART_2025`) n'a donc **pas** été revérifiée indépendamment contre le simulateur officiel — elle reste couverte par les tests unitaires (`compute.test.ts`, cas « caps the quotient familial benefit... », calculé et recoupé manuellement), qui réutilisent la même fonction `computeGrossTaxOnQuotient` déjà validée trois fois ci-dessus, appliquée à la formule de plafonnement sourcée (BOFiP BOI-IR-LIQ-20-20-20, cf. `docs/tax-rules-sources.md`).

**Action de suivi suggérée** : revérifier manuellement un cas à hauts revenus avec enfants (ex. deux salaires à 90 000 € chacun, 2 enfants) sur le simulateur officiel, pour confirmer indépendamment le déclenchement du plafonnement.

**Conclusion** : le moteur de calcul de l'incrément 4 produit des résultats identiques à l'euro près au simulateur officiel de la DGFiP pour le cas couple/deux salaires égaux, avec 0, 1 et 2 enfants à charge (branche non plafonnée). Vérifié le 2026-08-12.
