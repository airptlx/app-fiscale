# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Le format s'inspire de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
et ce projet suit le [Semantic Versioning](https://semver.org/lang/fr/).

## [Non publié]

### Ajouté

- Allocations chômage (France Travail), cases 1AP/1BP : soumises au même abattement forfaitaire de 10% que le salaire, dans le même pool par déclarant (BOFiP BOI-RSA-BASE-30-50-20) — pas un abattement séparé. Question posée indépendamment pour chaque déclarant : un conjoint peut avoir touché du chômage sans avoir de salaire à déclarer.
- Situations familiales couple (marié·e/pacsé·e) avec ou sans enfants à charge, et second salaire du/de la conjoint·e (lignes 1AJ/1BJ) : quotient familial (parts fiscales, CGI art. 194), plafonnement général de son avantage fiscal (CGI art. 197, I-2) et décote spécifique aux foyers en imposition commune, toutes sourcées officiellement (`src/lib/tax-rules/2025/`, cf. `docs/tax-rules-sources.md`). Le célibataire avec enfant(s) à charge (« parent isolé ») reste explicitement non supporté pour l'instant (`UnsupportedSituationError`) — cf. `SPEC.md` § Scope du MVP et plan incrément 4.
- Troisième option « autre situation » sur la question de situation conjugale (divorce, veuvage, union libre avec garde partagée...), pour ne pas mal classer un utilisateur dans un cas qui produirait un résultat inexact.
- Premier parcours utilisateur complet et navigable : accueil (avertissement + consentement), questionnaire pas-à-pas, écran de résultat, page « À propos » avec effacement des données (`/`, `/questionnaire`, `/result`, `/a-propos`).
- Persistance locale des réponses et du consentement (`localStorage`, jamais envoyé nulle part), avec reprise possible.
- Gestion du cas « situation non prise en charge » directement dans le moteur (`UnsupportedSituationError`).
- Accessibilité clavier/lecteur d'écran sur le questionnaire (focus géré, ARIA, soumission explicite).
- Moteur de règles fiscales pour le cas célibataire / un salaire / abattement 10% (revenus 2025) : barème progressif, décote, abattement forfaitaire, tous sourcés officiellement (`src/lib/tax-rules/2025/`, cf. `docs/tax-rules-sources.md`).
- Double chemin de saisie du salaire : net imposable exact (fiche de paie) ou brut annuel avec estimation heuristique (`src/lib/tax-rules/2025/estimation.ts`), pour anticiper une actualisation de taux de PAS avant réception de la fiche de paie de décembre.
- Scaffold initial du projet : Next.js 16 (App Router, TypeScript), Tailwind CSS v4, shadcn/ui.
- Support PWA (Serwist : service worker + manifest natif Next.js).
- Configuration des tests (Vitest, React Testing Library).
- Documentation de départ : `README.md`, `SPEC.md`, `CLAUDE.md`, `docs/`.

### Modifié

- Clé de stockage local des réponses passée en `appfiscale.answers.2025.v2` : la première question du questionnaire change de nature (bouléen → choix multiple), un ancien état sauvegardé ne correspond plus à aucune question actuelle.

### Corrigé

- `RadioGroup` (question à choix unique) passait de non contrôlé à contrôlé au premier clic (avertissement React/Base UI), latent depuis l'incrément 3 mais jamais déclenché faute de question `single-choice` avant `situation-conjugale` — `value` du groupe toujours défini dès le montage (`src/components/questionnaire/question-form.tsx`).
- Texte statique de `/a-propos` toujours limité au cas célibataire (incrément 2/3), oublié lors de l'élargissement du moteur — mis à jour pour refléter le périmètre réellement supporté.
- Suppression du composant `RegisterPWA` (enregistrement manuel du service worker), redondant avec l'enregistrement automatique déjà fait par `@serwist/next` (option `register`, vraie par défaut) — la double tentative provoquait une erreur console "Cannot re-register a Serwist instance", découverte pendant la vérification manuelle du parcours.

## [0.1.0] - 2026-08-12

Première version déployée : scaffold vide validé de bout en bout (build, tests, déploiement Vercel).

Live : https://app-fiscale.vercel.app/
