import { describe, expect, it } from "vitest";
import { UnsupportedSituationError } from "../errors";
import { computeDeclaration, computeProgressiveTax, computeTaxableIncome } from "./compute";
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

describe("computeProgressiveTax (barème + décote 2025, 1 part)", () => {
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

describe("computeDeclaration (2025, single filer / one salary / 10% abattement)", () => {
  it("produces the three expected lines for a 28 000€ net imposable salary (exact path)", () => {
    const result = computeDeclaration(
      {
        "situation-familiale-simple": true,
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

  it("produces the same downstream result via the estimation path (35 000€ brut -> 28 000€ estimé)", () => {
    const result = computeDeclaration(
      {
        "situation-familiale-simple": true,
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

  it("rejects a year even when situation-familiale-simple would also be unsupported (year check runs first)", () => {
    expect(() => computeDeclaration({ "situation-familiale-simple": false }, 2024)).not.toThrow(
      UnsupportedSituationError,
    );
  });

  it("throws UnsupportedSituationError when situation-familiale-simple is false", () => {
    expect(() => computeDeclaration({ "situation-familiale-simple": false }, 2025)).toThrow(
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
