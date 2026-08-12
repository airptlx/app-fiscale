@AGENTS.md

# Conventions du projet — Assistant Déclaration d'Impôts

Voir `SPEC.md` pour la spec fonctionnelle et `docs/architecture.md` pour l'architecture détaillée.

## Règles non négociables

1. **Aucun chiffre ou règle fiscale dans l'UI.** Toute valeur fiscale (barème, plafond, taux, seuil) vit exclusivement sous `src/lib/tax-rules/<année>/`. Les composants ne font qu'afficher ce que la couche de données leur donne.
2. **Zéro jargon fiscal dans les questions posées à l'utilisateur.** Le `prompt` d'une question est en langage courant, jamais en vocabulaire administratif (pas de "abattement forfaitaire", "quotient familial", "case 1AJ"...). Le jargon et les codes de case n'apparaissent que sur l'écran de résultat, avec explication. Voir `docs/decision-tree.md`.
3. **Convention années fiscales** : un dossier `src/lib/tax-rules/YYYY/` correspond aux revenus perçus en année YYYY (déclarés l'année YYYY+1). Toujours préciser année de revenus vs année de déclaration dans les commentaires/docs.
4. **Chaque constante fiscale est sourcée** : commentaire avec URL officielle (impots.gouv.fr, BOFiP, service-public.fr) + date de récupération. Voir `docs/tax-rules-sources.md`.
5. **Tests obligatoires sur le moteur de règles** (`src/lib/tax-rules/**`) : valeurs exactes de référence, pas de snapshot. Pas de merge sans tests passants.

## Workflow

- Chaque fonctionnalité non triviale passe par un cycle **Plan Mode** avant implémentation.
- Commits en **Conventional Commits** (`feat:`, `fix:`, `docs:`, `chore:`, `test:`...).
- Avant de merger une PR, cocher la checklist dans `.github/PULL_REQUEST_TEMPLATE.md` (tests, lint, typecheck, revue de langage des questions, `CHANGELOG.md` à jour).
- Décision d'architecture structurante ? Ajouter un ADR court dans `docs/decisions/`.

## Stack

Next.js 16 (App Router, TypeScript) · Tailwind CSS v4 · shadcn/ui · Serwist (PWA) · Vitest + React Testing Library · déploiement Vercel.

Next.js 16 a des changements par rapport aux versions antérieures (params/searchParams asynchrones partout, `proxy.ts` au lieu de `middleware.ts`, pas de service worker natif...). Voir `node_modules/next/dist/docs/01-app/01-getting-started/18-upgrading.md` en cas de doute plutôt que de se fier à des habitudes d'une version plus ancienne.
