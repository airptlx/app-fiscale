import type { AnswerValue, Answers, Question, QuestionId } from "../tax-rules/types";
import { answerQuestion, getNextQuestion, getPreviousQuestion } from "./navigation";

export interface QuestionnaireState {
  answers: Answers;
  currentQuestionId: QuestionId | undefined;
}

export const initialQuestionnaireState: QuestionnaireState = {
  answers: {},
  currentQuestionId: undefined,
};

export type QuestionnaireAction =
  | { type: "HYDRATE"; questions: Question[]; answers: Answers }
  | { type: "ANSWER"; questions: Question[]; questionId: QuestionId; value: AnswerValue }
  | { type: "BACK"; questions: Question[] }
  | { type: "RESET" };

export function questionnaireReducer(
  state: QuestionnaireState,
  action: QuestionnaireAction,
): QuestionnaireState {
  switch (action.type) {
    case "HYDRATE": {
      return {
        answers: action.answers,
        currentQuestionId: getNextQuestion(action.questions, action.answers)?.id,
      };
    }
    case "ANSWER": {
      const answers = answerQuestion(
        action.questions,
        state.answers,
        action.questionId,
        action.value,
      );
      return {
        answers,
        currentQuestionId: getNextQuestion(action.questions, answers)?.id,
      };
    }
    case "BACK": {
      if (state.currentQuestionId === undefined) return state;
      const previous = getPreviousQuestion(action.questions, state.answers, state.currentQuestionId);
      if (previous === undefined) return state;
      return { ...state, currentQuestionId: previous.id };
    }
    case "RESET":
      return initialQuestionnaireState;
    default:
      return state;
  }
}
