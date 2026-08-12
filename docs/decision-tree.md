# Logique du questionnaire

## Principe

Le questionnaire pose des questions **en langage courant uniquement** — jamais de jargon fiscal (cf. `SPEC.md` et `CLAUDE.md` règle n°2). Chaque réponse sert à déduire en interne quelles règles/lignes fiscales s'appliquent ; l'utilisateur n'a jamais besoin de connaître le vocabulaire administratif pour répondre correctement.

Le mapping technique (code de case, régime fiscal applicable) reste invisible jusqu'à l'écran de résultat, où il est affiché avec une explication en clair à côté de chaque terme technique.

## Sections prévues (v1)

1. **Situation familiale** — implémentée (incrément 4) : célibataire / marié-pacsé / autre (cul-de-sac non supporté), puis nombre d'enfants à charge pour un couple (`src/lib/tax-rules/2025/questions.ts` : `situation-conjugale`, `nombre-enfants-a-charge`). Le célibataire avec enfant(s) — régime « parent isolé » — n'est volontairement pas encore couvert : voir plan incrément 4, décision n°1.
2. **Revenus** — implémentée (incréments 2, 4, 5 et 6) : salaire, un ou deux employeurs (vous / conjoint·e), fiche de paie disponible ou salaire brut estimé pour chacun (`fiche-paie-disponible[-conjoint]`, `salaire-net-imposable-2025[-conjoint]`, `salaire-brut-annuel-2025[-conjoint]`) ; allocations chômage (`chomage[-conjoint]`, `montant-chomage-2025[-conjoint]`) ; pensions de retraite (`pension[-conjoint]`, `montant-pension-2025[-conjoint]`) — toutes deux posées indépendamment du salaire pour chaque déclarant, un conjoint pouvant être uniquement chômeur ou retraité (incrément 5, décision n°2 ; incrément 6, décision n°3).
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
