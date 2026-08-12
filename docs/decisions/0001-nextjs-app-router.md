# 0001 — Next.js (App Router) + TypeScript comme framework

## Contexte

Premier projet web, développé avec l'assistance de Claude Code. Besoin d'un framework qui minimise les erreurs générées par l'IA et qui permette un déploiement simple.

## Décision

Next.js 16 (App Router) + TypeScript, scaffoldé via `create-next-app`.

## Alternatives considérées

- **Vite + React (SPA pure)** : plus simple à comprendre au départ, mais pas de convention de routing/structure imposée — plus de décisions à prendre soi-même, et moins bien représenté dans les données d'entraînement des assistants IA que Next.js.
- **Remix / SvelteKit** : viables techniquement mais moins représentés dans les données d'entraînement IA → plus de risque d'erreurs générées.

## Conséquences

- `create-next-app` fournit TypeScript, ESLint, Tailwind en une commande.
- Manifest PWA natif disponible (`app/manifest.ts`), mais pas de service worker intégré → nécessite Serwist (voir ADR 0003... à venir si besoin d'un ADR dédié, sinon voir `docs/architecture.md`).
- Déploiement trivial sur Vercel (créateurs de Next.js).
