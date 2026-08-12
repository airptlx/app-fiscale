# 0003 — Web responsive / PWA plutôt qu'app native

## Contexte

Besoin exprimé : une app utilisable sur web et mobile. Pour un premier projet, la complexité de chaque approche compte autant que le résultat final.

## Décision

Une seule web app responsive, installable en PWA (manifest + service worker). Pas d'app native (React Native/Expo), pas de publication sur les stores.

## Alternatives considérées

- **App native cross-platform (React Native/Expo)** : vraie présence sur les stores, mais double la complexité technique (toolchain mobile, comptes développeur Apple/Google, review des stores) pour un premier projet — écarté pour l'instant.
- **Deux codebases séparées (web + natif)** : complexité et duplication non justifiées vu l'absence de besoin natif spécifique (pas de notifications push critiques, pas d'accès matériel avancé).

## Conséquences

- Un seul code à maintenir, un seul pipeline de déploiement (Vercel).
- Installable sur mobile via le navigateur (icône, plein écran, fonctionnement hors-ligne partiel via Serwist) sans passer par un store.
- Si le besoin d'une vraie app native se confirme plus tard, ce sera un projet distinct plutôt qu'une réécriture de celui-ci.
