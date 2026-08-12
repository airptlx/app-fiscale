export type QuestionId = string;
export type AnswerValue = string | number | boolean | undefined;
export type Answers = Record<QuestionId, AnswerValue>;

export type QuestionType = "boolean" | "number" | "single-choice";

export interface QuestionOption {
  value: string;
  label: string;
}

export interface Question {
  id: QuestionId;
  type: QuestionType;
  /** Langage 100% courant — jamais de jargon fiscal ni de code de case (CLAUDE.md règle 2). */
  prompt: string;
  helpText?: string;
  options?: QuestionOption[];
  /** Cette question est-elle posée, vu les réponses précédentes ? Par défaut : toujours visible. */
  isVisible?: (answers: Answers) => boolean;
  /** Message d'erreur en langage courant, ou undefined si la valeur est valide. */
  validate?: (value: AnswerValue) => string | undefined;
}

export interface DeclarationLine {
  /**
   * Code de case officiel (ex. "1AJ"). Absent pour une ligne calculée qui ne
   * correspond à aucune case remplie par l'utilisateur (ex. impôt estimé).
   */
  code?: string;
  label: string;
  value: number;
  explanation: string;
  source: string;
}

export interface DeclarationResult {
  lines: DeclarationLine[];
  /** Avertissements en langage courant, ex. quand un montant est une estimation. */
  warnings?: string[];
}
