import { Progress, ProgressLabel } from "@/components/ui/progress";

export function QuestionnaireProgress({
  position,
  total,
}: {
  position: number;
  total: number;
}) {
  // total === 1 signifie qu'on est sur la toute première question (rien d'autre
  // n'est encore visible tant qu'on n'a pas répondu) : on affiche une barre vide
  // plutôt que pleine, plutôt que de laisser croire que le parcours est terminé.
  const value = total > 1 ? (position / total) * 100 : 0;

  return (
    <Progress value={value} className="w-full">
      <ProgressLabel>Progression</ProgressLabel>
    </Progress>
  );
}
