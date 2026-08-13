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
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-3">
        <h1 className="font-heading text-4xl font-black tracking-tight text-balance">
          Ta déclaration, sans le jargon.
        </h1>
        <p className="text-lg text-muted-foreground">
          Réponds à quelques questions toutes simples — promis, zéro jargon — et on te dit
          exactement quoi écrire sur ta déclaration, et pourquoi.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-4 text-sm text-card-foreground">
        <h2 className="mb-2 font-semibold">Avant de commencer</h2>
        <p>
          On n&apos;est pas un service certifié, juste un outil qui t&apos;aide à y voir clair.
          Vérifie toujours tes réponses sur{" "}
          <a href="https://www.impots.gouv.fr" className="underline underline-offset-2">
            impots.gouv.fr
          </a>{" "}
          (ou avec un pro) avant d&apos;envoyer ta vraie déclaration. Et promis : rien de ce que tu
          tapes ne quitte ton navigateur — pas de serveur, pas de compte, pas de mouchard.
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
          {hasSavedAnswers ? "Je reprends" : "C'est parti"}
        </Button>
        <p id="disclaimer-hint" className="mt-2 text-sm text-muted-foreground">
          Coche la case ci-dessus pour continuer.
        </p>
      </div>
    </main>
  );
}
