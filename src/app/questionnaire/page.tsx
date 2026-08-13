"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { QuestionnaireProgress } from "@/components/questionnaire/progress-indicator";
import { QuestionForm } from "@/components/questionnaire/question-form";
import { useDisclaimer } from "@/hooks/use-disclaimer";
import { useQuestionnaire } from "@/hooks/use-questionnaire";
import { getTaxYearModule, CURRENT_TAX_YEAR } from "@/lib/tax-rules/registry";

const { questions } = getTaxYearModule(CURRENT_TAX_YEAR);

export default function QuestionnairePage() {
  const router = useRouter();
  const disclaimer = useDisclaimer();
  const { answers, isHydrated, currentQuestion, isComplete, canGoBack, progress, answerCurrent, goBack } =
    useQuestionnaire(questions);

  useEffect(() => {
    if (disclaimer.isHydrated && !disclaimer.acknowledged) {
      router.replace("/");
    }
  }, [disclaimer.isHydrated, disclaimer.acknowledged, router]);

  useEffect(() => {
    if (isHydrated && isComplete) {
      router.replace("/result");
    }
  }, [isHydrated, isComplete, router]);

  if (!isHydrated || !disclaimer.isHydrated || !disclaimer.acknowledged || isComplete) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 items-center justify-center px-6 py-10">
        <p role="status">Chargement de ton questionnaire…</p>
      </main>
    );
  }

  if (!currentQuestion) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 items-center justify-center px-6 py-10">
        <p role="status">Chargement de ton questionnaire…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-10">
      <QuestionnaireProgress position={progress.position} total={progress.total} />
      <QuestionForm
        question={currentQuestion}
        value={answers[currentQuestion.id]}
        onSubmit={answerCurrent}
      />
      <Button type="button" variant="outline" onClick={goBack} disabled={!canGoBack} className="self-start">
        Précédent
      </Button>
    </main>
  );
}
