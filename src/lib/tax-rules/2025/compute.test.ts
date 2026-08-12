import { describe, expect, it } from "vitest";
import { UnsupportedSituationError } from "../errors";
import {
  computeDeclaration,
  computeParts,
  computeProgressiveTax,
  computeTaxableIncome,
  resolveChomage,
} from "./compute";
import { estimateNetImposableFromBrut } from "./estimation";

describe("computeTaxableIncome (abattement 10%, revenus 2025)", () => {
  it("applies a plain 10% when between floor and ceiling", () => {
    expect(computeTaxableIncome(12_000)).toBe(10_800);
  });
  it("applies the 509€ floor when 10% would be lower", () => {
    expect(computeTaxableIncome(4_000)).toBe(3_491);
  });
  it("applies the 14 555€ ceiling when 10% would exceed it", () => {
    expect(computeTaxableIncome(200_000)).toBe(185_445);
  });
});

describe("computeProgressiveTax (barème + décote célibataire 2025, 1 part)", () => {
  it("is zero below the first bracket threshold", () => {
    expect(computeProgressiveTax(10_800)).toBe(0);
  });
  it("is fully absorbed by the décote for a small tax base", () => {
    expect(computeProgressiveTax(3_491)).toBe(0);
  });
  it("partially reduces a mid-11%-bracket tax via the décote (typical single earner)", () => {
    expect(computeProgressiveTax(25_200)).toBe(1_276);
  });
  it("computes a squarely-in-30%-bracket amount, décote inactive", () => {
    expect(computeProgressiveTax(36_000)).toBe(3_904);
  });
  it("computes across all five brackets", () => {
    expect(computeProgressiveTax(185_445)).toBe(59_974);
  });
});

describe("estimateNetImposableFromBrut", () => {
  it("applies the 80% heuristic ratio", () => {
    expect(estimateNetImposableFromBrut(35_000)).toBe(28_000);
  });
});

describe("computeParts (quotient familial, cas général)", () => {
  it("is 1 for a single filer", () => {
    expect(computeParts({ "situation-conjugale": "celibataire" })).toBe(1);
  });
  it("ignores a stray nombre-enfants-a-charge for a single filer (parent isolé non supporté)", () => {
    expect(
      computeParts({ "situation-conjugale": "celibataire", "nombre-enfants-a-charge": 2 }),
    ).toBe(1);
  });
  it("is 2 for a couple with no children", () => {
    expect(computeParts({ "situation-conjugale": "couple" })).toBe(2);
  });
  it("adds a half-part for the 1st child", () => {
    expect(
      computeParts({ "situation-conjugale": "couple", "nombre-enfants-a-charge": 1 }),
    ).toBe(2.5);
  });
  it("adds a half-part for the 2nd child", () => {
    expect(
      computeParts({ "situation-conjugale": "couple", "nombre-enfants-a-charge": 2 }),
    ).toBe(3);
  });
  it("adds a full part for the 3rd child onward", () => {
    expect(
      computeParts({ "situation-conjugale": "couple", "nombre-enfants-a-charge": 3 }),
    ).toBe(4);
  });
});

describe("computeDeclaration (2025, célibataire / un salaire / abattement 10%)", () => {
  it("produces the three expected lines for a 28 000€ net imposable salary (exact path)", () => {
    const result = computeDeclaration(
      {
        "situation-conjugale": "celibataire",
        "fiche-paie-disponible": true,
        "salaire-net-imposable-2025": 28_000,
      },
      2025,
    );
    expect(result.lines).toEqual([
      expect.objectContaining({ code: "1AJ", value: 28_000 }),
      expect.objectContaining({ value: 25_200 }),
      expect.objectContaining({ value: 1_276 }),
    ]);
    expect(result.warnings).toBeUndefined();
  });

  it("ignores a stray nombre-enfants-a-charge answer on the célibataire branch", () => {
    const result = computeDeclaration(
      {
        "situation-conjugale": "celibataire",
        "nombre-enfants-a-charge": 2,
        "fiche-paie-disponible": true,
        "salaire-net-imposable-2025": 28_000,
      },
      2025,
    );
    expect(result.lines).toEqual([
      expect.objectContaining({ code: "1AJ", value: 28_000 }),
      expect.objectContaining({ value: 25_200 }),
      expect.objectContaining({ value: 1_276 }),
    ]);
  });

  it("produces the same downstream result via the estimation path (35 000€ brut -> 28 000€ estimé)", () => {
    const result = computeDeclaration(
      {
        "situation-conjugale": "celibataire",
        "fiche-paie-disponible": false,
        "salaire-brut-annuel-2025": 35_000,
      },
      2025,
    );
    expect(result.lines).toEqual([
      expect.objectContaining({ code: undefined, value: 28_000 }),
      expect.objectContaining({ value: 25_200 }),
      expect.objectContaining({ value: 1_276 }),
    ]);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings?.[0]).toMatch(/estimation/i);
  });

  it("rejects an unsupported tax year", () => {
    expect(() => computeDeclaration({}, 2024)).toThrow();
  });

  it("rejects a year even when situation-conjugale would also be unsupported (year check runs first)", () => {
    expect(() =>
      computeDeclaration({ "situation-conjugale": "autre" }, 2024),
    ).not.toThrow(UnsupportedSituationError);
  });

  it("throws UnsupportedSituationError when situation-conjugale is 'autre'", () => {
    expect(() => computeDeclaration({ "situation-conjugale": "autre" }, 2025)).toThrow(
      UnsupportedSituationError,
    );
  });

  it("throws UnsupportedSituationError with a plain-language message for an empty (dead-end) answer set", () => {
    expect(() => computeDeclaration({}, 2025)).toThrow(UnsupportedSituationError);
    try {
      computeDeclaration({}, 2025);
    } catch (e) {
      expect(e).toBeInstanceOf(UnsupportedSituationError);
      expect((e as Error).message.length).toBeGreaterThan(0);
    }
  });
});

describe("computeDeclaration (2025, couple, second salary, quotient familial)", () => {
  it("sums both salaries (1AJ + 1BJ) with each their own abattement, no children", () => {
    const result = computeDeclaration(
      {
        "situation-conjugale": "couple",
        "nombre-enfants-a-charge": 0,
        "fiche-paie-disponible": true,
        "salaire-net-imposable-2025": 20_000,
        "conjoint-a-un-salaire": true,
        "fiche-paie-disponible-conjoint": true,
        "salaire-net-imposable-2025-conjoint": 20_000,
      },
      2025,
    );
    expect(result.lines).toEqual([
      expect.objectContaining({ code: "1AJ", value: 20_000 }),
      expect.objectContaining({ code: "1BJ", value: 20_000 }),
      expect.objectContaining({ value: 36_000 }), // 2 x (20 000 - 2 000 abattement)
      expect.objectContaining({ value: 562 }), // décote couple, pas décote célibataire
    ]);
    expect(result.warnings).toBeUndefined();
  });

  it("has no 1BJ line and applies 2 parts to a single salary when the conjoint has none", () => {
    const result = computeDeclaration(
      {
        "situation-conjugale": "couple",
        "fiche-paie-disponible": true,
        "salaire-net-imposable-2025": 45_000,
        "conjoint-a-un-salaire": false,
      },
      2025,
    );
    expect(result.lines).toEqual([
      expect.objectContaining({ code: "1AJ", value: 45_000 }),
      expect.objectContaining({ value: 40_500 }),
      expect.objectContaining({ value: 1_281 }),
    ]);
    expect(result.warnings).toBeUndefined();
  });

  it("does not cap the quotient familial benefit when the reduction stays under the ceiling", () => {
    const result = computeDeclaration(
      {
        "situation-conjugale": "couple",
        "nombre-enfants-a-charge": 1,
        "fiche-paie-disponible": true,
        "salaire-net-imposable-2025": 30_000,
        "conjoint-a-un-salaire": true,
        "fiche-paie-disponible-conjoint": true,
        "salaire-net-imposable-2025-conjoint": 30_000,
      },
      2025,
    );
    const taxLine = result.lines.at(-1);
    expect(taxLine).toEqual(expect.objectContaining({ value: 2_511 }));
    expect(result.warnings).toBeUndefined();
  });

  it("caps the quotient familial benefit when the reduction exceeds the legal ceiling (high income)", () => {
    const result = computeDeclaration(
      {
        "situation-conjugale": "couple",
        "nombre-enfants-a-charge": 2,
        "fiche-paie-disponible": true,
        "salaire-net-imposable-2025": 90_000,
        "conjoint-a-un-salaire": true,
        "fiche-paie-disponible-conjoint": true,
        "salaire-net-imposable-2025-conjoint": 90_000,
      },
      2025,
    );
    expect(result.lines).toEqual([
      expect.objectContaining({ code: "1AJ", value: 90_000 }),
      expect.objectContaining({ code: "1BJ", value: 90_000 }),
      expect.objectContaining({ value: 162_000 }),
      expect.objectContaining({ value: 31_194 }),
    ]);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings?.[0]).toMatch(/plafonn/i);
  });
});

describe("resolveChomage", () => {
  it("is 0 when chomage is not declared", () => {
    expect(resolveChomage({})).toBe(0);
    expect(resolveChomage({ chomage: false, "montant-chomage-2025": 5_000 })).toBe(0);
  });
  it("reads the declared amount when chomage is true", () => {
    expect(resolveChomage({ chomage: true, "montant-chomage-2025": 5_000 })).toBe(5_000);
  });
  it("supports the conjoint suffix independently", () => {
    expect(
      resolveChomage(
        { "chomage-conjoint": true, "montant-chomage-2025-conjoint": 8_000 },
        "-conjoint",
      ),
    ).toBe(8_000);
  });
});

describe("computeDeclaration (2025, allocations chômage — case 1AP/1BP)", () => {
  it("pools salary and chômage under a single abattement (1AJ + 1AP, célibataire)", () => {
    const result = computeDeclaration(
      {
        "situation-conjugale": "celibataire",
        "fiche-paie-disponible": true,
        "salaire-net-imposable-2025": 20_000,
        chomage: true,
        "montant-chomage-2025": 5_000,
      },
      2025,
    );
    expect(result.lines).toEqual([
      expect.objectContaining({ code: "1AJ", value: 20_000 }),
      expect.objectContaining({ code: "1AP", value: 5_000 }),
      expect.objectContaining({ value: 22_500 }), // (20 000 + 5 000) - 2 500 abattement
      expect.objectContaining({}),
    ]);
  });

  it("has no 1AJ/1BJ line for a celibataire with chômage only (no salary)", () => {
    const result = computeDeclaration(
      {
        "situation-conjugale": "celibataire",
        "fiche-paie-disponible": true,
        "salaire-net-imposable-2025": 0,
        chomage: true,
        "montant-chomage-2025": 12_000,
      },
      2025,
    );
    expect(result.lines[0]).toEqual(expect.objectContaining({ code: "1AJ", value: 0 }));
    expect(result.lines[1]).toEqual(expect.objectContaining({ code: "1AP", value: 12_000 }));
  });

  it("adds a 1BP line without a 1BJ line when the conjoint has chômage but no salary", () => {
    const result = computeDeclaration(
      {
        "situation-conjugale": "couple",
        "nombre-enfants-a-charge": 0,
        "fiche-paie-disponible": true,
        "salaire-net-imposable-2025": 20_000,
        "conjoint-a-un-salaire": false,
        "chomage-conjoint": true,
        "montant-chomage-2025-conjoint": 8_000,
      },
      2025,
    );
    const codes = result.lines.map((l) => l.code);
    expect(codes).not.toContain("1BJ");
    expect(codes).toContain("1BP");
    const bpLine = result.lines.find((l) => l.code === "1BP");
    expect(bpLine).toEqual(expect.objectContaining({ value: 8_000 }));
    // Le conjoint (8 000 - 800 abattement = 7 200) doit contribuer au revenu imposable total.
    const taxableIncomeLine = result.lines.find((l) => l.code === undefined && l.value !== bpLine?.value);
    expect(taxableIncomeLine?.value).toBeGreaterThan(computeTaxableIncome(20_000));
  });

  it("does not add 1AP/1BP lines when chômage is not declared (regression)", () => {
    const result = computeDeclaration(
      {
        "situation-conjugale": "celibataire",
        "fiche-paie-disponible": true,
        "salaire-net-imposable-2025": 28_000,
      },
      2025,
    );
    expect(result.lines.map((l) => l.code)).toEqual(["1AJ", undefined, undefined]);
  });
});
