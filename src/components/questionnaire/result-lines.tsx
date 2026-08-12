import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEuros } from "@/lib/format";
import type { DeclarationLine } from "@/lib/tax-rules/types";

export function ResultLines({ lines }: { lines: DeclarationLine[] }) {
  return (
    <div className="flex flex-col gap-3">
      {lines.map((line, index) => (
        <Card key={index}>
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
              <span className="shrink-0 font-heading text-lg">{formatEuros(line.value)}</span>
            </CardTitle>
            <CardDescription>{line.explanation}</CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">Source : {line.source}</CardContent>
        </Card>
      ))}
    </div>
  );
}
