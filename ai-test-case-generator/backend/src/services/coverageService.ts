import { GenerationStatus, GenerationType, Prisma, TestCategory } from "@prisma/client";
import { analyzeCoverageWithAi } from "./ai/coverageAnalyzer";
import { buildCategoryGaps, computeCoverageScore } from "./coverageMetrics";
import type { AiCoverageResponse } from "../validators/coverageSchemas";
import { HttpError } from "../utils/httpError";
import { prisma } from "../utils/prisma";
import { env } from "../utils/env";
import type { AnalyzeCoverageBody } from "../validators/coverageSchemas";

type LoadedRequirement = {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: Array<{
    id: string;
    criteriaKey: string | null;
    given: string;
    when: string;
    then: string;
  }>;
  testCases: Array<{
    id: string;
    testCaseId: string;
    title: string;
    category: TestCategory;
    expectedResult: string;
    steps: Array<{ stepNumber: number; action: string; expectedResult: string }>;
    automationCode: Array<{ framework: string; language: string }>;
  }>;
};

function normalizeScenario(
  scenario: string | { title: string; category?: string; rationale?: string },
) {
  if (typeof scenario === "string") {
    return { title: scenario, category: undefined, rationale: undefined };
  }
  return scenario;
}

function isRequirementCovered(
  req: LoadedRequirement,
  mappings: AiCoverageResponse["acceptanceCriteriaMappings"],
): boolean {
  if (req.acceptanceCriteria.length === 0) {
    return req.testCases.length > 0;
  }

  const mappingByAcId = new Map(mappings.map((m) => [m.acceptanceCriteriaId, m]));
  return req.acceptanceCriteria.every((ac) => {
    const mapping = mappingByAcId.get(ac.id);
    return mapping?.coverageStatus === "covered" || mapping?.coverageStatus === "partial";
  });
}

function buildTraceability(
  requirements: LoadedRequirement[],
  mappings: AiCoverageResponse["acceptanceCriteriaMappings"],
) {
  const mappingByAcId = new Map(mappings.map((m) => [m.acceptanceCriteriaId, m]));
  const testCaseByPublicId = new Map<string, LoadedRequirement["testCases"][number]>();

  for (const req of requirements) {
    for (const tc of req.testCases) {
      testCaseByPublicId.set(tc.testCaseId, tc);
    }
  }

  const rows: Array<{
    requirementId: string;
    requirementTitle: string;
    acceptanceCriteriaId: string | null;
    acceptanceCriteriaKey: string | null;
    acceptanceCriteriaSummary: string;
    testCaseId: string | null;
    testCaseTitle: string | null;
    automation: string | null;
    covered: boolean;
  }> = [];

  for (const req of requirements) {
    if (req.acceptanceCriteria.length === 0) {
      const hasTests = req.testCases.length > 0;
      if (req.testCases.length === 0) {
        rows.push({
          requirementId: req.id,
          requirementTitle: req.title,
          acceptanceCriteriaId: null,
          acceptanceCriteriaKey: null,
          acceptanceCriteriaSummary: "No acceptance criteria defined",
          testCaseId: null,
          testCaseTitle: null,
          automation: null,
          covered: false,
        });
        continue;
      }

      for (const tc of req.testCases) {
        const automation = tc.automationCode[0]
          ? `${tc.automationCode[0].framework}/${tc.automationCode[0].language}`
          : null;
        rows.push({
          requirementId: req.id,
          requirementTitle: req.title,
          acceptanceCriteriaId: null,
          acceptanceCriteriaKey: null,
          acceptanceCriteriaSummary: "Requirement-level (no ACs)",
          testCaseId: tc.testCaseId,
          testCaseTitle: tc.title,
          automation,
          covered: hasTests,
        });
      }
      continue;
    }

    for (const ac of req.acceptanceCriteria) {
      const mapping = mappingByAcId.get(ac.id);
      const summary = `Given ${ac.given} → When ${ac.when} → Then ${ac.then}`;
      const covered =
        mapping?.coverageStatus === "covered" || mapping?.coverageStatus === "partial";
      const mappedIds = mapping?.mappedTestCaseIds ?? [];

      if (mappedIds.length === 0) {
        rows.push({
          requirementId: req.id,
          requirementTitle: req.title,
          acceptanceCriteriaId: ac.id,
          acceptanceCriteriaKey: ac.criteriaKey,
          acceptanceCriteriaSummary: summary,
          testCaseId: null,
          testCaseTitle: null,
          automation: null,
          covered: false,
        });
        continue;
      }

      for (const publicId of mappedIds) {
        const tc = testCaseByPublicId.get(publicId);
        const automation = tc?.automationCode[0]
          ? `${tc.automationCode[0].framework}/${tc.automationCode[0].language}`
          : null;
        rows.push({
          requirementId: req.id,
          requirementTitle: req.title,
          acceptanceCriteriaId: ac.id,
          acceptanceCriteriaKey: ac.criteriaKey,
          acceptanceCriteriaSummary: summary,
          testCaseId: publicId,
          testCaseTitle: tc?.title ?? null,
          automation,
          covered,
        });
      }
    }
  }

  return rows;
}

export async function analyzeProjectCoverage(body: AnalyzeCoverageBody) {
  const project = await prisma.project.findUnique({
    where: { id: body.projectId },
    include: {
      requirements: {
        include: {
          acceptanceCriteria: { orderBy: { createdAt: "asc" } },
          testCases: {
            include: {
              steps: { orderBy: { stepNumber: "asc" } },
              automationCode: { orderBy: { createdAt: "desc" }, take: 1 },
            },
            orderBy: { testCaseId: "asc" },
          },
        },
        orderBy: { title: "asc" },
      },
    },
  });

  if (!project) {
    throw new HttpError(404, "Project not found");
  }

  if (project.requirements.length === 0) {
    throw new HttpError(400, "Project has no requirements to analyze");
  }

  const requirements: LoadedRequirement[] = project.requirements;

  const historyEntries = await Promise.all(
    requirements.map((req) =>
      prisma.generationHistory.create({
        data: {
          requirementId: req.id,
          generationType: GenerationType.COVERAGE_ANALYSIS,
          model: env.openAiModel,
          status: GenerationStatus.PROCESSING,
          input: { projectId: body.projectId } as unknown as Prisma.InputJsonValue,
          output: {},
        },
      }),
    ),
  );

  try {
    const aiResult = await analyzeCoverageWithAi({
      projectName: project.name,
      requirements: requirements.map((req) => ({
        id: req.id,
        title: req.title,
        description: req.description,
        acceptanceCriteria: req.acceptanceCriteria,
        testCases: req.testCases.map((tc) => ({
          id: tc.id,
          testCaseId: tc.testCaseId,
          title: tc.title,
          category: tc.category,
          expectedResult: tc.expectedResult,
          steps: tc.steps,
          hasAutomation: tc.automationCode.length > 0,
        })),
      })),
    });

    const coverageScore = computeCoverageScore(requirements, aiResult.acceptanceCriteriaMappings);
    const categoryGaps = buildCategoryGaps(requirements);
    const traceability = buildTraceability(requirements, aiResult.acceptanceCriteriaMappings);

    const coveredRequirements = requirements
      .filter((req) => isRequirementCovered(req, aiResult.acceptanceCriteriaMappings))
      .map((req) => ({
        id: req.id,
        title: req.title,
        testCaseCount: req.testCases.length,
        acceptanceCriteriaCount: req.acceptanceCriteria.length,
      }));

    const missingCoverage = requirements
      .filter((req) => !isRequirementCovered(req, aiResult.acceptanceCriteriaMappings))
      .map((req) => ({
        requirementId: req.id,
        title: req.title,
        reason:
          req.testCases.length === 0
            ? "No test cases generated"
            : req.acceptanceCriteria.length === 0
              ? "Requirement has no acceptance criteria and insufficient test mapping"
              : "One or more acceptance criteria lack adequate test coverage",
      }));

    const recommendedTestCases = aiResult.missingTestScenarios.map(normalizeScenario);

    const totalAcceptanceCriteria = requirements.reduce(
      (sum, req) => sum + req.acceptanceCriteria.length,
      0,
    );
    const coveredAcceptanceCriteria = aiResult.acceptanceCriteriaMappings.filter(
      (m) => m.coverageStatus === "covered" || m.coverageStatus === "partial",
    ).length;
    const totalTestCases = requirements.reduce((sum, req) => sum + req.testCases.length, 0);
    const automatedTestCases = requirements.reduce(
      (sum, req) => sum + req.testCases.filter((tc) => tc.automationCode.length > 0).length,
      0,
    );

    const result = {
      projectId: project.id,
      projectName: project.name,
      coverageScore,
      coveredAreas: aiResult.coveredAreas,
      missingAreas: aiResult.missingAreas,
      missingTestScenarios: recommendedTestCases,
      recommendations: aiResult.recommendations,
      securityGaps: [...new Set([...categoryGaps.securityGaps, ...aiResult.securityGaps])],
      edgeCaseGaps: [...new Set([...categoryGaps.edgeCaseGaps, ...aiResult.edgeCaseGaps])],
      regressionGaps: [...new Set([...categoryGaps.regressionGaps, ...aiResult.regressionGaps])],
      coveredRequirements,
      missingCoverage,
      recommendedTestCases,
      traceability,
      summary: {
        totalRequirements: requirements.length,
        requirementsWithTests: requirements.filter((r) => r.testCases.length > 0).length,
        totalAcceptanceCriteria,
        coveredAcceptanceCriteria,
        totalTestCases,
        automatedTestCases,
      },
      analyzedAt: new Date().toISOString(),
    };

    await Promise.all(
      historyEntries.map((entry) =>
        prisma.generationHistory.update({
          where: { id: entry.id },
          data: {
            status: GenerationStatus.COMPLETED,
            output: {
              coverageScore,
              summary: result.summary,
            } as unknown as Prisma.InputJsonValue,
          },
        }),
      ),
    );

    return result;
  } catch (error) {
    await Promise.all(
      historyEntries.map((entry) =>
        prisma.generationHistory.update({
          where: { id: entry.id },
          data: {
            status: GenerationStatus.FAILED,
            output: {
              error: error instanceof Error ? error.message : "Coverage analysis failed",
            } as unknown as Prisma.InputJsonValue,
          },
        }),
      ),
    );
    throw error;
  }
}
