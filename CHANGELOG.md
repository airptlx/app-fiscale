# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Le format s'inspire de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
et ce projet suit le [Semantic Versioning](https://semver.org/lang/fr/).

## [Non publié]

### Ajouté

- Moteur de règles fiscales pour le cas célibataire / un salaire / abattement 10% (revenus 2025) : barème progressif, décote, abattement forfaitaire, tous sourcés officiellement (`src/lib/tax-rules/2025/`, cf. `docs/tax-rules-sources.md`).
- Double chemin de saisie du salaire : net imposable exact (fiche de paie) ou brut annuel avec estimation heuristique (`src/lib/tax-rules/2025/estimation.ts`), pour anticiper une actualisation de taux de PAS avant réception de la fiche de paie de décembre.
- Scaffold initial du projet : Next.js 16 (App Router, TypeScript), Tailwind CSS v4, shadcn/ui.
- Support PWA (Serwist : service worker + manifest natif Next.js).
- Configuration des tests (Vitest, React Testing Library).
- Documentation de départ : `README.md`, `SPEC.md`, `CLAUDE.md`, `docs/`.

## [0.1.0] - 2026-08-12

Première version déployée : scaffold vide validé de bout en bout (build, tests, déploiement Vercel).

Live : https://app-fiscale.vercel.app/
