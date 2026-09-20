export interface RequirementAnalysisResult {
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

export interface RequirementInput {
  projectId: string;
  title: string;
  description: string;
  userStory?: string;
  applicationModule?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  acceptanceCriteria?: string;
  additionalContext?: string;
}

export type RequirementUpdateInput = Partial<RequirementInput>;
