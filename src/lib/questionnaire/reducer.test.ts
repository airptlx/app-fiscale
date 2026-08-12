import { describe, expect, it } from "vitest";
import { QUESTIONS_2025 } from "../tax-rules/2025/questions";
import type { Answers } from "../tax-rules/types";
import {
  initialQuestionnaireState,
  questionnaireReducer,
  type QuestionnaireState,
} from "./reducer";

const Q = QUESTIONS_2025;

describe("questionnaireReducer", () => {
  it("HYDRATE with no saved answers positions on the first question", () => {
    const state = questionnaireReducer(initialQuestionnaireState, {
      type: "HYDRATE",
      questions: Q,
      answers: {},
    });
    expect(state.currentQuestionId).toBe("situation-familiale-simple");
  });

  it("HYDRATE with partial saved answers resumes on the first unanswered question", () => {
    const savedAnswers: Answers = { "situation-familiale-simple": true };
    const state = questionnaireReducer(initialQuestionnaireState, {
      type: "HYDRATE",
      questions: Q,
      answers: savedAnswers,
    });
    expect(state.currentQuestionId).toBe("fiche-paie-disponible");
    expect(state.answers).toEqual(savedAnswers);
  });

  it("HYDRATE with a complete answer set has no current question", () => {
    const savedAnswers: Answers = { "situation-familiale-simple": false };
    const state = questionnaireReducer(initialQuestionnaireState, {
      type: "HYDRATE",
      questions: Q,
      answers: savedAnswers,
    });
    expect(state.currentQuestionId).toBeUndefined();
  });

  it("ANSWER advances to the next question", () => {
    const state = questionnaireReducer(initialQuestionnaireState, {
      type: "ANSWER",
      questions: Q,
      questionId: "situation-familiale-simple",
      value: true,
    });
    expect(state.currentQuestionId).toBe("fiche-paie-disponible");
    expect(state.answers).toEqual({ "situation-familiale-simple": true });
  });

  it("ANSWER applies the cascade-clear when changing an earlier answer", () => {
    let state: QuestionnaireState = {
      answers: {
        "situation-familiale-simple": true,
        "fiche-paie-disponible": true,
        "salaire-net-imposable-2025": 28_000,
      },
      currentQuestionId: undefined,
    };
    state = questionnaireReducer(state, {
      type: "ANSWER",
      questions: Q,
      questionId: "situation-familiale-simple",
      value: false,
    });
    expect(state.answers).toEqual({ "situation-familiale-simple": false });
    expect(state.currentQuestionId).toBeUndefined();
  });

  it("BACK moves to the previous visible question", () => {
    const state = questionnaireReducer(
      { answers: { "situation-familiale-simple": true }, currentQuestionId: "fiche-paie-disponible" },
      { type: "BACK", questions: Q },
    );
    expect(state.currentQuestionId).toBe("situation-familiale-simple");
  });

  it("BACK no-ops on the first question", () => {
    const initial: QuestionnaireState = {
      answers: {},
      currentQuestionId: "situation-familiale-simple",
    };
    const state = questionnaireReducer(initial, { type: "BACK", questions: Q });
    expect(state).toBe(initial);
  });

  it("BACK no-ops when currentQuestionId is undefined", () => {
    const initial: QuestionnaireState = {
      answers: { "situation-familiale-simple": false },
      currentQuestionId: undefined,
    };
    const state = questionnaireReducer(initial, { type: "BACK", questions: Q });
    expect(state).toBe(initial);
  });

  it("RESET returns the initial state", () => {
    const state = questionnaireReducer(
      { answers: { "situation-familiale-simple": true }, currentQuestionId: "fiche-paie-disponible" },
      { type: "RESET" },
    );
    expect(state).toEqual(initialQuestionnaireState);
  });
});
