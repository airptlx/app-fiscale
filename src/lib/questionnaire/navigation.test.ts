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
    expect(ids(getVisibleQuestions(Q, {}))).toEqual(["situation-conjugale"]);
  });

  it("stays a dead end when situation-conjugale is 'autre'", () => {
    expect(ids(getVisibleQuestions(Q, { "situation-conjugale": "autre" }))).toEqual([
      "situation-conjugale",
    ]);
  });

  it("reveals fiche-paie-disponible, chomage, pension, foncier and activite-independante directly for a célibataire (no children question)", () => {
    // chomage, pension, foncier et activite-independante ne dépendent que de
    // situation-conjugale (comme fiche-paie-disponible), donc visibles dès ce
    // stade même si posées plus tard dans l'ordre du tableau.
    const answers: Answers = { "situation-conjugale": "celibataire" };
    expect(ids(getVisibleQuestions(Q, answers))).toEqual([
      "situation-conjugale",
      "fiche-paie-disponible",
      "chomage",
      "pension",
      "foncier",
      "activite-independante",
    ]);
  });

  it("reveals nombre-enfants-a-charge, fiche-paie-disponible, chomage, pension, conjoint-a-un-salaire, chomage-conjoint, pension-conjoint, foncier and both activite-independante questions for a couple", () => {
    // conjoint-a-un-salaire, chomage-conjoint, pension-conjoint, foncier et les
    // deux activite-independante ne dépendent que de situation-conjugale : tous
    // visibles dès ce stade.
    const answers: Answers = { "situation-conjugale": "couple" };
    expect(ids(getVisibleQuestions(Q, answers))).toEqual([
      "situation-conjugale",
      "nombre-enfants-a-charge",
      "fiche-paie-disponible",
      "chomage",
      "pension",
      "conjoint-a-un-salaire",
      "chomage-conjoint",
      "pension-conjoint",
      "foncier",
      "activite-independante",
      "activite-independante-conjoint",
    ]);
  });

  it("reveals the net-imposable question when the payslip is available", () => {
    const answers: Answers = {
      "situation-conjugale": "celibataire",
      "fiche-paie-disponible": true,
    };
    expect(ids(getVisibleQuestions(Q, answers))).toEqual([
      "situation-conjugale",
      "fiche-paie-disponible",
      "salaire-net-imposable-2025",
      "chomage",
      "pension",
      "foncier",
      "activite-independante",
    ]);
  });

  it("reveals the brut question instead when the payslip is not available", () => {
    const answers: Answers = {
      "situation-conjugale": "celibataire",
      "fiche-paie-disponible": false,
    };
    expect(ids(getVisibleQuestions(Q, answers))).toEqual([
      "situation-conjugale",
      "fiche-paie-disponible",
      "salaire-brut-annuel-2025",
      "chomage",
      "pension",
      "foncier",
      "activite-independante",
    ]);
  });

  it("reveals the montant-chomage-2025 question once chomage is answered true", () => {
    const answers: Answers = {
      "situation-conjugale": "celibataire",
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 28_000,
      chomage: true,
    };
    expect(ids(getVisibleQuestions(Q, answers))).toEqual([
      "situation-conjugale",
      "fiche-paie-disponible",
      "salaire-net-imposable-2025",
      "chomage",
      "montant-chomage-2025",
      "pension",
      "foncier",
      "activite-independante",
    ]);
  });

  it("does not reveal montant-chomage-2025 when chomage is false", () => {
    const answers: Answers = {
      "situation-conjugale": "celibataire",
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 28_000,
      chomage: false,
    };
    expect(ids(getVisibleQuestions(Q, answers))).not.toContain("montant-chomage-2025");
  });

  it("reveals the montant-pension-2025 question once pension is answered true", () => {
    const answers: Answers = {
      "situation-conjugale": "celibataire",
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 28_000,
      chomage: false,
      pension: true,
    };
    expect(ids(getVisibleQuestions(Q, answers))).toEqual([
      "situation-conjugale",
      "fiche-paie-disponible",
      "salaire-net-imposable-2025",
      "chomage",
      "pension",
      "montant-pension-2025",
      "foncier",
      "activite-independante",
    ]);
  });

  it("does not reveal montant-pension-2025 when pension is false", () => {
    const answers: Answers = {
      "situation-conjugale": "celibataire",
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 28_000,
      pension: false,
    };
    expect(ids(getVisibleQuestions(Q, answers))).not.toContain("montant-pension-2025");
  });

  it("reveals the montant-foncier-2025 question once foncier is answered true", () => {
    const answers: Answers = {
      "situation-conjugale": "celibataire",
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 28_000,
      chomage: false,
      pension: false,
      foncier: true,
    };
    expect(ids(getVisibleQuestions(Q, answers))).toEqual([
      "situation-conjugale",
      "fiche-paie-disponible",
      "salaire-net-imposable-2025",
      "chomage",
      "pension",
      "foncier",
      "montant-foncier-2025",
      "activite-independante",
    ]);
  });

  it("does not reveal montant-foncier-2025 when foncier is false", () => {
    const answers: Answers = {
      "situation-conjugale": "celibataire",
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 28_000,
      foncier: false,
    };
    expect(ids(getVisibleQuestions(Q, answers))).not.toContain("montant-foncier-2025");
  });

  it("reveals conjoint-a-un-salaire, chomage-conjoint and pension-conjoint once the couple's own salary question is answered", () => {
    const answers: Answers = {
      "situation-conjugale": "couple",
      "nombre-enfants-a-charge": 0,
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 30_000,
    };
    expect(ids(getVisibleQuestions(Q, answers))).toEqual([
      "situation-conjugale",
      "nombre-enfants-a-charge",
      "fiche-paie-disponible",
      "salaire-net-imposable-2025",
      "chomage",
      "pension",
      "conjoint-a-un-salaire",
      "chomage-conjoint",
      "pension-conjoint",
      "foncier",
      "activite-independante",
      "activite-independante-conjoint",
    ]);
  });

  it("is complete without conjoint salary questions when the conjoint has no salary", () => {
    const answers: Answers = {
      "situation-conjugale": "couple",
      "nombre-enfants-a-charge": 0,
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 30_000,
      "conjoint-a-un-salaire": false,
    };
    expect(ids(getVisibleQuestions(Q, answers))).toEqual([
      "situation-conjugale",
      "nombre-enfants-a-charge",
      "fiche-paie-disponible",
      "salaire-net-imposable-2025",
      "chomage",
      "pension",
      "conjoint-a-un-salaire",
      "chomage-conjoint",
      "pension-conjoint",
      "foncier",
      "activite-independante",
      "activite-independante-conjoint",
    ]);
  });

  it("reveals montant-chomage-2025-conjoint once chomage-conjoint is answered true, independently of conjoint-a-un-salaire", () => {
    const answers: Answers = {
      "situation-conjugale": "couple",
      "nombre-enfants-a-charge": 0,
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 30_000,
      "conjoint-a-un-salaire": false,
      "chomage-conjoint": true,
    };
    expect(ids(getVisibleQuestions(Q, answers))).toContain("montant-chomage-2025-conjoint");
  });

  it("reveals montant-pension-2025-conjoint once pension-conjoint is answered true, independently of conjoint-a-un-salaire", () => {
    const answers: Answers = {
      "situation-conjugale": "couple",
      "nombre-enfants-a-charge": 0,
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 30_000,
      "conjoint-a-un-salaire": false,
      "pension-conjoint": true,
    };
    expect(ids(getVisibleQuestions(Q, answers))).toContain("montant-pension-2025-conjoint");
  });

  it("walks the full conjoint branch (fiche-paie-disponible-conjoint then net-imposable-conjoint)", () => {
    const answers: Answers = {
      "situation-conjugale": "couple",
      "nombre-enfants-a-charge": 0,
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 30_000,
      "conjoint-a-un-salaire": true,
      "fiche-paie-disponible-conjoint": true,
    };
    expect(ids(getVisibleQuestions(Q, answers))).toEqual([
      "situation-conjugale",
      "nombre-enfants-a-charge",
      "fiche-paie-disponible",
      "salaire-net-imposable-2025",
      "chomage",
      "pension",
      "conjoint-a-un-salaire",
      "fiche-paie-disponible-conjoint",
      "salaire-net-imposable-2025-conjoint",
      "chomage-conjoint",
      "pension-conjoint",
      "foncier",
      "activite-independante",
      "activite-independante-conjoint",
    ]);
  });
});

describe("getNextQuestion", () => {
  it("starts at the first question", () => {
    expect(getNextQuestion(Q, {})?.id).toBe("situation-conjugale");
  });

  it("is undefined at the dead end (situation-conjugale: autre)", () => {
    expect(getNextQuestion(Q, { "situation-conjugale": "autre" })).toBeUndefined();
  });

  it("walks the célibataire exact-path branch to completion, including chomage, pension, foncier and activité indépendante", () => {
    let answers: Answers = {};
    answers = answerQuestion(Q, answers, "situation-conjugale", "celibataire");
    expect(getNextQuestion(Q, answers)?.id).toBe("fiche-paie-disponible");
    answers = answerQuestion(Q, answers, "fiche-paie-disponible", true);
    expect(getNextQuestion(Q, answers)?.id).toBe("salaire-net-imposable-2025");
    answers = answerQuestion(Q, answers, "salaire-net-imposable-2025", 28_000);
    expect(getNextQuestion(Q, answers)?.id).toBe("chomage");
    answers = answerQuestion(Q, answers, "chomage", true);
    expect(getNextQuestion(Q, answers)?.id).toBe("montant-chomage-2025");
    answers = answerQuestion(Q, answers, "montant-chomage-2025", 3_000);
    expect(getNextQuestion(Q, answers)?.id).toBe("pension");
    answers = answerQuestion(Q, answers, "pension", true);
    expect(getNextQuestion(Q, answers)?.id).toBe("montant-pension-2025");
    answers = answerQuestion(Q, answers, "montant-pension-2025", 2_000);
    expect(getNextQuestion(Q, answers)?.id).toBe("foncier");
    answers = answerQuestion(Q, answers, "foncier", true);
    expect(getNextQuestion(Q, answers)?.id).toBe("montant-foncier-2025");
    answers = answerQuestion(Q, answers, "montant-foncier-2025", 6_000);
    expect(getNextQuestion(Q, answers)?.id).toBe("activite-independante");
    answers = answerQuestion(Q, answers, "activite-independante", true);
    expect(getNextQuestion(Q, answers)?.id).toBe("type-activite-independante");
    answers = answerQuestion(Q, answers, "type-activite-independante", "vente");
    expect(getNextQuestion(Q, answers)?.id).toBe("chiffre-affaires-independant-2025");
    answers = answerQuestion(Q, answers, "chiffre-affaires-independant-2025", 10_000);
    expect(getNextQuestion(Q, answers)).toBeUndefined();
  });

  it("walks the célibataire estimation branch to completion, skipping the amount questions when chomage/pension/foncier/activite-independante are false", () => {
    let answers: Answers = {};
    answers = answerQuestion(Q, answers, "situation-conjugale", "celibataire");
    answers = answerQuestion(Q, answers, "fiche-paie-disponible", false);
    expect(getNextQuestion(Q, answers)?.id).toBe("salaire-brut-annuel-2025");
    answers = answerQuestion(Q, answers, "salaire-brut-annuel-2025", 35_000);
    expect(getNextQuestion(Q, answers)?.id).toBe("chomage");
    answers = answerQuestion(Q, answers, "chomage", false);
    expect(getNextQuestion(Q, answers)?.id).toBe("pension");
    answers = answerQuestion(Q, answers, "pension", false);
    expect(getNextQuestion(Q, answers)?.id).toBe("foncier");
    answers = answerQuestion(Q, answers, "foncier", false);
    expect(getNextQuestion(Q, answers)?.id).toBe("activite-independante");
    answers = answerQuestion(Q, answers, "activite-independante", false);
    expect(getNextQuestion(Q, answers)).toBeUndefined();
  });

  it("walks the couple branch to completion when the conjoint has no salary", () => {
    let answers: Answers = {};
    answers = answerQuestion(Q, answers, "situation-conjugale", "couple");
    expect(getNextQuestion(Q, answers)?.id).toBe("nombre-enfants-a-charge");
    answers = answerQuestion(Q, answers, "nombre-enfants-a-charge", 2);
    answers = answerQuestion(Q, answers, "fiche-paie-disponible", true);
    answers = answerQuestion(Q, answers, "salaire-net-imposable-2025", 30_000);
    expect(getNextQuestion(Q, answers)?.id).toBe("chomage");
    answers = answerQuestion(Q, answers, "chomage", false);
    expect(getNextQuestion(Q, answers)?.id).toBe("pension");
    answers = answerQuestion(Q, answers, "pension", false);
    expect(getNextQuestion(Q, answers)?.id).toBe("conjoint-a-un-salaire");
    answers = answerQuestion(Q, answers, "conjoint-a-un-salaire", false);
    expect(getNextQuestion(Q, answers)?.id).toBe("chomage-conjoint");
    answers = answerQuestion(Q, answers, "chomage-conjoint", false);
    expect(getNextQuestion(Q, answers)?.id).toBe("pension-conjoint");
    answers = answerQuestion(Q, answers, "pension-conjoint", false);
    expect(getNextQuestion(Q, answers)?.id).toBe("foncier");
    answers = answerQuestion(Q, answers, "foncier", false);
    expect(getNextQuestion(Q, answers)?.id).toBe("activite-independante");
    answers = answerQuestion(Q, answers, "activite-independante", false);
    expect(getNextQuestion(Q, answers)?.id).toBe("activite-independante-conjoint");
    answers = answerQuestion(Q, answers, "activite-independante-conjoint", false);
    expect(getNextQuestion(Q, answers)).toBeUndefined();
  });

  it("walks the couple branch to completion when the conjoint has a salary", () => {
    let answers: Answers = {};
    answers = answerQuestion(Q, answers, "situation-conjugale", "couple");
    answers = answerQuestion(Q, answers, "nombre-enfants-a-charge", 0);
    answers = answerQuestion(Q, answers, "fiche-paie-disponible", true);
    answers = answerQuestion(Q, answers, "salaire-net-imposable-2025", 30_000);
    answers = answerQuestion(Q, answers, "chomage", false);
    answers = answerQuestion(Q, answers, "pension", false);
    expect(getNextQuestion(Q, answers)?.id).toBe("conjoint-a-un-salaire");
    answers = answerQuestion(Q, answers, "conjoint-a-un-salaire", true);
    expect(getNextQuestion(Q, answers)?.id).toBe("fiche-paie-disponible-conjoint");
    answers = answerQuestion(Q, answers, "fiche-paie-disponible-conjoint", false);
    expect(getNextQuestion(Q, answers)?.id).toBe("salaire-brut-annuel-2025-conjoint");
    answers = answerQuestion(Q, answers, "salaire-brut-annuel-2025-conjoint", 40_000);
    expect(getNextQuestion(Q, answers)?.id).toBe("chomage-conjoint");
    answers = answerQuestion(Q, answers, "chomage-conjoint", true);
    expect(getNextQuestion(Q, answers)?.id).toBe("montant-chomage-2025-conjoint");
    answers = answerQuestion(Q, answers, "montant-chomage-2025-conjoint", 6_000);
    expect(getNextQuestion(Q, answers)?.id).toBe("pension-conjoint");
    answers = answerQuestion(Q, answers, "pension-conjoint", true);
    expect(getNextQuestion(Q, answers)?.id).toBe("montant-pension-2025-conjoint");
    answers = answerQuestion(Q, answers, "montant-pension-2025-conjoint", 8_000);
    expect(getNextQuestion(Q, answers)?.id).toBe("foncier");
    answers = answerQuestion(Q, answers, "foncier", true);
    expect(getNextQuestion(Q, answers)?.id).toBe("montant-foncier-2025");
    answers = answerQuestion(Q, answers, "montant-foncier-2025", 6_000);
    expect(getNextQuestion(Q, answers)?.id).toBe("activite-independante");
    answers = answerQuestion(Q, answers, "activite-independante", true);
    expect(getNextQuestion(Q, answers)?.id).toBe("type-activite-independante");
    answers = answerQuestion(Q, answers, "type-activite-independante", "service");
    expect(getNextQuestion(Q, answers)?.id).toBe("chiffre-affaires-independant-2025");
    answers = answerQuestion(Q, answers, "chiffre-affaires-independant-2025", 5_000);
    expect(getNextQuestion(Q, answers)?.id).toBe("activite-independante-conjoint");
    answers = answerQuestion(Q, answers, "activite-independante-conjoint", true);
    expect(getNextQuestion(Q, answers)?.id).toBe("type-activite-independante-conjoint");
    answers = answerQuestion(Q, answers, "type-activite-independante-conjoint", "liberale");
    expect(getNextQuestion(Q, answers)?.id).toBe("chiffre-affaires-independant-2025-conjoint");
    answers = answerQuestion(Q, answers, "chiffre-affaires-independant-2025-conjoint", 3_000);
    expect(getNextQuestion(Q, answers)).toBeUndefined();
  });

  it("reaches chomage-conjoint and pension-conjoint even when the conjoint never answers the salary question", () => {
    let answers: Answers = {};
    answers = answerQuestion(Q, answers, "situation-conjugale", "couple");
    answers = answerQuestion(Q, answers, "nombre-enfants-a-charge", 0);
    answers = answerQuestion(Q, answers, "fiche-paie-disponible", true);
    answers = answerQuestion(Q, answers, "salaire-net-imposable-2025", 30_000);
    answers = answerQuestion(Q, answers, "chomage", false);
    answers = answerQuestion(Q, answers, "pension", false);
    answers = answerQuestion(Q, answers, "conjoint-a-un-salaire", false);
    expect(getNextQuestion(Q, answers)?.id).toBe("chomage-conjoint");
    answers = answerQuestion(Q, answers, "chomage-conjoint", false);
    expect(getNextQuestion(Q, answers)?.id).toBe("pension-conjoint");
  });
});

describe("getPreviousQuestion", () => {
  it("is undefined from the first question", () => {
    expect(getPreviousQuestion(Q, {}, "situation-conjugale")).toBeUndefined();
  });

  it("returns the first question from the second, on the célibataire branch", () => {
    const answers: Answers = { "situation-conjugale": "celibataire" };
    expect(getPreviousQuestion(Q, answers, "fiche-paie-disponible")?.id).toBe(
      "situation-conjugale",
    );
  });

  it("returns nombre-enfants-a-charge from fiche-paie-disponible, on the couple branch", () => {
    const answers: Answers = { "situation-conjugale": "couple" };
    expect(getPreviousQuestion(Q, answers, "fiche-paie-disponible")?.id).toBe(
      "nombre-enfants-a-charge",
    );
  });

  it("returns the salary question from either salary branch", () => {
    const exact: Answers = { "situation-conjugale": "celibataire", "fiche-paie-disponible": true };
    expect(getPreviousQuestion(Q, exact, "salaire-net-imposable-2025")?.id).toBe(
      "fiche-paie-disponible",
    );

    const estimate: Answers = {
      "situation-conjugale": "celibataire",
      "fiche-paie-disponible": false,
    };
    expect(getPreviousQuestion(Q, estimate, "salaire-brut-annuel-2025")?.id).toBe(
      "fiche-paie-disponible",
    );
  });

  it("returns the salary question from chomage, on the célibataire branch", () => {
    const answers: Answers = {
      "situation-conjugale": "celibataire",
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 28_000,
    };
    expect(getPreviousQuestion(Q, answers, "chomage")?.id).toBe("salaire-net-imposable-2025");
  });

  it("returns chomage from pension when chomage is unanswered (montant-chomage-2025 not visible)", () => {
    const answers: Answers = {
      "situation-conjugale": "celibataire",
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 28_000,
    };
    expect(getPreviousQuestion(Q, answers, "pension")?.id).toBe("chomage");
  });

  it("returns pension from foncier when pension is unanswered (montant-pension-2025 not visible)", () => {
    const answers: Answers = {
      "situation-conjugale": "celibataire",
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 28_000,
    };
    expect(getPreviousQuestion(Q, answers, "foncier")?.id).toBe("pension");
  });
});

describe("answerQuestion (cascade clear)", () => {
  it("clears couple-only downstream answers when situation-conjugale flips to célibataire, but keeps vous-only chomage/pension/foncier", () => {
    let answers: Answers = {
      "situation-conjugale": "couple",
      "nombre-enfants-a-charge": 2,
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 30_000,
      chomage: false,
      pension: false,
      "conjoint-a-un-salaire": true,
      "fiche-paie-disponible-conjoint": true,
      "salaire-net-imposable-2025-conjoint": 30_000,
      "chomage-conjoint": true,
      "montant-chomage-2025-conjoint": 6_000,
      "pension-conjoint": true,
      "montant-pension-2025-conjoint": 8_000,
      foncier: true,
      "montant-foncier-2025": 6_000,
    };
    answers = answerQuestion(Q, answers, "situation-conjugale", "celibataire");
    expect(answers).toEqual({
      "situation-conjugale": "celibataire",
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 30_000,
      chomage: false,
      pension: false,
      foncier: true,
      "montant-foncier-2025": 6_000,
    });
  });

  it("clears conjoint salary answers when conjoint-a-un-salaire flips to false, but keeps chomage-conjoint/pension-conjoint/foncier (independent questions)", () => {
    let answers: Answers = {
      "situation-conjugale": "couple",
      "nombre-enfants-a-charge": 0,
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 30_000,
      chomage: false,
      pension: false,
      "conjoint-a-un-salaire": true,
      "fiche-paie-disponible-conjoint": true,
      "salaire-net-imposable-2025-conjoint": 30_000,
      "chomage-conjoint": true,
      "montant-chomage-2025-conjoint": 6_000,
      "pension-conjoint": true,
      "montant-pension-2025-conjoint": 8_000,
      foncier: true,
      "montant-foncier-2025": 6_000,
    };
    answers = answerQuestion(Q, answers, "conjoint-a-un-salaire", false);
    expect(answers).toEqual({
      "situation-conjugale": "couple",
      "nombre-enfants-a-charge": 0,
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 30_000,
      chomage: false,
      pension: false,
      "conjoint-a-un-salaire": false,
      "chomage-conjoint": true,
      "montant-chomage-2025-conjoint": 6_000,
      "pension-conjoint": true,
      "montant-pension-2025-conjoint": 8_000,
      foncier: true,
      "montant-foncier-2025": 6_000,
    });
  });

  it("clears the net-imposable answer when fiche-paie-disponible flips to false", () => {
    let answers: Answers = {
      "situation-conjugale": "celibataire",
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 28_000,
    };
    answers = answerQuestion(Q, answers, "fiche-paie-disponible", false);
    expect(answers).toEqual({
      "situation-conjugale": "celibataire",
      "fiche-paie-disponible": false,
    });
  });

  it("clears montant-chomage-2025 when chomage flips to false", () => {
    let answers: Answers = {
      "situation-conjugale": "celibataire",
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 28_000,
      chomage: true,
      "montant-chomage-2025": 3_000,
    };
    answers = answerQuestion(Q, answers, "chomage", false);
    expect(answers).toEqual({
      "situation-conjugale": "celibataire",
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 28_000,
      chomage: false,
    });
  });

  it("clears montant-pension-2025 when pension flips to false", () => {
    let answers: Answers = {
      "situation-conjugale": "celibataire",
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 28_000,
      pension: true,
      "montant-pension-2025": 2_000,
    };
    answers = answerQuestion(Q, answers, "pension", false);
    expect(answers).toEqual({
      "situation-conjugale": "celibataire",
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 28_000,
      pension: false,
    });
  });

  it("clears montant-foncier-2025 when foncier flips to false", () => {
    let answers: Answers = {
      "situation-conjugale": "celibataire",
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 28_000,
      foncier: true,
      "montant-foncier-2025": 6_000,
    };
    answers = answerQuestion(Q, answers, "foncier", false);
    expect(answers).toEqual({
      "situation-conjugale": "celibataire",
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 28_000,
      foncier: false,
    });
  });
});

describe("isQuestionnaireComplete", () => {
  it("is false for no answers", () => {
    expect(isQuestionnaireComplete(Q, {})).toBe(false);
  });

  it("is false partway through", () => {
    expect(isQuestionnaireComplete(Q, { "situation-conjugale": "celibataire" })).toBe(false);
  });

  it("is true at the dead end", () => {
    expect(isQuestionnaireComplete(Q, { "situation-conjugale": "autre" })).toBe(true);
  });

  it("is true once the célibataire exact-path branch, chomage/pension/foncier/activite-independante included, is fully answered", () => {
    const answers: Answers = {
      "situation-conjugale": "celibataire",
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 28_000,
      chomage: false,
      pension: false,
      foncier: false,
      "activite-independante": false,
    };
    expect(isQuestionnaireComplete(Q, answers)).toBe(true);
  });

  it("is true once the couple branch (no conjoint salary), chomage/pension/foncier/activite-independante included, is fully answered", () => {
    const answers: Answers = {
      "situation-conjugale": "couple",
      "nombre-enfants-a-charge": 1,
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 28_000,
      chomage: false,
      pension: false,
      "conjoint-a-un-salaire": false,
      "chomage-conjoint": false,
      "pension-conjoint": false,
      foncier: false,
      "activite-independante": false,
      "activite-independante-conjoint": false,
    };
    expect(isQuestionnaireComplete(Q, answers)).toBe(true);
  });
});

describe("getProgress", () => {
  it("reports 1 of 1 on the first question", () => {
    expect(getProgress(Q, {}, "situation-conjugale")).toEqual({ position: 1, total: 1 });
  });

  it("reports 2 of 11 on nombre-enfants-a-charge for a couple", () => {
    // total = 11 dès ce stade : conjoint-a-un-salaire, chomage, pension,
    // chomage-conjoint, pension-conjoint, foncier et les deux activite-
    // independante sont déjà visibles (ne dépendent que de situation-
    // conjugale), même s'ils ne sont atteints qu'après dans l'ordre du tableau.
    const answers: Answers = { "situation-conjugale": "couple" };
    expect(getProgress(Q, answers, "nombre-enfants-a-charge")).toEqual({ position: 2, total: 11 });
  });

  it("reports position = total when complete (currentQuestionId undefined)", () => {
    const answers: Answers = {
      "situation-conjugale": "celibataire",
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 28_000,
    };
    expect(getProgress(Q, answers, undefined)).toEqual({ position: 7, total: 7 });
  });
});
