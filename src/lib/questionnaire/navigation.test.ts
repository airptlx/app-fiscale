import { describe, expect, it } from "vitest";
import { QUESTIONS_2025 } from "../tax-rules/2025/questions";
import type { Answers } from "../tax-rules/types";
import {
  answerQuestion,
  getNextQuestion,
  getPreviousQuestion,
  getProgress,
  getVisibleQuestions,
  isQuestionnaireComplete,
} from "./navigation";

const Q = QUESTIONS_2025;
const ids = (list: { id: string }[]) => list.map((q) => q.id);

describe("getVisibleQuestions", () => {
  it("shows only the first question when nothing is answered", () => {
    expect(ids(getVisibleQuestions(Q, {}))).toEqual(["situation-familiale-simple"]);
  });

  it("reveals fiche-paie-disponible once célibataire is confirmed", () => {
    const answers: Answers = { "situation-familiale-simple": true };
    expect(ids(getVisibleQuestions(Q, answers))).toEqual([
      "situation-familiale-simple",
      "fiche-paie-disponible",
    ]);
  });

  it("reveals the net-imposable question when the payslip is available", () => {
    const answers: Answers = {
      "situation-familiale-simple": true,
      "fiche-paie-disponible": true,
    };
    expect(ids(getVisibleQuestions(Q, answers))).toEqual([
      "situation-familiale-simple",
      "fiche-paie-disponible",
      "salaire-net-imposable-2025",
    ]);
  });

  it("reveals the brut question instead when the payslip is not available", () => {
    const answers: Answers = {
      "situation-familiale-simple": true,
      "fiche-paie-disponible": false,
    };
    expect(ids(getVisibleQuestions(Q, answers))).toEqual([
      "situation-familiale-simple",
      "fiche-paie-disponible",
      "salaire-brut-annuel-2025",
    ]);
  });

  it("stays a dead end when célibataire is false", () => {
    expect(ids(getVisibleQuestions(Q, { "situation-familiale-simple": false }))).toEqual([
      "situation-familiale-simple",
    ]);
  });
});

describe("getNextQuestion", () => {
  it("starts at the first question", () => {
    expect(getNextQuestion(Q, {})?.id).toBe("situation-familiale-simple");
  });

  it("is undefined at the dead end (célibataire: false)", () => {
    expect(getNextQuestion(Q, { "situation-familiale-simple": false })).toBeUndefined();
  });

  it("walks the exact-path branch to completion", () => {
    let answers: Answers = {};
    answers = answerQuestion(Q, answers, "situation-familiale-simple", true);
    expect(getNextQuestion(Q, answers)?.id).toBe("fiche-paie-disponible");
    answers = answerQuestion(Q, answers, "fiche-paie-disponible", true);
    expect(getNextQuestion(Q, answers)?.id).toBe("salaire-net-imposable-2025");
    answers = answerQuestion(Q, answers, "salaire-net-imposable-2025", 28_000);
    expect(getNextQuestion(Q, answers)).toBeUndefined();
  });

  it("walks the estimation branch to completion", () => {
    let answers: Answers = {};
    answers = answerQuestion(Q, answers, "situation-familiale-simple", true);
    answers = answerQuestion(Q, answers, "fiche-paie-disponible", false);
    expect(getNextQuestion(Q, answers)?.id).toBe("salaire-brut-annuel-2025");
    answers = answerQuestion(Q, answers, "salaire-brut-annuel-2025", 35_000);
    expect(getNextQuestion(Q, answers)).toBeUndefined();
  });
});

describe("getPreviousQuestion", () => {
  it("is undefined from the first question", () => {
    expect(getPreviousQuestion(Q, {}, "situation-familiale-simple")).toBeUndefined();
  });

  it("returns the first question from the second", () => {
    const answers: Answers = { "situation-familiale-simple": true };
    expect(getPreviousQuestion(Q, answers, "fiche-paie-disponible")?.id).toBe(
      "situation-familiale-simple",
    );
  });

  it("returns the second question from a third-level question on either branch", () => {
    const exact: Answers = { "situation-familiale-simple": true, "fiche-paie-disponible": true };
    expect(getPreviousQuestion(Q, exact, "salaire-net-imposable-2025")?.id).toBe(
      "fiche-paie-disponible",
    );

    const estimate: Answers = {
      "situation-familiale-simple": true,
      "fiche-paie-disponible": false,
    };
    expect(getPreviousQuestion(Q, estimate, "salaire-brut-annuel-2025")?.id).toBe(
      "fiche-paie-disponible",
    );
  });
});

describe("answerQuestion (cascade clear)", () => {
  it("clears fiche-paie-disponible and the salary answer when situation-familiale-simple flips to false", () => {
    let answers: Answers = {
      "situation-familiale-simple": true,
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 28_000,
    };
    answers = answerQuestion(Q, answers, "situation-familiale-simple", false);
    expect(answers).toEqual({ "situation-familiale-simple": false });
  });

  it("clears the net-imposable answer when fiche-paie-disponible flips to false", () => {
    let answers: Answers = {
      "situation-familiale-simple": true,
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 28_000,
    };
    answers = answerQuestion(Q, answers, "fiche-paie-disponible", false);
    expect(answers).toEqual({
      "situation-familiale-simple": true,
      "fiche-paie-disponible": false,
    });
  });
});

describe("isQuestionnaireComplete", () => {
  it("is false for no answers", () => {
    expect(isQuestionnaireComplete(Q, {})).toBe(false);
  });

  it("is false partway through", () => {
    expect(isQuestionnaireComplete(Q, { "situation-familiale-simple": true })).toBe(false);
  });

  it("is true at the dead end", () => {
    expect(isQuestionnaireComplete(Q, { "situation-familiale-simple": false })).toBe(true);
  });

  it("is true once the exact-path branch is fully answered", () => {
    const answers: Answers = {
      "situation-familiale-simple": true,
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 28_000,
    };
    expect(isQuestionnaireComplete(Q, answers)).toBe(true);
  });
});

describe("getProgress", () => {
  it("reports 1 of 1 on the first question", () => {
    expect(getProgress(Q, {}, "situation-familiale-simple")).toEqual({ position: 1, total: 1 });
  });

  it("reports 2 of 2 on the second question", () => {
    const answers: Answers = { "situation-familiale-simple": true };
    expect(getProgress(Q, answers, "fiche-paie-disponible")).toEqual({ position: 2, total: 2 });
  });

  it("reports position = total when complete (currentQuestionId undefined)", () => {
    const answers: Answers = {
      "situation-familiale-simple": true,
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 28_000,
    };
    expect(getProgress(Q, answers, undefined)).toEqual({ position: 3, total: 3 });
  });
});
