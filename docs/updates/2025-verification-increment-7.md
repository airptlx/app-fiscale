# Vérification — Incrément 7 (revenus fonciers, régime micro-foncier, case 4BE)

## Source légale primaire

L'article 32 du Code général des impôts a été consulté directement sur Légifrance :

> « Lorsque le montant du revenu brut annuel [...] n'excède pas 15 000 € [...] le revenu net foncier imposable est égal au revenu brut diminué d'un abattement de 30 %. »
> — [Article 32, Code général des impôts](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000048847610), consulté le 2026-08-13.

Ce texte confirme exactement les deux règles utilisées dans `computeFoncierTaxableIncome` et la garde de seuil dans `computeDeclaration` (`src/lib/tax-rules/2025/compute.ts`) : seuil de 15 000€ apprécié au niveau du foyer, abattement de 30% sans plancher. La case officielle (4BE, section « REVENUS FONCIERS — Micro foncier : Indiquez les recettes brutes, ne déduisez aucun abattement ») a été directement observée sur le simulateur officiel DGFiP (modèle simplifié) à plusieurs reprises pendant cette session.

## Vérification contre le simulateur officiel — tentative et limite rencontrée

Comme pour l'incrément 6, la vérification en direct sur le [simulateur officiel DGFiP](https://simulateur-ir-ifi.impots.gouv.fr/calcul_impot/2026/simplifie/index.htm) n'a **pas pu être menée à bien** pendant cette session : le formulaire n'a pas pu être soumis malgré plusieurs méthodes de saisie et plusieurs boutons essayés (« Valider », « lancer la simulation »). Aucune valeur n'a donc pu être comparée en direct pour cet incrément.

**Ce qui a néanmoins été vérifié** :
- Le seuil (15 000€) et le taux d'abattement (30%, sans plancher) directement dans le texte de loi (CGI art. 32), pas seulement via des sites tiers.
- La case officielle 4BE, observée directement sur le simulateur officiel DGFiP lui-même (section « REVENUS FONCIERS »), pas une source secondaire.
- 66 tests unitaires (`compute.test.ts`) couvrant : abattement 30% simple, absence de plancher (contrairement aux abattements salaires/pensions), comportement exact au seuil (15 000€, pas d'erreur) et juste au-delà (15 001€, `UnsupportedSituationError`), ainsi que le repli du taux de prélèvement à la source sur le taux foyer seul (avec avertissement) pour un couple ayant des revenus fonciers — tous passent avec des valeurs calculées à la main puis confirmées par `npm run test`.

**Action de suivi suggérée** : revérifier manuellement (dans un navigateur normal, hors automatisation) un cas micro-foncier simple (ex. salaire 20 000€ + case 4BE = 6 000€) sur le simulateur officiel, pour obtenir la confirmation externe qui manque à cet incrément — attendu : revenu net imposable 22 200€ (18 000€ salaire + 4 200€ foncier), impôt 797€.

**Conclusion** : le mécanisme est sourcé au niveau le plus fiable possible (texte de loi consulté directement, case officielle observée sur le simulateur lui-même) et testé unitairement de façon exhaustive, mais n'a pas la double vérification externe (soumission complète du simulateur) obtenue pour les incréments 2, 4 et 5. Vérifié le 2026-08-13.
