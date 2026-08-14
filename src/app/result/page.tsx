"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { ResultConseils } from "@/components/questionnaire/result-conseils";
import { ResultLines } from "@/components/questionnaire/result-lines";
import { ResultRecapCases } from "@/components/questionnaire/result-recap-cases";
import { ResultTauxPAS } from "@/components/questionnaire/result-taux-pas";
import { ResultWarnings } from "@/components/questionnaire/result-warnings";
import { UnsupportedSituation } from "@/components/questionnaire/unsupported-situation";
import { useQuestionnaire } from "@/hooks/use-questionnaire";
import { UnsupportedSituationError } from "@/lib/tax-rules/errors";
import { CURRENT_TAX_YEAR, getTaxYearModule } from "@/lib/tax-rules/registry";
import type { DeclarationResult } from "@/lib/tax-rules/types";

const taxYearModule = getTaxYearModule(CURRENT_TAX_YEAR);

export default function ResultPage() {
  const router = useRouter();
  const { answers, isHydrated, reset } = useQuestionnaire(taxYearModule.questions);

  const hasAnswers = Object.keys(answers).length > 0;

  useEffect(() => {
    if (isHydrated && !hasAnswers) {
      router.replace("/");
    }
  }, [isHydrated, hasAnswers, router]);

  if (!isHydrated || !hasAnswers) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 items-center justify-center px-6 py-10">
        <p role="status">Chargement de ton résultat…</p>
      </main>
    );
  }

  let result: DeclarationResult | undefined;
  let unsupportedMessage: string | undefined;
  try {
    result = taxYearModule.computeDeclaration(answers);
  } catch (e) {
    if (e instanceof UnsupportedSituationError) {
      unsupportedMessage = e.message;
    } else {
      throw e;
    }
  }

  const handleRestart = () => {
    reset();
    router.push("/");
  };

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10">
      <h1 className="font-heading text-3xl font-black tracking-tight">Ton résultat</h1>

      {unsupportedMessage ? (
        <UnsupportedSituation message={unsupportedMessage} onRestart={handleRestart} />
      ) : (
        result && (
          <>
            <Tabs defaultValue="detail">
              <TabsList>
                <TabsTab value="detail">Détail</TabsTab>
                <TabsTab value="cases">Cases à vérifier</TabsTab>
                {result.conseils && <TabsTab value="conseils">Conseils</TabsTab>}
              </TabsList>
              <TabsPanel value="detail" className="flex flex-col gap-6">
                <ResultLines lines={result.lines} />
                <ResultTauxPAS taux={result.tauxPrelevementSource} />
                {result.warnings && <ResultWarnings warnings={result.warnings} />}
              </TabsPanel>
              <TabsPanel value="cases">
                <ResultRecapCases lines={result.lines} />
              </TabsPanel>
              {result.conseils && (
                <TabsPanel value="conseils">
                  <ResultConseils conseils={result.conseils} />
                </TabsPanel>
              )}
            </Tabs>
            <Button onClick={handleRestart} variant="outline" className="self-start">
              Recommencer
            </Button>
          </>
        )
      )}
    </main>
  );
}
