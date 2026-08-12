import type { AnswerValue, Answers, Question, QuestionId } from "../tax-rules/types";

export function getVisibleQuestions(questions: Question[], answers: Answers): Question[] {
  return questions.filter((q) => q.isVisible?.(answers) ?? true);
}

export function getNextQuestion(
  questions: Question[],
  answers: Answers,
): Question | undefined {
  return getVisibleQuestions(questions, answers).find((q) => answers[q.id] === undefined);
}

export function getPreviousQuestion(
  questions: Question[],
  answers: Answers,
  currentId: QuestionId,
): Question | undefined {
  const visible = getVisibleQuestions(questions, answers);
  const index = visible.findIndex((q) => q.id === currentId);
  if (index <= 0) return undefined;
  return visible[index - 1];
}

export function isQuestionnaireComplete(questions: Question[], answers: Answers): boolean {
  const visible = getVisibleQuestions(questions, answers);
  return visible.length > 0 && getNextQuestion(questions, answers) === undefined;
}

/**
 * Applique une réponse et efface les réponses en aval devenues invalides
 * (docs/architecture.md : "Modifier une réponse invalide et efface les
 * réponses en aval"). Un seul passage suffit : les prédicats `isVisible` de ce
 * projet ne lisent que des valeurs brutes de `answers`, jamais "cette autre
 * question est-elle visible" — donc filtrer une fois contre `updated` est
 * correct quelle que soit la profondeur de chaînage conditionnel.
 */
export function answerQuestion(
  questions: Question[],
  answers: Answers,
  questionId: QuestionId,
  value: AnswerValue,
): Answers {
  const updated: Answers = { ...answers, [questionId]: value };
  const stillVisibleIds = new Set(getVisibleQuestions(questions, updated).map((q) => q.id));

  const result: Answers = {};
  for (const [id, val] of Object.entries(updated)) {
    if (stillVisibleIds.has(id)) {
      result[id] = val;
    }
  }
  return result;
}

export function getProgress(
  questions: Question[],
  answers: Answers,
  currentQuestionId: QuestionId | undefined,
): { position: number; total: number } {
  const visible = getVisibleQuestions(questions, answers);
  const total = visible.length;
  if (currentQuestionId === undefined) {
    return { position: total, total };
  }
  const index = visible.findIndex((q) => q.id === currentQuestionId);
  return { position: index === -1 ? total : index + 1, total };
}
