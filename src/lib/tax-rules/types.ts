export type QuestionId = string;
export type AnswerValue = string | number | boolean | string[] | undefined;
export type Answers = Record<QuestionId, AnswerValue>;

export type QuestionType = "boolean" | "number" | "single-choice" | "multi-choice";

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

/**
 * Taux de prélèvement à la source (CGI art. 204 H), en pourcentage (ex. 3.4 = 3,4%).
 * `vous`/`conjoint` (taux individualisé, par déclarant) ne sont présents qu'en
 * couple — pour un célibataire, seul `foyer` a un sens (un seul déclarant).
 */
export interface TauxPrelevementSource {
  foyer: number;
  vous?: number;
  conjoint?: number;
}

export interface DeclarationResult {
  lines: DeclarationLine[];
  /** Avertissements en langage courant, ex. quand un montant est une estimation. */
  warnings?: string[];
  tauxPrelevementSource: TauxPrelevementSource;
}
