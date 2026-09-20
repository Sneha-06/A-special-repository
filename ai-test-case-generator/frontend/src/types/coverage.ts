export interface RecommendedTestCase {
  title: string;
  category?: string;
  rationale?: string;
}

export interface CoveredRequirement {
  id: string;
  title: string;
  testCaseCount: number;
  acceptanceCriteriaCount: number;
}

export interface MissingCoverageItem {
  requirementId: string;
  title: string;
  reason: string;
}

export interface TraceabilityRow {
  requirementId: string;
  requirementTitle: string;
  acceptanceCriteriaId: string | null;
  acceptanceCriteriaKey: string | null;
  acceptanceCriteriaSummary: string;
  testCaseId: string | null;
  testCaseTitle: string | null;
  automation: string | null;
  covered: boolean;
}

export interface CoverageSummary {
  totalRequirements: number;
  requirementsWithTests: number;
  totalAcceptanceCriteria: number;
  coveredAcceptanceCriteria: number;
  totalTestCases: number;
  automatedTestCases: number;
}

export interface CoverageAnalysisResult {
  projectId: string;
  projectName: string;
  coverageScore: number;
  coveredAreas: string[];
  missingAreas: string[];
  missingTestScenarios: RecommendedTestCase[];
  recommendations: string[];
  securityGaps: string[];
  edgeCaseGaps: string[];
  regressionGaps: string[];
  coveredRequirements: CoveredRequirement[];
  missingCoverage: MissingCoverageItem[];
  recommendedTestCases: RecommendedTestCase[];
  traceability: TraceabilityRow[];
  summary: CoverageSummary;
  analyzedAt: string;
}
