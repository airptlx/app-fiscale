# Architecture

## Principe central

L'UI ne contient jamais de chiffre ni de règle fiscale. Tout vient de `src/lib/tax-rules/`, pour que la mise à jour annuelle du barème soit un changement de données uniquement, sans toucher au code UI.

## Questionnaire (arbre de décision)

Tableau ordonné de questions typées (pas un graphe générique — un questionnaire fiscal est surtout linéaire avec des sauts conditionnels) :

- `isVisible(answers)` : la question est-elle posée, selon les réponses précédentes ?
- `next(answers)` : override explicite de l'ordre par défaut, pour les vrais points de branchement.
- `prompt` : toujours en langage courant (cf. `docs/decision-tree.md` et `CLAUDE.md` règle n°2) — le mapping vers la règle/case fiscale reste interne.
- Modifier une réponse invalide et efface les réponses en aval (fonction pure, testable).

## Moteur de calcul

Fonction pure par année fiscale : `computeDeclaration(answers, year) → DeclarationResult`, composée de sous-fonctions pures (barème, quotient familial, déductions, crédits, taux de PAS).

```
src/lib/tax-rules/
  types.ts          # types partagés (Question, Answers, DeclarationLine, DeclarationResult)
  registry.ts        # année fiscale -> module
  2025/
    questions.ts  brackets.ts  deductions.ts  credits.ts  pas.ts  constants.ts
    compute.ts        # fonction pure, composée
    compute.test.ts   # tests colocalisés, valeurs de référence du simulateur officiel
```

Chaque constante est commentée avec sa source (impots.gouv.fr / BOFiP) et sa date de récupération — voir `docs/tax-rules-sources.md`.

## Routes

- **`/`** : pitch, avertissement légal complet, consentement obligatoire (case à cocher) avant d'accéder au questionnaire.
- **`/questionnaire`** : une question à la fois (`src/components/questionnaire/question-form.tsx`), état géré par `src/lib/questionnaire/reducer.ts` + persisté en `localStorage` (`src/lib/questionnaire/answers-storage.ts`) pour transiter vers `/result` sans backend ni paramètres d'URL.
- **`/result`** : résultat (`computeDeclaration`) ou message "situation non prise en charge" (`UnsupportedSituationError`, cf. `src/lib/tax-rules/errors.ts`).
- **`/a-propos`** : avertissement légal complet + effacement manuel des données locales.

Le consentement à l'avertissement (`src/lib/disclaimer/storage.ts`) est stocké séparément des réponses : cycle de vie différent (consentement légal, non effacé par "Recommencer").

## PWA

- Manifest natif Next.js : `src/app/manifest.ts`.
- Service worker : [Serwist](https://serwist.pages.dev) (`src/app/sw.ts`, injecté via `withSerwistInit` dans `next.config.ts`), enregistré côté client par `src/app/register-pwa.tsx`.
- Icônes générées dynamiquement (`src/app/icon.tsx`, via `next/og`) — placeholder à remplacer par une identité visuelle propre avant une release publique.

## Tests

- Moteur de règles : Vitest, cas de référence exacts (pas de snapshot) issus du simulateur officiel.
- Navigation du graphe de questions : tests purs.
- UI : couverture légère (React Testing Library) sur les scénarios représentatifs.

## Déploiement

Vercel, intégration GitHub (déploiement auto sur `main`, preview par PR). Voir `docs/decisions/0002-vercel-plutot-que-gcp.md` pour le choix vs GCP.

## Historique

Ce document reflète l'état courant de l'architecture. Les décisions structurantes et leur justification sont tracées individuellement dans `docs/decisions/`.
