"use client";

import { useId, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatEuros } from "@/lib/format";
import type { AbattementForfaitaire, DeclarationResult } from "@/lib/tax-rules/types";

export function FraisReelsSimulator({
  comparaison,
}: {
  comparaison: DeclarationResult["fraisReelsComparaison"];
}) {
  if (!comparaison || (!comparaison.vous && !comparaison.conjoint)) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Frais réels ou abattement de 10% ?</CardTitle>
        <CardDescription>
          Par défaut, cette déclaration applique l&apos;abattement forfaitaire de 10% à tes revenus.
          Si tes frais professionnels réels (transport, repas, matériel...) dépassent ce montant, tu
          peux déclarer leur total à la place. Estime-les ci-dessous pour voir si ça t&apos;avantage —
          cette estimation n&apos;est pas enregistrée dans ta déclaration.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {comparaison.vous && <DeclarantSimulateur label="Toi" abattement={comparaison.vous} />}
        {comparaison.conjoint && (
          <DeclarantSimulateur label="Ton/ta conjoint·e" abattement={comparaison.conjoint} />
        )}
        <Alert>
          <AlertTitle>Exemples de frais réels pouvant être comptés</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4">
              <li>Trajets domicile-travail (essence, transports en commun, usure du véhicule)</li>
              <li>Repas pris sur le lieu de travail, au-delà de la participation de l&apos;employeur</li>
              <li>Télétravail : matériel informatique, part du loyer et de l&apos;électricité</li>
              <li>Matériel, outillage ou vêtements professionnels</li>
              <li>Formation professionnelle non prise en charge par l&apos;employeur</li>
              <li>Cotisations syndicales</li>
            </ul>
          </AlertDescription>
        </Alert>
        <Alert>
          <AlertTitle>Avant de basculer sur l&apos;option réelle</AlertTitle>
          <AlertDescription>
            Si ton employeur te rembourse déjà une partie de ces frais (notes de frais, indemnités),
            ce remboursement redevient imposable si tu optes pour les frais réels — ce que cette
            estimation ne recalcule pas. Les cotisations syndicales suivent aussi une règle à part
            (déductibles en frais réels, mais tu perds alors le crédit d&apos;impôt qui leur est
            dédié). Le montant total se déclare en case 1AK (1BK pour un 2e déclarant), sans le
            soustraire de ton salaire. Vérifie ton cas sur le simulateur officiel impots.gouv.fr ou
            auprès d&apos;un professionnel avant de faire ce choix dans ta vraie déclaration.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

function DeclarantSimulateur({
  label,
  abattement,
}: {
  label: string;
  abattement: AbattementForfaitaire;
}) {
  const inputId = useId();
  const [raw, setRaw] = useState("");
  const estimation = raw.trim() === "" ? undefined : Number(raw);
  const hasEstimation = estimation !== undefined && !Number.isNaN(estimation);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm">
        {label} : abattement automatique de 10% actuellement appliqué —{" "}
        <strong className="font-mono tabular-nums">{formatEuros(abattement.abattementActuel)}</strong>
      </p>
      <Label htmlFor={inputId}>{label} : frais professionnels réels estimés sur l&apos;année</Label>
      <Input
        id={inputId}
        type="number"
        inputMode="decimal"
        min={0}
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        className="max-w-xs"
      />
      {hasEstimation && (
        <p className="text-sm text-muted-foreground">
          {estimation > abattement.abattementActuel ? (
            <>
              Tes frais réels estimés ({formatEuros(estimation)}) dépasseraient ton abattement actuel
              de 10% ({formatEuros(abattement.abattementActuel)}) de{" "}
              <strong className="text-card-foreground">
                {formatEuros(estimation - abattement.abattementActuel)}
              </strong>
              .
            </>
          ) : (
            <>
              Ton abattement de 10% ({formatEuros(abattement.abattementActuel)}) reste plus avantageux
              que cette estimation ({formatEuros(estimation)}).
            </>
          )}
        </p>
      )}
    </div>
  );
}
