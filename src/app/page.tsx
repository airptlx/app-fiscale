"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useDisclaimer } from "@/hooks/use-disclaimer";
import { loadAnswers } from "@/lib/questionnaire/answers-storage";

export default function Home() {
  const router = useRouter();
  const disclaimer = useDisclaimer();
  const [hasSavedAnswers, setHasSavedAnswers] = useState(false);

  useEffect(() => {
    // Lecture unique de localStorage au montage (pas de mismatch SSR possible :
    // l'état initial est identique des deux côtés) — cf. plan incrément 3, décision n°2.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasSavedAnswers(Object.keys(loadAnswers()).length > 0);
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Assistant Déclaration d&apos;Impôts</h1>
        <p className="text-lg text-muted-foreground">
          Répondez à quelques questions simples, sans jargon fiscal, et obtenez une liste claire
          de ce qu&apos;il faut inscrire sur votre déclaration de revenus — et où.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-4 text-sm text-card-foreground">
        <h2 className="mb-2 font-semibold">Avertissement</h2>
        <p>
          Cet outil est informationnel et personnel. Ce n&apos;est pas un service certifié ni un
          substitut à un conseil professionnel. Vérifiez toujours vos réponses sur{" "}
          <a href="https://www.impots.gouv.fr" className="underline underline-offset-2">
            impots.gouv.fr
          </a>{" "}
          ou auprès d&apos;un professionnel avant de déclarer réellement. Aucune donnée que vous
          saisissez ne quitte votre navigateur : il n&apos;y a pas de serveur, pas de compte, pas
          de suivi.
        </p>
      </div>

      <div className="flex items-start gap-2">
        <Checkbox
          id="disclaimer-ack"
          checked={disclaimer.acknowledged}
          onCheckedChange={(checked) => disclaimer.acknowledge(checked === true)}
        />
        <Label htmlFor="disclaimer-ack" className="font-normal">
          J&apos;ai compris que cet outil est informationnel et ne remplace pas une vérification
          officielle.
        </Label>
      </div>

      <div>
        <Button
          disabled={!disclaimer.acknowledged}
          aria-describedby="disclaimer-hint"
          onClick={() => router.push("/questionnaire")}
        >
          {hasSavedAnswers ? "Reprendre" : "Commencer"}
        </Button>
        <p id="disclaimer-hint" className="mt-2 text-sm text-muted-foreground">
          Cochez la case ci-dessus pour continuer.
        </p>
      </div>
    </main>
  );
}
