import { formatEuros } from "@/lib/format";
import type { DeclarationLine } from "@/lib/tax-rules/types";

export function ResultRecapCases({ lines }: { lines: DeclarationLine[] }) {
  const cases = lines.filter((line): line is DeclarationLine & { code: string } =>
    Boolean(line.code),
  );

  if (cases.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Garde ce récapitulatif sous les yeux pendant que tu remplis ta déclaration réelle sur
        impots.gouv.fr, et vérifie que chaque case correspond.
      </p>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="px-4 py-2 font-medium">Case</th>
              <th className="px-4 py-2 font-medium">Ce que ça représente</th>
              <th className="px-4 py-2 text-right font-medium">Montant</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((line, index) => (
              <tr key={index} className="border-b last:border-0">
                <td className="px-4 py-2">
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                    {line.code}
                  </span>
                </td>
                <td className="px-4 py-2">{line.label}</td>
                <td className="px-4 py-2 text-right font-mono tabular-nums">{formatEuros(line.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
