# Spec fonctionnelle — Assistant Déclaration d'Impôts

## Problème et utilisateurs

Remplir sa déclaration de revenus française est intimidant : vocabulaire administratif, dizaines de cases, règles qui changent chaque année. Cette application aide un particulier à savoir **précisément quoi écrire, sur quelle ligne, et pourquoi**, sans avoir à connaître le jargon fiscal au préalable.

**Utilisateur cible (v1)** : salarié, résident fiscal français, situation courante (single income source, pas d'indépendant, pas de patrimoine complexe).

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
- Frais professionnels : abattement 10% vs frais réels (question simple, calcul automatique du régime le plus avantageux).
- Situation familiale : célibataire sans enfant, ou marié/pacsé avec ou sans enfants (quotient familial, plafonnement général, décote spécifique couple). Le régime « parent isolé » (célibataire avec enfant(s) à charge, demi-part majorée) est nuancé ci-dessous, en roadmap plutôt qu'en inclus direct.
- Taux de prélèvement à la source (PAS) : individualisé, personnalisé, neutre — explication du choix et grille de taux neutre.
- 3 à 5 crédits/déductions courants : dons, frais de garde d'enfants, emploi à domicile, versements PER.
- Écran de résultat : liste des lignes à remplir + explications + avertissement.

**Roadmap « revenus annexes » (planifiée, incréments dédiés — voir plan incrément 4)** — chacun de ces points nécessite son propre cycle Plan Mode avant implémentation, distinct du cas traitements et salaires :
- Allocations chômage (case 1AP).
- Pensions de retraite (case 1AS).
- Revenus fonciers (micro-foncier vs réel).
- Revenus indépendants (micro-BIC/micro-BNC).
- Célibataire avec enfant(s) à charge (« parent isolé », demi-part majorée et plafond spécifique — distinct du cas couple+enfants, cf. `docs/tax-rules-sources.md`).

**Explicitement différé, hors roadmap actuelle :**
- Indépendants au régime réel (au-delà du micro-BIC/micro-BNC planifié ci-dessus), plus-values, revenus de capitaux mobiliers.
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
