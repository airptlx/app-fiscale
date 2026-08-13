import type { Metadata } from "next";
import { ClearDataButton } from "@/components/clear-data-button";

export const metadata: Metadata = {
  title: "À propos",
};

export default function AProposPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10">
      <h1 className="font-heading text-3xl font-black tracking-tight">À propos et avertissement</h1>

      <div className="flex flex-col gap-4 text-sm leading-relaxed text-card-foreground">
        <p>
          décla t&apos;aide à comprendre ce que tu dois inscrire sur ta déclaration de revenus
          française, en te posant des questions simples plutôt qu&apos;en te demandant de
          connaître le vocabulaire administratif.
        </p>
        <p>
          <strong>Ce n&apos;est pas un service certifié.</strong> Les calculs se basent sur les
          règles fiscales officielles (Code général des impôts, BOFiP) en vigueur pour les revenus
          2025, mais ce document ne constitue pas une déclaration et n&apos;engage pas
          l&apos;administration fiscale. Vérifie toujours tes réponses sur{" "}
          <a href="https://www.impots.gouv.fr" className="underline underline-offset-2">
            impots.gouv.fr
          </a>{" "}
          ou auprès d&apos;un professionnel avant de déclarer réellement.
        </p>
        <p>
          Sont actuellement prises en charge : une personne célibataire sans personne à charge, ou
          un couple marié/pacsé avec ou sans enfants à charge, avec un ou deux salaires et,
          éventuellement, des allocations chômage (France Travail), une pension de retraite, des
          revenus fonciers (location non meublée, jusqu&apos;à 15 000€ de loyers bruts par an pour
          le foyer) et/ou une activité de micro-entrepreneur (auto-entrepreneur, une seule activité
          par déclarant : vente de marchandises, prestation de service ou activité libérale).
          Les situations de parent isolé, divorce, veuvage ou union libre avec garde partagée, les
          revenus fonciers au-delà de ce seuil, ainsi que les revenus d&apos;indépendants au régime
          réel ou avec un chiffre d&apos;affaires dépassant le seuil du régime micro-entreprise, ne
          sont pas encore pris en charge. D&apos;autres situations arrivent progressivement.
        </p>
        <p>
          <strong>Confidentialité :</strong> cette application fonctionne entièrement dans ton
          navigateur. Il n&apos;y a pas de serveur, pas de compte, aucune donnée n&apos;est
          envoyée où que ce soit. Tes réponses sont uniquement conservées sur cet appareil
          (stockage local du navigateur), pour te permettre de reprendre là où tu t&apos;étais
          arrêté·e.
        </p>
      </div>

      <ClearDataButton />
    </main>
  );
}
