import { computeDeclaration as computeDeclaration2025 } from "./2025/compute";
import { QUESTIONS_2025 } from "./2025/questions";
import type { Answers, DeclarationResult, Question } from "./types";

export interface TaxYearModule {
  year: number;
  questions: Question[];
  computeDeclaration: (answers: Answers) => DeclarationResult;
}

const REGISTRY: Record<number, TaxYearModule> = {
  2025: {
    year: 2025,
    questions: QUESTIONS_2025,
    computeDeclaration: (answers) => computeDeclaration2025(answers, 2025),
  },
};

export function getTaxYearModule(year: number): TaxYearModule {
  const mod = REGISTRY[year];
  if (!mod) {
    throw new Error(`Année fiscale non supportée : ${year}`);
  }
  return mod;
}
