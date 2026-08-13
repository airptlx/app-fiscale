import { Progress, ProgressLabel } from "@/components/ui/progress";

export function QuestionnaireProgress({
  position,
  total,
}: {
  position: number;
  total: number;
}) {
  const value = total > 0 ? (position / total) * 100 : 0;

  return (
    <Progress value={value} className="w-full">
      <ProgressLabel>Progression</ProgressLabel>
    </Progress>
  );
}
