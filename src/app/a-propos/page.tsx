import type { Metadata } from "next";
import { ClearDataButton } from "@/components/clear-data-button";

export const metadata: Metadata = {
  title: "À propos — Assistant Déclaration d'Impôts",
};

export default function AProposPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">À propos et avertissement</h1>

      <div className="flex flex-col gap-4 text-sm leading-relaxed text-card-foreground">
        <p>
          Cet outil vous aide à comprendre ce que vous devez inscrire sur votre déclaration de
          revenus française, en répondant à des questions simples plutôt qu&apos;en vous
          demandant de connaître le vocabulaire administratif.
        </p>
        <p>
          <strong>Ce n&apos;est pas un service certifié.</strong> Les calculs se basent sur les
          règles fiscales officielles (Code général des impôts, BOFiP) en vigueur pour les revenus
          2025, mais ce document ne constitue pas une déclaration et n&apos;engage pas
          l&apos;administration fiscale. Vérifiez toujours vos réponses sur{" "}
          <a href="https://www.impots.gouv.fr" className="underline underline-offset-2">
            impots.gouv.fr
          </a>{" "}
          ou auprès d&apos;un professionnel avant de déclarer réellement.
        </p>
        <p>
          Sont actuellement prises en charge : une personne célibataire sans personne à charge, ou
          un couple marié/pacsé avec ou sans enfants à charge, avec un ou deux salaires (abattement
          forfaitaire de 10% chacun). Les situations de parent isolé, divorce, veuvage ou union
          libre avec garde partagée, ainsi que les autres types de revenus (chômage, retraite,
          revenus fonciers, indépendants), ne sont pas encore pris en charge. D&apos;autres
          situations seront ajoutées progressivement.
        </p>
        <p>
          <strong>Confidentialité :</strong> cette application fonctionne entièrement dans votre
          navigateur. Il n&apos;y a pas de serveur, pas de compte, aucune donnée n&apos;est
          envoyée où que ce soit. Vos réponses sont uniquement conservées sur cet appareil
          (stockage local du navigateur), pour vous permettre de reprendre là où vous vous étiez
          arrêté·e.
        </p>
      </div>

      <ClearDataButton />
    </main>
  );
}
