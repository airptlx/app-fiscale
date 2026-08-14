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
    expect(state.currentQuestionId).toBe("situation-conjugale");
  });

  it("HYDRATE with partial saved answers resumes on the first unanswered question", () => {
    const savedAnswers: Answers = { "situation-conjugale": "celibataire" };
    const state = questionnaireReducer(initialQuestionnaireState, {
      type: "HYDRATE",
      questions: Q,
      answers: savedAnswers,
    });
    expect(state.currentQuestionId).toBe("revenus");
    expect(state.answers).toEqual(savedAnswers);
  });

  it("HYDRATE resumes on montant-chomage-2025 once the salary sub-flow is answered", () => {
    const savedAnswers: Answers = {
      "situation-conjugale": "celibataire",
      revenus: ["salaire", "chomage"],
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 28_000,
    };
    const state = questionnaireReducer(initialQuestionnaireState, {
      type: "HYDRATE",
      questions: Q,
      answers: savedAnswers,
    });
    expect(state.currentQuestionId).toBe("montant-chomage-2025");
  });

  it("HYDRATE with a complete answer set has no current question", () => {
    const savedAnswers: Answers = { "situation-conjugale": "autre" };
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
      questionId: "situation-conjugale",
      value: "celibataire",
    });
    expect(state.currentQuestionId).toBe("revenus");
    expect(state.answers).toEqual({ "situation-conjugale": "celibataire" });
  });

  it("ANSWER advances to nombre-enfants-a-charge for a couple", () => {
    const state = questionnaireReducer(initialQuestionnaireState, {
      type: "ANSWER",
      questions: Q,
      questionId: "situation-conjugale",
      value: "couple",
    });
    expect(state.currentQuestionId).toBe("nombre-enfants-a-charge");
  });

  it("ANSWER applies the cascade-clear when changing an earlier answer", () => {
    let state: QuestionnaireState = {
      answers: {
        "situation-conjugale": "celibataire",
        "fiche-paie-disponible": true,
        "salaire-net-imposable-2025": 28_000,
      },
      currentQuestionId: undefined,
    };
    state = questionnaireReducer(state, {
      type: "ANSWER",
      questions: Q,
      questionId: "situation-conjugale",
      value: "autre",
    });
    expect(state.answers).toEqual({ "situation-conjugale": "autre" });
    expect(state.currentQuestionId).toBeUndefined();
  });

  it("BACK moves to the previous visible question", () => {
    const state = questionnaireReducer(
      {
        answers: { "situation-conjugale": "celibataire", revenus: ["salaire"] },
        currentQuestionId: "fiche-paie-disponible",
      },
      { type: "BACK", questions: Q },
    );
    expect(state.currentQuestionId).toBe("revenus");
  });

  it("BACK no-ops on the first question", () => {
    const initial: QuestionnaireState = {
      answers: {},
      currentQuestionId: "situation-conjugale",
    };
    const state = questionnaireReducer(initial, { type: "BACK", questions: Q });
    expect(state).toBe(initial);
  });

  it("BACK no-ops when currentQuestionId is undefined", () => {
    const initial: QuestionnaireState = {
      answers: { "situation-conjugale": "autre" },
      currentQuestionId: undefined,
    };
    const state = questionnaireReducer(initial, { type: "BACK", questions: Q });
    expect(state).toBe(initial);
  });

  it("RESET returns the initial state", () => {
    const state = questionnaireReducer(
      { answers: { "situation-conjugale": "celibataire" }, currentQuestionId: "fiche-paie-disponible" },
      { type: "RESET" },
    );
    expect(state).toEqual(initialQuestionnaireState);
  });
});
