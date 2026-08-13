import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPercent } from "@/lib/format";
import type { TauxPrelevementSource } from "@/lib/tax-rules/types";

export function ResultTauxPAS({ taux }: { taux: TauxPrelevementSource }) {
  const { foyer, vous, conjoint } = taux;

  if (vous !== undefined && conjoint !== undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-baseline justify-between gap-2">
            <span>Taux de prélèvement à la source (individualisé)</span>
          </CardTitle>
          <CardDescription className="flex flex-col gap-2">
            <span>
              Vous : <strong className="text-card-foreground">{formatPercent(vous)}</strong> — Conjoint·e :{" "}
              <strong className="text-card-foreground">{formatPercent(conjoint)}</strong>
            </span>
            <span>
              Depuis septembre 2025, ce taux individualisé (propre aux revenus de chacun·e)
              s&apos;applique par défaut aux couples. Vous pouvez toujours opter pour un taux foyer
              commun aux deux ({formatPercent(foyer)}) depuis votre espace sur impots.gouv.fr,
              rubrique « Gérer mon prélèvement à la source ». Vérifiez que le taux qui y est affiché
              correspond à l&apos;un de ces deux chiffres.
            </span>
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-baseline justify-between gap-2">
          <span>Taux de prélèvement à la source</span>
          <span className="shrink-0 font-heading text-lg">{formatPercent(foyer)}</span>
        </CardTitle>
        <CardDescription>
          C&apos;est le taux que votre employeur (ou France Travail, votre caisse de retraite) doit
          appliquer sur vos revenus chaque mois. Vérifiez qu&apos;il correspond à celui affiché dans
          votre espace sur impots.gouv.fr, rubrique « Gérer mon prélèvement à la source ».
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
