import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Conseil } from "@/lib/tax-rules/types";

export function ResultConseils({ conseils }: { conseils: Conseil[] }) {
  if (conseils.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {conseils.map((conseil, index) => (
        <Alert key={index}>
          <AlertTitle>{conseil.title}</AlertTitle>
          <AlertDescription>{conseil.text}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
