# 0004 — Webpack plutôt que Turbopack (build/dev)

## Contexte

Next.js 16 active Turbopack par défaut pour `next dev` et `next build`. Serwist (service worker PWA, cf. ADR 0001/0003) injecte sa configuration via une config webpack (`withSerwistInit`), qui n'est pas supportée par Turbopack : le build échoue (`This build is using Turbopack, with a webpack config and no turbopack config`).

## Décision

Scripts `dev`/`build` explicitement en webpack (`next dev --webpack`, `next build --webpack`) plutôt que Turbopack.

## Alternatives considérées

- **`@serwist/turbopack`** : support expérimental de Turbopack pour Serwist. Écarté pour l'instant — "expérimental" est un risque non justifié pour un outil qui doit être fiable (données fiscales), à reconsidérer une fois stabilisé.
- **`turbopack: {}` vide dans `next.config.ts`** : supprime juste l'erreur sans faire fonctionner Serwist sous Turbopack — le service worker ne serait pas généré correctement. Écarté.

## Conséquences

- Build/dev légèrement plus lents qu'avec Turbopack (différence peu sensible sur un projet de cette taille).
- À revisiter si `@serwist/turbopack` sort de l'expérimental, ou si Serwist ajoute un support Turbopack stable (suivre https://github.com/serwist/serwist/issues/54).
