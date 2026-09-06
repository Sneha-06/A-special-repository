import { ClaimStatus, Prisma } from "@prisma/client";
import { prisma } from "../database/prisma";
import { getAIProvider } from "../ai/providerFactory";
import { buildContext } from "../rag/contextBuilder";
import { buildPrompt } from "../rag/promptBuilder";
import { HttpError } from "../utils/httpError";

const sortable = new Set(["claimId", "serviceDate", "submittedAmount", "status"]);

export async function listClaims(query: {
  search?: string;
  status?: string;
  from?: string;
  to?: string;
  sort?: string;
  order?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(50, Math.max(5, query.pageSize ?? 10));
  const sort = sortable.has(query.sort ?? "") ? (query.sort as string) : "serviceDate";
  const order = query.order === "asc" ? "asc" : "desc";

  const where: Prisma.ClaimWhereInput = {};
  if (query.status && query.status !== "ALL") {
    where.status = query.status as ClaimStatus;
  }
  if (query.from || query.to) {
    where.serviceDate = {};
    if (query.from) where.serviceDate.gte = new Date(query.from);
    if (query.to) where.serviceDate.lte = new Date(query.to);
  }
  if (query.search) {
    const term = query.search.trim();
    where.OR = [
      { claimId: { contains: term, mode: "insensitive" } },
      { serviceName: { contains: term, mode: "insensitive" } },
      { rejectionReason: { contains: term, mode: "insensitive" } },
      { member: { memberId: { contains: term, mode: "insensitive" } } },
      { provider: { name: { contains: term, mode: "insensitive" } } },
    ];
  }

  const [total, rows] = await Promise.all([
    prisma.claim.count({ where }),
    prisma.claim.findMany({
      where,
      include: {
        member: true,
        provider: true,
        applicableRule: true,
      },
      orderBy: { [sort]: order },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    total,
    page,
    pageSize,
    items: rows.map(serializeClaim),
  };
}

export async function getClaimByClaimId(claimId: string) {
  const claim = await prisma.claim.findUnique({
    where: { claimId },
    include: { member: true, provider: true, applicableRule: true },
  });
  if (!claim) throw new HttpError(404, `Claim ${claimId} not found`);
  return serializeClaim(claim);
}

export async function analyzeClaim(claimId: string) {
  const claim = await getClaimByClaimId(claimId);
  const rule = claim.applicableRule;
  const question = `Why was claim ${claimId} ${claim.status.toLowerCase()}? What rule applies and what should be reviewed before resubmitting?`;
  const context = buildContext(
    rule
      ? [
          {
            kind: "claim",
            claimId: claim.claimId,
            status: claim.status,
            rejectionReason: claim.rejectionReason,
            serviceName: claim.serviceName,
            ruleId: rule.ruleId,
            score: 1,
          },
          {
            kind: "rule",
            ruleId: rule.ruleId,
            name: rule.name,
            category: rule.category,
            eligibilityConditions: rule.eligibilityConditions,
            authorizationRequirements: rule.authorizationRequirements,
            coverageConditions: rule.coverageConditions,
            serviceRestrictions: rule.serviceRestrictions,
            description: rule.description,
            score: 1,
          },
        ]
      : [
          {
            kind: "claim",
            claimId: claim.claimId,
            status: claim.status,
            rejectionReason: claim.rejectionReason,
            serviceName: claim.serviceName,
            ruleId: null,
            score: 1,
          },
        ],
  );
  const provider = getAIProvider();
  const response = await provider.generate({
    messages: buildPrompt(question, context),
    retrievedContext: context,
  });

  return {
    claim,
    analysis: {
      ...response,
      triggeredCondition:
        claim.status === "REJECTED"
          ? claim.rejectionReason ?? "Eligibility or coverage condition not satisfied"
          : "No rejection condition triggered",
      missingInformation: claim.missingInformation ?? [],
      recommendedAction: response.recommendations[0] ?? "No additional action required.",
    },
    provider: provider.name,
  };
}

function serializeClaim(claim: {
  claimId: string;
  serviceCode: string;
  serviceName: string;
  serviceDate: Date;
  submittedAmount: Prisma.Decimal;
  approvedAmount: Prisma.Decimal;
  status: ClaimStatus;
  rejectionReason: string | null;
  timeline: Prisma.JsonValue;
  missingInformation: Prisma.JsonValue;
  member: {
    memberId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    planName: string;
    eligibilityStatus: string;
    groupNumber: string;
  };
  provider: {
    providerId: string;
    name: string;
    npi: string;
    specialty: string;
    networkStatus: string;
  };
  applicableRule: {
    ruleId: string;
    name: string;
    category: string;
    description: string;
    eligibilityConditions: string;
    authorizationRequirements: string;
    serviceRestrictions: string;
    coverageConditions: string;
    effectiveDate: Date;
    status: string;
  } | null;
}) {
  return {
    claimId: claim.claimId,
    serviceCode: claim.serviceCode,
    serviceName: claim.serviceName,
    serviceDate: claim.serviceDate,
    submittedAmount: Number(claim.submittedAmount),
    approvedAmount: Number(claim.approvedAmount),
    status: claim.status,
    rejectionReason: claim.rejectionReason,
    timeline: claim.timeline,
    missingInformation: claim.missingInformation,
    member: {
      memberId: claim.member.memberId,
      name: `${claim.member.firstName} ${claim.member.lastName}`,
      firstName: claim.member.firstName,
      lastName: claim.member.lastName,
      dateOfBirth: claim.member.dateOfBirth,
      planName: claim.member.planName,
      eligibilityStatus: claim.member.eligibilityStatus,
      groupNumber: claim.member.groupNumber,
    },
    provider: claim.provider,
    applicableRule: claim.applicableRule,
  };
}
