import { Prisma, RuleStatus } from "@prisma/client";
import { prisma } from "../database/prisma";
import { getAIProvider } from "../ai/providerFactory";
import { buildContext } from "../rag/contextBuilder";
import { buildPrompt } from "../rag/promptBuilder";
import { HttpError } from "../utils/httpError";

export async function listRules(query: {
  search?: string;
  category?: string;
  status?: string;
  sort?: string;
  order?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(50, Math.max(5, query.pageSize ?? 12));
  const sort = query.sort === "effectiveDate" ? "effectiveDate" : "ruleId";
  const order = query.order === "desc" ? "desc" : "asc";

  const where: Prisma.MandateRuleWhereInput = {};
  if (query.status && query.status !== "ALL") {
    where.status = query.status as RuleStatus;
  }
  if (query.category && query.category !== "ALL") {
    where.category = query.category;
  }
  if (query.search) {
    const term = query.search.trim();
    where.OR = [
      { ruleId: { contains: term, mode: "insensitive" } },
      { name: { contains: term, mode: "insensitive" } },
      { description: { contains: term, mode: "insensitive" } },
      { category: { contains: term, mode: "insensitive" } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.mandateRule.count({ where }),
    prisma.mandateRule.findMany({
      where,
      orderBy: { [sort]: order },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return { total, page, pageSize, items };
}

export async function getRule(ruleId: string) {
  const rule = await prisma.mandateRule.findUnique({ where: { ruleId } });
  if (!rule) throw new HttpError(404, `Rule ${ruleId} not found`);
  return rule;
}

export async function compareRules(leftId: string, rightId: string) {
  const [left, right] = await Promise.all([getRule(leftId), getRule(rightId)]);
  const differences = [
    {
      field: "Eligibility",
      left: left.eligibilityConditions,
      right: right.eligibilityConditions,
      differs: left.eligibilityConditions !== right.eligibilityConditions,
    },
    {
      field: "Authorization",
      left: left.authorizationRequirements,
      right: right.authorizationRequirements,
      differs: left.authorizationRequirements !== right.authorizationRequirements,
    },
    {
      field: "Service restrictions",
      left: left.serviceRestrictions,
      right: right.serviceRestrictions,
      differs: left.serviceRestrictions !== right.serviceRestrictions,
    },
    {
      field: "Coverage conditions",
      left: left.coverageConditions,
      right: right.coverageConditions,
      differs: left.coverageConditions !== right.coverageConditions,
    },
    {
      field: "Effective date",
      left: left.effectiveDate.toISOString().slice(0, 10),
      right: right.effectiveDate.toISOString().slice(0, 10),
      differs: left.effectiveDate.getTime() !== right.effectiveDate.getTime(),
    },
  ];

  const context = buildContext([
    {
      kind: "rule",
      ruleId: left.ruleId,
      name: left.name,
      category: left.category,
      eligibilityConditions: left.eligibilityConditions,
      authorizationRequirements: left.authorizationRequirements,
      coverageConditions: left.coverageConditions,
      serviceRestrictions: left.serviceRestrictions,
      description: left.description,
      score: 1,
    },
    {
      kind: "rule",
      ruleId: right.ruleId,
      name: right.name,
      category: right.category,
      eligibilityConditions: right.eligibilityConditions,
      authorizationRequirements: right.authorizationRequirements,
      coverageConditions: right.coverageConditions,
      serviceRestrictions: right.serviceRestrictions,
      description: right.description,
      score: 1,
    },
  ]);
  const provider = getAIProvider();
  const aiSummary = await provider.generate({
    messages: buildPrompt(
      `Compare Rule ${left.ruleId} and ${right.ruleId}. Summarize key differences.`,
      context,
    ),
    retrievedContext: context,
  });

  return { left, right, differences, aiSummary, provider: provider.name };
}
