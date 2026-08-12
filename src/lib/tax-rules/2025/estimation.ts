/**
 * ⚠️ HEURISTIQUE NON OFFICIELLE — à ne jamais confondre avec les constantes de
 * `constants.ts`, qui sont toutes des règles de loi exactes et sourcées.
 *
 * Il n'existe pas de taux légal unique de conversion salaire brut -> salaire net
 * imposable : l'écart réel dépend du statut (cadre/non-cadre) et des taux de
 * cotisations effectifs. Ce ratio est une moyenne couramment utilisée par les
 * calculateurs de paie, utilisée UNIQUEMENT quand l'utilisateur n'a pas sous les
 * yeux son "net imposable" exact (ex. anticipation d'une augmentation en cours
 * d'année, avant réception de la fiche de paie de décembre).
 *
 * Dérivation : net à payer ≈ 78% du brut (non-cadre) à 75% (cadre) ; net imposable
 * = net à payer + CSG non déductible (2,40%) + CRDS (0,50%) sur 98,25% du brut,
 * soit +≈2,85 points. Valeur médiane retenue : 80%.
 * Toute estimation produite à partir de ce ratio doit être accompagnée d'un
 * avertissement explicite dans le résultat (voir `resolveNetImposable` dans compute.ts).
 */
export const ESTIMATION_NET_IMPOSABLE_RATIO_2025 = 0.8;

export function estimateNetImposableFromBrut(brutAnnuel: number): number {
  if (brutAnnuel <= 0) return 0;
  return Math.round(brutAnnuel * ESTIMATION_NET_IMPOSABLE_RATIO_2025);
}
