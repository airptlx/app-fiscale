import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatEuros } from "@/lib/format";
import type { DeclarationLine } from "@/lib/tax-rules/types";

const CATEGORY_ORDER = ["revenus", "abattements", "impot"] as const;

const CATEGORY_LABELS: Record<DeclarationLine["category"], string> = {
  revenus: "Revenus déclarés",
  abattements: "Abattements appliqués automatiquement",
  impot: "Calcul de l'impôt",
};

export function ResultLines({ lines }: { lines: DeclarationLine[] }) {
  const groups = CATEGORY_ORDER.map((category) => ({
    category,
    lines: lines.filter((line) => line.category === category),
  })).filter((group) => group.lines.length > 0);

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group, index) => (
        <section key={group.category} className="flex flex-col gap-3">
          {index > 0 && <Separator className="mb-3" />}
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {CATEGORY_LABELS[group.category]}
          </h2>
          <div className="flex flex-col gap-3">
            {group.lines.map((line, lineIndex) => (
              <Card key={lineIndex}>
                <CardHeader>
                  <CardTitle className="flex items-baseline justify-between gap-2">
                    <span>
                      {line.code && (
                        <span className="mr-2 rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                          {line.code}
                        </span>
                      )}
                      {line.label}
                    </span>
                    <span className="shrink-0 font-mono text-lg tabular-nums">{formatEuros(line.value)}</span>
                  </CardTitle>
                  <CardDescription>{line.explanation}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
