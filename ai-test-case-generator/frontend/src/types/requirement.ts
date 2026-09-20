export type RequirementPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface ProjectSummary {
  id: string;
  name: string;
  status: string;
  description?: string | null;
}

export interface RequirementAnalysis {
  id: string;
  requirementId: string;
  summary: string;
  actors: string[];
  preconditions: string[];
  businessRules: string[];
  functionalRequirements: string[];
  nonFunctionalRequirements: string[];
  assumptions: string[];
  ambiguities: string[];
  missingInformation: string[];
  riskAreas: string[];
  createdAt: string;
}

export interface Requirement {
  id: string;
  projectId: string;
  title: string;
  description: string;
  userStory?: string | null;
  applicationModule?: string | null;
  acceptanceCriteriaText?: string | null;
  additionalContext?: string | null;
  priority: RequirementPriority;
  sourceType: string;
  createdAt: string;
  updatedAt: string;
  project?: { id: string; name: string };
  analyses?: RequirementAnalysis[];
}

export interface RequirementFormValues {
  projectId: string;
  title: string;
  description: string;
  userStory: string;
  applicationModule: string;
  priority: RequirementPriority;
  acceptanceCriteria: string;
  additionalContext: string;
}

export interface AnalysisResult {
  summary: string;
  actors: string[];
  preconditions: string[];
  businessRules: string[];
  functionalRequirements: string[];
  nonFunctionalRequirements: string[];
  assumptions: string[];
  ambiguities: string[];
  missingInformation: string[];
  riskAreas: string[];
}

export interface AnalyzeResponse {
  analysis: RequirementAnalysis;
  result: AnalysisResult;
}
