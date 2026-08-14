import { ANNEE_REVENUS_2025 } from "./2025/constants";
import { computeDeclaration as computeDeclaration2025 } from "./2025/compute";
import { QUESTIONS_2025 } from "./2025/questions";
import type { Answers, DeclarationResult, Question } from "./types";

export const CURRENT_TAX_YEAR = ANNEE_REVENUS_2025;

export interface TaxYearModule {
  year: number;
  questions: Question[];
  computeDeclaration: (answers: Answers) => DeclarationResult;
}

const REGISTRY: Record<number, TaxYearModule> = {
  [ANNEE_REVENUS_2025]: {
    year: ANNEE_REVENUS_2025,
    questions: QUESTIONS_2025,
    computeDeclaration: (answers) => computeDeclaration2025(answers, ANNEE_REVENUS_2025),
  },
};

export function getTaxYearModule(year: number): TaxYearModule {
  const mod = REGISTRY[year];
  if (!mod) {
    throw new Error(`Année fiscale non supportée : ${year}`);
  }
  return mod;
}
