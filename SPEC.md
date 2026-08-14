# Spec fonctionnelle — décla

## Problème et utilisateurs

Remplir sa déclaration de revenus française est intimidant : vocabulaire administratif, dizaines de cases, règles qui changent chaque année. Cette application aide un particulier à savoir **précisément quoi écrire, sur quelle ligne, et pourquoi**, sans avoir à connaître le jargon fiscal au préalable.

**Utilisateur cible (v1)** : salarié ou micro-entrepreneur, résident fiscal français, situation courante (pas de patrimoine complexe).

**Ce que l'app n'est pas** : un service de déclaration certifié ni un substitut à un conseil professionnel. C'est un outil informationnel personnel — voir la section Confidentialité & avertissement.

## Parcours utilisateur

1. Écran d'accueil : présentation courte + avertissement (acquittement requis avant de commencer).
2. Questionnaire pas-à-pas (une question à la fois, barre de progression, retour en arrière possible).
3. Écran de résultat : liste des lignes à remplir (code de case, libellé, valeur, explication, source), taux de PAS à déclarer, conseils/points de vigilance.

## Principe de conception : langage 100% grand public

Aucune question ne doit nécessiter de connaissance fiscale préalable pour y répondre. Le vocabulaire administratif (codes de case, termes légaux) n'apparaît que dans l'écran de résultat, à côté d'une explication en clair. Voir `docs/decision-tree.md` pour le détail du flow et `CLAUDE.md` règle n°2.

Exemple : au lieu de "Optez-vous pour l'abattement forfaitaire de 10% ou les frais réels ?", on pose "Avez-vous des frais professionnels importants non remboursés par votre employeur (transport, matériel, repas) ?".

## Scope du MVP (v1)

**Inclus :**
- Traitements et salaires, un ou deux revenus (couple), lignes 1AJ/1BJ.
- Allocations chômage (France Travail), un ou deux déclarants, lignes 1AP/1BP — soumises au même abattement de 10% que le salaire, dans le même pool par déclarant (BOI-RSA-BASE-30-50-20).
- Pensions de retraite, un ou deux déclarants, lignes 1AS/1BS — abattement de 10% distinct de celui du salaire/chômage, avec un plancher par pensionné (454€) mais un plafond commun à tout le foyer (4 439€, pas doublé pour un couple de deux pensionnés) (CGI art. 158, 5°, a).
- Frais professionnels : abattement de 10% appliqué par défaut au salaire/chômage. Sur l'écran de résultat, un simulateur interactif (montant estimé par l'utilisateur, non persisté) compare cette estimation à l'abattement déjà calculé, avec avertissement sur les limites de la comparaison (remboursements employeur, cotisations syndicales).
- Situation familiale : célibataire sans enfant, ou marié/pacsé avec ou sans enfants (quotient familial, plafonnement général, décote spécifique couple). Le régime « parent isolé » (célibataire avec enfant(s) à charge, demi-part majorée) est nuancé ci-dessous, en roadmap plutôt qu'en inclus direct.
- Revenus fonciers, régime micro-foncier (location non meublée, recettes brutes ≤ 15 000€/an pour le foyer), case 4BE — abattement forfaitaire de 30%, sans plancher (CGI art. 32). Au-delà du seuil, le régime réel s'applique obligatoirement (seuil apprécié année par année, sans tolérance pluriannuelle, BOI-RFPI-DECLA-10) : si le résultat net réel est déjà connu (déclaration 2044, comptable...), il peut être indiqué directement et reporté en case 4BA ; sinon l'écran non supporté reste affiché. Le déficit foncier n'est pas pris en charge (montant exigé positif ou nul).
- Revenus indépendants, régime micro-entreprise (micro-BIC/micro-BNC, une seule activité par déclarant), un ou deux déclarants — vente de marchandises (case 5KO/5LO, abattement 71%, seuil 188 700€/an), prestation de service (case 5KP/5LP, abattement 50%, seuil 77 700€/an) ou activité libérale (case 5HQ/5IQ, abattement 34%, seuil 77 700€/an), plancher d'abattement commun de 305€ (CGI art. 50-0 / 102 ter). Un dépassement isolé du seuil l'année déclarée ne fait pas sortir du régime micro (BOI-BIC-DECLA-10-10-10 §50, BOI-BNC-DECLA-20-10 §100) : le régime réel (BIC) ou la déclaration contrôlée (BNC) ne devient obligatoire qu'après un dépassement deux années consécutives, cas qui reste hors scope (`UnsupportedSituationError`). Le versement libératoire de l'impôt sur le revenu (mécanisme optionnel) n'est pas pris en charge.
- Taux de prélèvement à la source (PAS) : taux foyer et taux individualisé (défaut couples depuis le 01/09/2025), affichés sur l'écran de résultat avec explication (CGI art. 204 H). Le taux individualisé n'est pas calculé pour un couple ayant des revenus fonciers (revenu commun, formule non encore étendue aux revenus communs — seul le taux foyer est alors affiché, avec avertissement). La grille de taux neutre (cas d'un nouvel employeur sans taux encore transmis) répond à un besoin différent et n'est pas couverte.
- 3 à 5 crédits/déductions courants : dons, frais de garde d'enfants, emploi à domicile, versements PER.
- Conseil « comptes crypto à l'étranger » (obligation déclarative formulaire 3916-bis, CGI art. 1649 bis C) : purement informatif, aucun calcul de plus-value (formulaire 2086, hors scope).
- Revenus de capitaux mobiliers hors PEA : dividendes (case 2DC) et plus-values de cession de valeurs mobilières (case 3VG), au niveau du foyer (pas de distinction vous/conjoint — comme le foncier), imposés au prélèvement forfaitaire unique (PFU) à 30% par défaut (12,8% IR + 17,2% prélèvements sociaux, CGI art. 200 A), ligne séparée du barème progressif et du taux de prélèvement à la source. L'option pour le barème (case 2OP, abattement 40% dividendes) n'est pas prise en charge. Une moins-value nette (sans plus-value associée) n'est pas calculée.
- Conseil PEA (Plan d'Épargne en Actions) : si détenu plus de 5 ans sans retrait disqualifiant, rappel que les gains sont exonérés d'IR (rien à déclarer ici) ; sinon, conseil de prudence — le régime devient complexe et n'est pas calculé par cet outil (CGI art. 150-0 A, III-5).
- Écran de résultat, en onglets (Détail, catégorisé revenus/abattements/impôt / Vérification sur impots.gouv.fr / Conseils) : liste des lignes à remplir + explications + avertissement + conseils éventuels sur des démarches hors de cette déclaration.

**Roadmap « revenus annexes » (planifiée, incréments dédiés — voir plan incrément 4)** — chacun de ces points nécessite son propre cycle Plan Mode avant implémentation, distinct du cas traitements et salaires :
- Célibataire avec enfant(s) à charge (« parent isolé », demi-part majorée et plafond spécifique — distinct du cas couple+enfants, cf. `docs/tax-rules-sources.md`).

**Explicitement différé, hors roadmap actuelle :**
- Calcul du régime réel foncier ou du régime réel/déclaration contrôlée pour les indépendants (charges déductibles, amortissements, déficit foncier) — seul le cas où l'utilisateur a déjà ce résultat ailleurs est couvert pour le foncier (case 4BA), voir ci-dessus. Intérêts (livrets, obligations), option barème/2OP pour les revenus de capitaux mobiliers, PEA en dehors du cas simple (+5 ans sans retrait disqualifiant), plus-value crypto (formulaire 2086).
- Non-résidents / expatriés.
- Situations familiales complexes autres que parent isolé (garde alternée, rattachement d'enfants majeurs, veuvage).
- Dispositifs de défiscalisation niche (Pinel, etc.).

## Exigences non-fonctionnelles

- **PWA** : installable sur mobile et desktop, fonctionne hors-ligne une fois chargée (précache via Serwist), réponses persistées en `localStorage` (reprise possible).
- **Accessibilité** : cible WCAG AA — navigation clavier complète du questionnaire, contrastes suffisants, labels ARIA sur tous les composants interactifs.
- **Confidentialité (exigence de sécurité, pas une note en passant)** : aucune donnée utilisateur ne quitte le navigateur. Pas de backend, pas d'analytics tierce par défaut. Les réponses stockées en `localStorage` sont effaçables par l'utilisateur à tout moment.
- **Performance** : audit Lighthouse (PWA + performance) avant chaque mise en production d'une version.

## Avertissement légal (feature produit, pas une note de bas de page)

- Footer permanent sur chaque écran.
- Page dédiée "À propos / Avertissement".
- Acquittement explicite avant le premier lancement du questionnaire.

Contenu : outil informationnel personnel, pas un service certifié — à vérifier sur impots.gouv.fr ou auprès d'un professionnel avant toute déclaration réelle.

## Format de sortie (écran de résultat)

Chaque ligne de résultat contient : `code` (case officielle, ex. "1AJ"), `label`, `value` (valeur calculée), `explanation` (pourquoi, en clair), `source` (référence officielle). Voir `src/lib/tax-rules/types.ts` (`DeclarationLine`) une fois implémenté.

## Mise à jour annuelle

Le barème et les règles changent chaque année fiscale. Convention : `src/lib/tax-rules/YYYY/` = revenus perçus en année YYYY (déclarés en YYYY+1). Ajouter une nouvelle année = copier le dossier, mettre à jour les valeurs sourcées, enregistrer la comparaison avec le simulateur officiel dans `docs/updates/`.
