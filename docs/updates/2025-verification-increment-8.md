# Vérification — Incrément 8 (revenus indépendants, régime micro-entreprise, cases 5KO/5KP/5HQ)

## Sources légales primaires

Les articles 50-0 (micro-BIC) et 102 ter (micro-BNC) du Code général des impôts ont été consultés directement sur Légifrance :

> « Le bénéfice imposable des contribuables qui perçoivent des revenus non commerciaux [...] n'excède pas 83 600 € est égal au montant brut des recettes annuelles diminué d'un abattement forfaitaire de 34 %. Cet abattement ne peut être inférieur à 305 €. »
> — [Article 102 ter, Code général des impôts](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000047622381), consulté le 2026-08-13.

> « [...] un abattement de 71 % [...] de 50 % [...] Ces abattements ne peuvent être inférieurs à 305 €. »
> — [Article 50-0, Code général des impôts](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042159220), consulté le 2026-08-13.

**Point d'attention méthodologique important** : Légifrance affiche la version actuellement en vigueur de ces articles, qui indique déjà les seuils revalorisés pour les revenus 2026-2028 (203 100€ / 83 600€). Ce module concerne les revenus **2025**, pour lesquels les seuils applicables sont 188 700€ (vente) et 77 700€ (service/libérale) — confirmés par une page dédiée et datée d'impots.gouv.fr :

> « 188 700 € pour les activités de vente de marchandises [...] et 77 700 € pour les prestations de services relevant [...] BIC [...] ou [...] BNC. »
> — [impots.gouv.fr — seuils micro-entrepreneur](https://www.impots.gouv.fr/professionnel/questions/pour-rester-micro-entrepreneur-quel-montant-de-chiffre-daffaires-ou-de), consulté le 2026-08-13 (page précise explicitement « pour les années 2023 à 2025 »).

Les taux d'abattement (71%/50%/34%) et le plancher (305€), eux, n'ont pas changé entre les deux périodes — seuls les seuils de chiffre d'affaires sont revalorisés triennalement.

## Codes de case (formulaire 2042-C-PRO)

Les codes 5KO/5LO (vente), 5KP/5LP (service BIC), 5HQ/5IQ (libérale BNC) — régime sans versement libératoire — ont été confirmés par deux sources indépendantes concordantes (un tutoriel dédié au formulaire 2042-C-PRO 2026, et une page distincte sur la déclaration auto-entrepreneur). Le versement libératoire (mécanisme optionnel, cases 5TA/5TB/5TE) n'est pas couvert par cet outil.

## Dénominateur du taux de prélèvement à la source

BOFiP BOI-IR-PAS-20-20-10 confirme explicitement que les revenus BIC/BNC entrent au dénominateur de la formule du taux **avant** application de l'abattement :

> « [...] les revenus relevant de la catégorie des bénéfices industriels et commerciaux (BIC), bénéfices non commerciaux (BNC) et bénéfices agricoles (BA) sont retenus sans qu'il y ait lieu de retenir un montant après application éventuelle des abattements. »
> — [BOI-IR-PAS-20-20-10](https://bofip.impots.gouv.fr/bofip/11247-PGP.html/identifiant=BOI-IR-PAS-20-20-10-20240618), consulté le 2026-08-13.

C'est exactement le traitement déjà appliqué au foncier dans l'incrément 7 (chiffre d'affaires brut ajouté à `rawVous`/`rawConjoint`), désormais étendu à l'activité indépendante. Contrairement au foncier — revenu commun au foyer, non attribuable à vous/conjoint — l'activité indépendante est déclarée séparément par déclarant : elle s'intègre donc directement dans le calcul du taux individualisé sans nécessiter le repli « taux foyer uniquement + avertissement » utilisé pour le foncier.

## Vérification contre le simulateur officiel — non tentée

Les incréments 6 et 7 avaient déjà rencontré, à deux reprises, une impossibilité de soumettre le formulaire du [simulateur officiel DGFiP](https://simulateur-ir-ifi.impots.gouv.fr/) malgré plusieurs méthodes d'automatisation du navigateur. Conformément à la consigne d'éviter de s'enfoncer dans un problème déjà identifié comme bloquant, cette tentative n'a pas été renouvelée pour cet incrément.

**Ce qui a été vérifié à la place** :
- Taux d'abattement, plancher et seuils cités directement depuis le texte de loi (Légifrance) et une page datée impots.gouv.fr, avec la précaution méthodologique ci-dessus sur la période applicable.
- Dénominateur du taux de PAS sourcé directement dans BOFiP.
- Codes de case confirmés par deux sources indépendantes.
- De nouveaux tests unitaires (`compute.test.ts`) couvrant : les trois taux d'abattement, le plancher de 305€, le plafonnement de l'abattement au chiffre d'affaires lui-même, le dépassement de seuil (`UnsupportedSituationError`) et le comportement exact au seuil, ainsi qu'un couple avec deux activités différentes (vente + libérale) vérifiant que le taux de PAS individualisé reste calculé normalement — tous passent, avec la suite `navigation.test.ts` mise à jour pour les nouvelles questions (`npm run test`, 148 tests au total).

**Action de suivi suggérée** : revérifier manuellement (navigateur normal, hors automatisation) un cas simple — ex. célibataire, salaire 20 000€ + activité de vente CA 10 000€ — sur le simulateur officiel, pour obtenir la confirmation externe qui manque à cet incrément.

**Conclusion** : mécanisme sourcé au niveau le plus fiable possible (textes de loi consultés directement, BOFiP pour le PAS) et testé unitairement de façon exhaustive, mais sans la double vérification externe (soumission complète du simulateur) obtenue pour les incréments 2, 4 et 5. Vérifié le 2026-08-13.
