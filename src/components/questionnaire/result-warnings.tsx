import { Alert, AlertDescription } from "@/components/ui/alert";

export function ResultWarnings({ warnings }: { warnings: string[] }) {
  if (warnings.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-base font-semibold">Points de vigilance</h2>
      {warnings.map((warning, index) => (
        <Alert key={index}>
          <AlertDescription>{warning}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
