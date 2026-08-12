# 0002 — Vercel plutôt que GCP pour l'hébergement

## Contexte

Un compte Google Cloud Platform existe déjà. Question posée : est-ce que GCP remplace avantageusement Vercel pour héberger cette app Next.js ?

## Décision

Vercel, via intégration GitHub.

## Alternatives considérées

- **Firebase App Hosting** (le plus proche équivalent GCP/Firebase) : supporte Next.js avec intégration GitHub, mais demande plus de configuration manuelle/CLI que Vercel.
- **Firebase Hosting classique** : hébergement statique uniquement — ne supporte pas le rendu serveur Next.js sans passer par Cloud Run en complément.
- **Cloud Run / App Engine (GCP brut)** : demande un Dockerfile et une config manuelle du build Next.js. Aucun avantage concret ici puisque l'app n'a pas besoin d'autres services GCP (pas de backend, pas de base de données).

## Conséquences

- Zéro configuration d'infrastructure : déploiement auto sur push `main`, preview URL par PR, HTTPS natif.
- Le compte GCP reste disponible pour un futur projet qui aurait réellement besoin de services Google (base de données, auth...).
- Free tier Vercel largement suffisant pour ce projet (pas de backend, trafic personnel).
