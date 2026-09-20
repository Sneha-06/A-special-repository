export type GenerationType =
  | "REQUIREMENT_ANALYSIS"
  | "ACCEPTANCE_CRITERIA"
  | "TEST_CASES"
  | "SYNTHETIC_TEST_DATA"
  | "AUTOMATION_CODE"
  | "COVERAGE_ANALYSIS";

export type GenerationStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface GenerationHistoryItem {
  id: string;
  requirementId: string;
  requirementTitle: string;
  projectId: string;
  projectName: string;
  generationType: GenerationType;
  generationTypeLabel: string;
  model: string;
  status: GenerationStatus;
  generatedItemCount: number;
  input: unknown;
  output: unknown;
  createdAt: string;
}

export interface GenerationHistoryListResponse {
  items: GenerationHistoryItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface HistoryFilters {
  page?: number;
  pageSize?: number;
  generationType?: GenerationType;
  status?: GenerationStatus;
  fromDate?: string;
  toDate?: string;
  requirementId?: string;
}
