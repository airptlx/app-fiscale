# Logique du questionnaire

## Principe

Le questionnaire pose des questions **en langage courant uniquement** — jamais de jargon fiscal (cf. `SPEC.md` et `CLAUDE.md` règle n°2). Chaque réponse sert à déduire en interne quelles règles/lignes fiscales s'appliquent ; l'utilisateur n'a jamais besoin de connaître le vocabulaire administratif pour répondre correctement.

Le mapping technique (code de case, régime fiscal applicable) reste invisible jusqu'à l'écran de résultat, où il est affiché avec une explication en clair à côté de chaque terme technique.

## Sections prévues (v1)

1. **Situation familiale** — célibataire / marié-pacsé, enfants à charge.
2. **Revenus** — salaire(s), un ou deux employeurs.
3. **Frais professionnels** — question simple sur les frais non remboursés (détermine en interne abattement 10% vs frais réels).
4. **Prélèvement à la source** — situation actuelle, pour déterminer le taux à vérifier/déclarer.
5. **Crédits et déductions courants** — dons, garde d'enfants, emploi à domicile, PER (questions ciblées, une par dispositif).

## Exemple de traduction jargon → langage courant

| Jargon fiscal (jamais montré à l'utilisateur) | Question posée à la place |
|---|---|
| Abattement forfaitaire 10% vs frais réels | "Avez-vous des frais professionnels importants non remboursés par votre employeur (transport, matériel, repas) ?" |
| Quotient familial | "Combien de personnes sont à votre charge ?" (déjà couvert par la section Situation familiale) |
| Taux de PAS individualisé/personnalisé | "Voulez-vous que le taux de prélèvement tienne compte des revenus de votre conjoint, ou préférez-vous un taux propre à vos revenus uniquement ?" |

## Statut

Ce document sera complété au fur et à mesure de l'implémentation du graphe de questions (`src/lib/tax-rules/2025/questions.ts`), question par question, dans les prochains cycles de développement.
