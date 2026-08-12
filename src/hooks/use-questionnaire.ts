"use client";

import { useEffect, useReducer, useState } from "react";
import { loadAnswers, saveAnswers, clearAnswers } from "@/lib/questionnaire/answers-storage";
import { getPreviousQuestion, getProgress, isQuestionnaireComplete } from "@/lib/questionnaire/navigation";
import {
  initialQuestionnaireState,
  questionnaireReducer,
} from "@/lib/questionnaire/reducer";
import type { AnswerValue, Question } from "@/lib/tax-rules/types";

export function useQuestionnaire(questions: Question[]) {
  const [state, dispatch] = useReducer(questionnaireReducer, initialQuestionnaireState);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydratation post-montage : évite tout mismatch serveur/client (état initial
  // identique des deux côtés, cf. plan incrément 3, décision n°2).
  useEffect(() => {
    dispatch({ type: "HYDRATE", questions, answers: loadAnswers() });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isHydrated) saveAnswers(state.answers);
  }, [state.answers, isHydrated]);

  const currentQuestion = questions.find((q) => q.id === state.currentQuestionId);
  const canGoBack =
    state.currentQuestionId !== undefined &&
    getPreviousQuestion(questions, state.answers, state.currentQuestionId) !== undefined;

  return {
    answers: state.answers,
    isHydrated,
    currentQuestion,
    isComplete: isHydrated && isQuestionnaireComplete(questions, state.answers),
    canGoBack,
    progress: getProgress(questions, state.answers, state.currentQuestionId),
    answerCurrent: (value: AnswerValue) => {
      if (state.currentQuestionId === undefined) return;
      dispatch({ type: "ANSWER", questions, questionId: state.currentQuestionId, value });
    },
    goBack: () => dispatch({ type: "BACK", questions }),
    reset: () => {
      dispatch({ type: "RESET" });
      clearAnswers();
    },
  };
}
