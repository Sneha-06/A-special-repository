export const REFACTOR_OPTIONS = [
  { value: "readability", label: "Improve readability" },
  { value: "performance", label: "Improve performance" },
  { value: "react-patterns", label: "Improve React patterns" },
  { value: "typescript", label: "Improve TypeScript" },
  { value: "security", label: "Improve security" },
  { value: "accessibility", label: "Improve accessibility" },
  { value: "reduce-duplication", label: "Reduce duplication" },
] as const;

export type RefactorOption = (typeof REFACTOR_OPTIONS)[number]["value"];

export interface RefactorIssueInput {
  id?: string;
  title?: string;
  description?: string;
  severity?: string;
  category?: string;
  suggestion?: string;
}

export interface RefactorResult {
  summary: string;
  improvements: string[];
  beforeCode: string;
  afterCode: string;
  explanation: string;
}

export interface CreateRefactorRequest {
  code: string;
  language: string;
  framework: string;
  issues?: RefactorIssueInput[];
  fileName?: string;
  options?: RefactorOption | RefactorOption[];
}
