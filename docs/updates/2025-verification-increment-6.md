# Vérification — Incrément 6 (pensions de retraite, cases 1AS/1BS)

## Source légale primaire

L'article 158 du Code général des impôts a été consulté directement (pas seulement via des sources secondaires) :

> « Les pensions et retraites font l'objet d'un abattement de 10 % qui ne peut excéder 4 439 €. [...] L'abattement [...] ne peut être inférieur à 454 €, sans pouvoir excéder le montant brut des pensions et retraites. »
> — [Article 158, Code général des impôts](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000051765203), consulté le 2026-08-13.

Ce texte confirme exactement les deux constantes utilisées (`PENSION_ABATTEMENT_PLANCHER_2025 = 454`, `PENSION_ABATTEMENT_PLAFOND_2025 = 4_439`) et le mécanisme implémenté dans `computePensionTaxableIncome` (`src/lib/tax-rules/2025/compute.ts`) : plancher par pensionné, plafond commun au foyer, jamais d'abattement supérieur au montant brut de la pension. Recoupé par [service-public.gouv.fr](https://www.service-public.gouv.fr/particuliers/vosdroits/F415) et BOFiP BOI-RSA-PENS-30-10-10 (mécanique).

## Vérification contre le simulateur officiel — tentative et limite rencontrée

Contrairement aux incréments 4 et 5, la vérification en direct sur le [simulateur officiel DGFiP](https://simulateur-ir-ifi.impots.gouv.fr/calcul_impot/2026/simplifie/index.htm) (case 1AS/1BS) n'a **pas pu être menée à bien** pendant cette session : le champ « année de naissance » (obligatoire pour lancer le calcul) refusait de façon répétée de conserver la valeur saisie via l'outil d'automatisation utilisé (même symptôme de désynchronisation déjà rencontré ponctuellement en incrément 4, mais cette fois bloquant sur ce formulaire précis malgré plusieurs méthodes de saisie essayées). Le calcul ne s'est jamais lancé ; aucune valeur n'a donc pu être comparée en direct.

**Ce qui a néanmoins été vérifié** :
- Les deux constantes (454 €, 4 439 €) et leur mode d'application (plancher/pensionné, plafond/foyer) directement dans le texte de loi (CGI art. 158), pas seulement via BOFiP ou des sites tiers — source plus haute que le simulateur lui-même.
- 45 tests unitaires (`compute.test.ts`) couvrant : abattement quand seul le plancher joue, quand seul le 10% simple joue, quand seul le plafond joue (un pensionné), et quand le plafond est partagé entre deux pensionnés sans être doublé — tous passent avec des valeurs calculées à la main puis confirmées par `npm run test` (pas de constante devinée).
- La même architecture (lignes par déclarant, ligne agrégée « revenu imposable », intégration dans `computeQuotientFamilialTax`/`computeDecote`) a déjà été validée deux fois en direct contre ce même simulateur pour le chômage (incrément 5, `docs/updates/2025-verification-increment-5.md`), qui partage le mécanisme de contribution du conjoint (parts, quotient) — seul le calcul de l'abattement propre aux pensions est nouveau et n'a pas cette double confirmation externe.

**Action de suivi suggérée** : revérifier manuellement (dans un navigateur normal, hors automatisation) un cas plancher (pension modeste seule) et un cas plafond partagé (couple deux pensionnés à revenus élevés) sur le simulateur officiel, pour obtenir la confirmation externe qui manque à cet incrément.

**Conclusion** : le mécanisme est sourcé au niveau le plus fiable possible (texte de loi consulté directement) et testé unitairement de façon exhaustive, mais n'a pas la double vérification externe (simulateur) obtenue pour les incréments précédents. Vérifié le 2026-08-13.
