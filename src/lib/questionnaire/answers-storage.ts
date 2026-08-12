import { CURRENT_TAX_YEAR } from "../tax-rules/registry";
import type { Answers } from "../tax-rules/types";
import { readJSON, removeItem, writeJSON } from "../storage/safe-json-storage";

export const ANSWERS_STORAGE_KEY = `appfiscale.answers.${CURRENT_TAX_YEAR}.v2`;

export function loadAnswers(): Answers {
  return readJSON<Answers>(ANSWERS_STORAGE_KEY, {});
}

export function saveAnswers(answers: Answers): void {
  writeJSON(ANSWERS_STORAGE_KEY, answers);
}

export function clearAnswers(): void {
  removeItem(ANSWERS_STORAGE_KEY);
}
