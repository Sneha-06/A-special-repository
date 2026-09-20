export interface FlowStep {
  step: number;
  title: string;
  description: string;
}

export interface KeyFunction {
  name: string;
  description: string;
  parameters: string[];
  returns?: string;
}

export interface PotentialIssue {
  title: string;
  description: string;
  severity?: "low" | "medium" | "high";
}

export interface CodeExplanation {
  summary: string;
  purpose: string;
  architecture: string;
  flow: FlowStep[];
  dependencies: string[];
  potentialIssues: PotentialIssue[];
  keyFunctions: KeyFunction[];
}

export interface ExplainCodeRequest {
  code: string;
  language: string;
  context?: string;
}
