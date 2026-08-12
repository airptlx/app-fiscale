# Assistant Déclaration d'Impôts

Un questionnaire simple, sans jargon fiscal, pour savoir précisément quoi remplir sur sa déclaration de revenus française : lignes à compléter, taux de prélèvement à la source, crédits et déductions à ne pas manquer.

> ⚠️ **Avertissement** : ceci est un outil informationnel personnel, pas un service certifié. Vérifiez toujours vos réponses sur [impots.gouv.fr](https://www.impots.gouv.fr) ou auprès d'un professionnel avant de déclarer.

## Stack

Next.js 16 (App Router, TypeScript) · Tailwind CSS v4 · shadcn/ui · [Serwist](https://serwist.pages.dev) (PWA) · Vitest + React Testing Library · Vercel.

## Démarrer en local

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Scripts

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run lint` | ESLint |
| `npm run typecheck` | Vérification TypeScript |
| `npm run test` | Tests (Vitest) |

## Documentation

- [`SPEC.md`](./SPEC.md) — spec fonctionnelle, scope MVP, exigences non-fonctionnelles.
- [`CLAUDE.md`](./CLAUDE.md) — conventions de développement du projet.
- [`docs/architecture.md`](./docs/architecture.md) — architecture technique détaillée.
- [`docs/decision-tree.md`](./docs/decision-tree.md) — logique du questionnaire.
- [`docs/tax-rules-sources.md`](./docs/tax-rules-sources.md) — sources officielles des règles fiscales utilisées.
- [`docs/decisions/`](./docs/decisions/) — historique des décisions d'architecture (ADR).

## Licence

[MIT](./LICENSE)
