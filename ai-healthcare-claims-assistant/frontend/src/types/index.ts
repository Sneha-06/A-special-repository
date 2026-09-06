export type ClaimStatus = "APPROVED" | "REJECTED" | "PENDING" | "REVIEW";

export interface MemberSummary {
  memberId: string;
  name: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth: string;
  planName: string;
  eligibilityStatus: string;
  groupNumber: string;
}

export interface ProviderSummary {
  providerId: string;
  name: string;
  npi: string;
  specialty: string;
  networkStatus: string;
}

export interface Rule {
  id?: string;
  ruleId: string;
  name: string;
  category: string;
  effectiveDate: string;
  status: string;
  description: string;
  eligibilityConditions: string;
  authorizationRequirements: string;
  serviceRestrictions: string;
  coverageConditions: string;
}

export interface TimelineEvent {
  label: string;
  at: string | null;
  state: string;
}

export interface Claim {
  claimId: string;
  serviceCode: string;
  serviceName: string;
  serviceDate: string;
  submittedAmount: number;
  approvedAmount: number;
  status: ClaimStatus;
  rejectionReason: string | null;
  timeline: TimelineEvent[];
  missingInformation: string[] | null;
  member: MemberSummary;
  provider: ProviderSummary;
  applicableRule: Rule | null;
}

export interface Paginated<T> {
  total: number;
  page: number;
  pageSize: number;
  items: T[];
}

export interface AiSource {
  type: "claim" | "rule" | "document";
  id: string;
  title: string;
}

export interface AiResponse {
  answer: string;
  claimId?: string | null;
  ruleId?: string | null;
  confidence: number;
  sources: AiSource[];
  recommendations: string[];
  simpleExplanation?: string;
  triggeredCondition?: string;
  missingInformation?: string[];
  recommendedAction?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface InsightsPayload {
  totals: {
    total: number;
    APPROVED: number;
    REJECTED: number;
    PENDING: number;
    REVIEW: number;
  };
  topReasons: Array<{ reason: string; count: number }>;
  rulesCausingRejections: Array<{ ruleId: string; name: string; count: number }>;
  rejectionTrend: Array<{ month: string; rejected: number; total: number }>;
  reviewClaims: Array<{
    claimId: string;
    serviceName: string;
    submittedAmount: number;
    status: string;
  }>;
  cards: Array<{ title: string; detail: string; severity: string }>;
}
