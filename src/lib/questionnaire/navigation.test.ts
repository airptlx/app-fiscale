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

  it("reveals revenus and activites-annexes directly for a célibataire (no children question)", () => {
    const answers: Answers = { "situation-conjugale": "celibataire" };
    expect(ids(getVisibleQuestions(Q, answers))).toEqual([
      "situation-conjugale",
      "revenus",
      "activites-annexes",
    ]);
  });

  it("reveals nombre-enfants-a-charge, revenus, revenus-conjoint and activites-annexes for a couple", () => {
    const answers: Answers = { "situation-conjugale": "couple" };
    expect(ids(getVisibleQuestions(Q, answers))).toEqual([
      "situation-conjugale",
      "nombre-enfants-a-charge",
      "revenus",
      "revenus-conjoint",
      "activites-annexes",
    ]);
  });

  it("reveals fiche-paie-disponible once revenus includes salaire", () => {
    const answers: Answers = { "situation-conjugale": "celibataire", revenus: ["salaire"] };
    expect(ids(getVisibleQuestions(Q, answers))).toEqual([
      "situation-conjugale",
      "revenus",
      "fiche-paie-disponible",
      "activites-annexes",
    ]);
  });

  it("does not reveal fiche-paie-disponible when revenus does not include salaire", () => {
    const answers: Answers = { "situation-conjugale": "celibataire", revenus: ["chomage"] };
    expect(ids(getVisibleQuestions(Q, answers))).not.toContain("fiche-paie-disponible");
    expect(ids(getVisibleQuestions(Q, answers))).toContain("montant-chomage-2025");
  });

  it("reveals the net-imposable question when the payslip is available", () => {
    const answers: Answers = {
      "situation-conjugale": "celibataire",
      revenus: ["salaire"],
      "fiche-paie-disponible": true,
    };
    expect(ids(getVisibleQuestions(Q, answers))).toEqual([
      "situation-conjugale",
      "revenus",
      "fiche-paie-disponible",
      "salaire-net-imposable-2025",
      "activites-annexes",
    ]);
  });

  it("reveals the brut question instead when the payslip is not available", () => {
    const answers: Answers = {
      "situation-conjugale": "celibataire",
      revenus: ["salaire"],
      "fiche-paie-disponible": false,
    };
    expect(ids(getVisibleQuestions(Q, answers))).toEqual([
      "situation-conjugale",
      "revenus",
      "fiche-paie-disponible",
      "salaire-brut-annuel-2025",
      "activites-annexes",
    ]);
  });

  it("reveals montant-chomage-2025 and montant-pension-2025 together when both are checked", () => {
    const answers: Answers = {
      "situation-conjugale": "celibataire",
      revenus: ["chomage", "pension"],
    };
    expect(ids(getVisibleQuestions(Q, answers))).toEqual([
      "situation-conjugale",
      "revenus",
      "montant-chomage-2025",
      "montant-pension-2025",
      "activites-annexes",
    ]);
  });

  it("reveals montant-foncier-2025 once activites-annexes includes foncier", () => {
    const answers: Answers = {
      "situation-conjugale": "celibataire",
      revenus: [],
      "activites-annexes": ["foncier"],
    };
    expect(ids(getVisibleQuestions(Q, answers))).toEqual([
      "situation-conjugale",
      "revenus",
      "activites-annexes",
      "montant-foncier-2025",
    ]);
  });

  it("reveals type/chiffre-affaires directly for a célibataire once micro-entreprise is checked (no qui question)", () => {
    const answers: Answers = {
      "situation-conjugale": "celibataire",
      revenus: [],
      "activites-annexes": ["micro-entreprise"],
    };
    const visible = ids(getVisibleQuestions(Q, answers));
    expect(visible).not.toContain("qui-activite-independante");
    expect(visible).toContain("type-activite-independante");
    expect(visible).toContain("chiffre-affaires-independant-2025");
  });

  it("reveals qui-activite-independante for a couple once micro-entreprise is checked, but not the type/chiffre-affaires questions yet", () => {
    const answers: Answers = {
      "situation-conjugale": "couple",
      "nombre-enfants-a-charge": 0,
      revenus: [],
      "revenus-conjoint": [],
      "activites-annexes": ["micro-entreprise"],
    };
    const visible = ids(getVisibleQuestions(Q, answers));
    expect(visible).toContain("qui-activite-independante");
    expect(visible).not.toContain("type-activite-independante");
    expect(visible).not.toContain("type-activite-independante-conjoint");
  });

  it("reveals only the 'toi' detail questions when qui-activite-independante is ['toi']", () => {
    const answers: Answers = {
      "situation-conjugale": "couple",
      "nombre-enfants-a-charge": 0,
      revenus: [],
      "revenus-conjoint": [],
      "activites-annexes": ["micro-entreprise"],
      "qui-activite-independante": ["toi"],
    };
    const visible = ids(getVisibleQuestions(Q, answers));
    expect(visible).toContain("type-activite-independante");
    expect(visible).toContain("chiffre-affaires-independant-2025");
    expect(visible).not.toContain("type-activite-independante-conjoint");
    expect(visible).not.toContain("chiffre-affaires-independant-2025-conjoint");
  });

  it("reveals both sides' detail questions when qui-activite-independante is ['toi', 'conjoint']", () => {
    const answers: Answers = {
      "situation-conjugale": "couple",
      "nombre-enfants-a-charge": 0,
      revenus: [],
      "revenus-conjoint": [],
      "activites-annexes": ["micro-entreprise"],
      "qui-activite-independante": ["toi", "conjoint"],
    };
    const visible = ids(getVisibleQuestions(Q, answers));
    expect(visible).toEqual(
      expect.arrayContaining([
        "type-activite-independante",
        "chiffre-affaires-independant-2025",
        "type-activite-independante-conjoint",
        "chiffre-affaires-independant-2025-conjoint",
      ]),
    );
  });
});

describe("getNextQuestion", () => {
  it("starts at the first question", () => {
    expect(getNextQuestion(Q, {})?.id).toBe("situation-conjugale");
  });

  it("is undefined at the dead end (situation-conjugale: autre)", () => {
    expect(getNextQuestion(Q, { "situation-conjugale": "autre" })).toBeUndefined();
  });

  it("walks a full célibataire branch: salaire + chômage, foncier, micro-entreprise", () => {
    let answers: Answers = {};
    answers = answerQuestion(Q, answers, "situation-conjugale", "celibataire");
    expect(getNextQuestion(Q, answers)?.id).toBe("revenus");
    answers = answerQuestion(Q, answers, "revenus", ["salaire", "chomage"]);
    expect(getNextQuestion(Q, answers)?.id).toBe("fiche-paie-disponible");
    answers = answerQuestion(Q, answers, "fiche-paie-disponible", true);
    expect(getNextQuestion(Q, answers)?.id).toBe("salaire-net-imposable-2025");
    answers = answerQuestion(Q, answers, "salaire-net-imposable-2025", 28_000);
    expect(getNextQuestion(Q, answers)?.id).toBe("montant-chomage-2025");
    answers = answerQuestion(Q, answers, "montant-chomage-2025", 3_000);
    expect(getNextQuestion(Q, answers)?.id).toBe("activites-annexes");
    answers = answerQuestion(Q, answers, "activites-annexes", ["foncier", "micro-entreprise"]);
    expect(getNextQuestion(Q, answers)?.id).toBe("montant-foncier-2025");
    answers = answerQuestion(Q, answers, "montant-foncier-2025", 6_000);
    expect(getNextQuestion(Q, answers)?.id).toBe("type-activite-independante");
    answers = answerQuestion(Q, answers, "type-activite-independante", "vente");
    expect(getNextQuestion(Q, answers)?.id).toBe("chiffre-affaires-independant-2025");
    answers = answerQuestion(Q, answers, "chiffre-affaires-independant-2025", 10_000);
    expect(getNextQuestion(Q, answers)).toBeUndefined();
  });

  it("walks a célibataire branch with nothing checked anywhere (all multi-choice answers empty)", () => {
    let answers: Answers = {};
    answers = answerQuestion(Q, answers, "situation-conjugale", "celibataire");
    answers = answerQuestion(Q, answers, "revenus", []);
    expect(getNextQuestion(Q, answers)?.id).toBe("activites-annexes");
    answers = answerQuestion(Q, answers, "activites-annexes", []);
    expect(getNextQuestion(Q, answers)).toBeUndefined();
  });

  it("walks a full couple branch, with the micro-entreprise activity split between both", () => {
    let answers: Answers = {};
    answers = answerQuestion(Q, answers, "situation-conjugale", "couple");
    expect(getNextQuestion(Q, answers)?.id).toBe("nombre-enfants-a-charge");
    answers = answerQuestion(Q, answers, "nombre-enfants-a-charge", 0);
    expect(getNextQuestion(Q, answers)?.id).toBe("revenus");
    answers = answerQuestion(Q, answers, "revenus", ["salaire"]);
    expect(getNextQuestion(Q, answers)?.id).toBe("fiche-paie-disponible");
    answers = answerQuestion(Q, answers, "fiche-paie-disponible", true);
    answers = answerQuestion(Q, answers, "salaire-net-imposable-2025", 30_000);
    expect(getNextQuestion(Q, answers)?.id).toBe("revenus-conjoint");
    answers = answerQuestion(Q, answers, "revenus-conjoint", ["pension"]);
    expect(getNextQuestion(Q, answers)?.id).toBe("montant-pension-2025-conjoint");
    answers = answerQuestion(Q, answers, "montant-pension-2025-conjoint", 12_000);
    expect(getNextQuestion(Q, answers)?.id).toBe("activites-annexes");
    answers = answerQuestion(Q, answers, "activites-annexes", ["micro-entreprise"]);
    expect(getNextQuestion(Q, answers)?.id).toBe("qui-activite-independante");
    answers = answerQuestion(Q, answers, "qui-activite-independante", ["toi", "conjoint"]);
    expect(getNextQuestion(Q, answers)?.id).toBe("type-activite-independante");
    answers = answerQuestion(Q, answers, "type-activite-independante", "service");
    expect(getNextQuestion(Q, answers)?.id).toBe("chiffre-affaires-independant-2025");
    answers = answerQuestion(Q, answers, "chiffre-affaires-independant-2025", 15_000);
    expect(getNextQuestion(Q, answers)?.id).toBe("type-activite-independante-conjoint");
    answers = answerQuestion(Q, answers, "type-activite-independante-conjoint", "liberale");
    expect(getNextQuestion(Q, answers)?.id).toBe("chiffre-affaires-independant-2025-conjoint");
    answers = answerQuestion(Q, answers, "chiffre-affaires-independant-2025-conjoint", 8_000);
    expect(getNextQuestion(Q, answers)).toBeUndefined();
  });
});

describe("getPreviousQuestion", () => {
  it("is undefined from the first question", () => {
    expect(getPreviousQuestion(Q, {}, "situation-conjugale")).toBeUndefined();
  });

  it("returns the first question from the second, on the célibataire branch", () => {
    const answers: Answers = { "situation-conjugale": "celibataire" };
    expect(getPreviousQuestion(Q, answers, "revenus")?.id).toBe("situation-conjugale");
  });

  it("returns nombre-enfants-a-charge from revenus, on the couple branch", () => {
    const answers: Answers = { "situation-conjugale": "couple" };
    expect(getPreviousQuestion(Q, answers, "revenus")?.id).toBe("nombre-enfants-a-charge");
  });

  it("returns revenus from fiche-paie-disponible", () => {
    const answers: Answers = { "situation-conjugale": "celibataire", revenus: ["salaire"] };
    expect(getPreviousQuestion(Q, answers, "fiche-paie-disponible")?.id).toBe("revenus");
  });

  it("returns activites-annexes from qui-activite-independante", () => {
    const answers: Answers = {
      "situation-conjugale": "couple",
      "nombre-enfants-a-charge": 0,
      revenus: [],
      "revenus-conjoint": [],
      "activites-annexes": ["micro-entreprise"],
    };
    expect(getPreviousQuestion(Q, answers, "qui-activite-independante")?.id).toBe(
      "activites-annexes",
    );
  });
});

describe("answerQuestion (cascade clear)", () => {
  it("clears couple-only answers when situation-conjugale flips to célibataire, but keeps revenus/activites-annexes and their details", () => {
    let answers: Answers = {
      "situation-conjugale": "couple",
      "nombre-enfants-a-charge": 2,
      revenus: ["salaire"],
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 30_000,
      "revenus-conjoint": ["chomage"],
      "montant-chomage-2025-conjoint": 6_000,
      "activites-annexes": ["foncier"],
      "montant-foncier-2025": 6_000,
    };
    answers = answerQuestion(Q, answers, "situation-conjugale", "celibataire");
    expect(answers).toEqual({
      "situation-conjugale": "celibataire",
      revenus: ["salaire"],
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 30_000,
      "activites-annexes": ["foncier"],
      "montant-foncier-2025": 6_000,
    });
  });

  it("clears fiche-paie-disponible and the salary amount when revenus drops 'salaire', but keeps other checked amounts", () => {
    let answers: Answers = {
      "situation-conjugale": "celibataire",
      revenus: ["salaire", "chomage"],
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 28_000,
      "montant-chomage-2025": 3_000,
    };
    answers = answerQuestion(Q, answers, "revenus", ["chomage"]);
    expect(answers).toEqual({
      "situation-conjugale": "celibataire",
      revenus: ["chomage"],
      "montant-chomage-2025": 3_000,
    });
  });

  it("clears qui-activite-independante and both detail branches when activites-annexes drops 'micro-entreprise', but keeps foncier", () => {
    let answers: Answers = {
      "situation-conjugale": "couple",
      "nombre-enfants-a-charge": 0,
      revenus: [],
      "revenus-conjoint": [],
      "activites-annexes": ["foncier", "micro-entreprise"],
      "montant-foncier-2025": 6_000,
      "qui-activite-independante": ["toi", "conjoint"],
      "type-activite-independante": "vente",
      "chiffre-affaires-independant-2025": 10_000,
      "type-activite-independante-conjoint": "liberale",
      "chiffre-affaires-independant-2025-conjoint": 8_000,
    };
    answers = answerQuestion(Q, answers, "activites-annexes", ["foncier"]);
    expect(answers).toEqual({
      "situation-conjugale": "couple",
      "nombre-enfants-a-charge": 0,
      revenus: [],
      "revenus-conjoint": [],
      "activites-annexes": ["foncier"],
      "montant-foncier-2025": 6_000,
    });
  });

  it("clears only the conjoint's activity detail when qui-activite-independante drops 'conjoint'", () => {
    let answers: Answers = {
      "situation-conjugale": "couple",
      "nombre-enfants-a-charge": 0,
      revenus: [],
      "revenus-conjoint": [],
      "activites-annexes": ["micro-entreprise"],
      "qui-activite-independante": ["toi", "conjoint"],
      "type-activite-independante": "vente",
      "chiffre-affaires-independant-2025": 10_000,
      "type-activite-independante-conjoint": "liberale",
      "chiffre-affaires-independant-2025-conjoint": 8_000,
    };
    answers = answerQuestion(Q, answers, "qui-activite-independante", ["toi"]);
    expect(answers).toEqual({
      "situation-conjugale": "couple",
      "nombre-enfants-a-charge": 0,
      revenus: [],
      "revenus-conjoint": [],
      "activites-annexes": ["micro-entreprise"],
      "qui-activite-independante": ["toi"],
      "type-activite-independante": "vente",
      "chiffre-affaires-independant-2025": 10_000,
    });
  });

  it("clears the net-imposable answer when fiche-paie-disponible flips to false", () => {
    let answers: Answers = {
      "situation-conjugale": "celibataire",
      revenus: ["salaire"],
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 28_000,
    };
    answers = answerQuestion(Q, answers, "fiche-paie-disponible", false);
    expect(answers).toEqual({
      "situation-conjugale": "celibataire",
      revenus: ["salaire"],
      "fiche-paie-disponible": false,
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

  it("is true once a célibataire with nothing checked is fully answered", () => {
    const answers: Answers = {
      "situation-conjugale": "celibataire",
      revenus: [],
      "activites-annexes": [],
    };
    expect(isQuestionnaireComplete(Q, answers)).toBe(true);
  });

  it("is true once a couple with nothing checked anywhere is fully answered", () => {
    const answers: Answers = {
      "situation-conjugale": "couple",
      "nombre-enfants-a-charge": 1,
      revenus: [],
      "revenus-conjoint": [],
      "activites-annexes": [],
    };
    expect(isQuestionnaireComplete(Q, answers)).toBe(true);
  });
});

describe("getProgress", () => {
  it("reports 1 of 1 on the first question", () => {
    expect(getProgress(Q, {}, "situation-conjugale")).toEqual({ position: 1, total: 1 });
  });

  it("reports 2 of 5 on nombre-enfants-a-charge for a couple", () => {
    // total = 5 dès ce stade : revenus, revenus-conjoint et activites-annexes sont
    // déjà visibles (ne dépendent que de situation-conjugale), même s'ils ne sont
    // atteints qu'après dans l'ordre du tableau.
    const answers: Answers = { "situation-conjugale": "couple" };
    expect(getProgress(Q, answers, "nombre-enfants-a-charge")).toEqual({ position: 2, total: 5 });
  });

  it("reports position = total when complete (currentQuestionId undefined)", () => {
    const answers: Answers = {
      "situation-conjugale": "celibataire",
      revenus: [],
      "activites-annexes": [],
    };
    expect(getProgress(Q, answers, undefined)).toEqual({ position: 3, total: 3 });
  });
});
