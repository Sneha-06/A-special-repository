import {
  GenerationStatus,
  GenerationType,
  Prisma,
  TestCategory,
  TestPriority,
  TestSeverity,
} from "@prisma/client";
import { generateTestCasesWithAi } from "./ai/testCaseGenerator";
import { getRequirementById } from "./requirementService";
import { HttpError } from "../utils/httpError";
import { prisma } from "../utils/prisma";
import { env } from "../utils/env";
import type { GeneratedTestCase, GenerationStage } from "../types/testCase";
import { TEST_TYPE_TO_CATEGORY } from "../types/testCase";

const CATEGORY_TO_LABEL: Record<TestCategory, string> = {
  FUNCTIONAL: "Functional",
  POSITIVE: "Positive",
  NEGATIVE: "Negative",
  BOUNDARY: "Boundary",
  EDGE_CASE: "Edge Case",
  REGRESSION: "Regression",
  SECURITY: "Security",
  ACCESSIBILITY: "Accessibility",
  API: "API",
  PERFORMANCE: "Performance",
  INTEGRATION: "Integration",
  SMOKE: "Smoke",
};
import type { GenerateTestCasesBody, UpdateTestCaseBody } from "../validators/testCaseSchemas";

type ProgressCallback = (stage: GenerationStage, message: string) => void;

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function normalizePriority(value: string, fallback: TestPriority): TestPriority {
  const map: Record<string, TestPriority> = {
    low: "LOW",
    medium: "MEDIUM",
    high: "HIGH",
    critical: "CRITICAL",
  };
  return map[value.toLowerCase()] ?? fallback;
}

function normalizeSeverity(value: string, fallback: TestSeverity): TestSeverity {
  const map: Record<string, TestSeverity> = {
    minor: "MINOR",
    moderate: "MODERATE",
    major: "MAJOR",
    critical: "CRITICAL",
  };
  return map[value.toLowerCase()] ?? fallback;
}

function normalizeCategory(value: string): TestCategory {
  const direct = TEST_TYPE_TO_CATEGORY[value];
  if (direct) return direct;

  const upper = value.toUpperCase().replace(/\s+/g, "_");
  const categories = Object.values(TestCategory) as string[];
  if (categories.includes(upper)) return upper as TestCategory;

  return TestCategory.FUNCTIONAL;
}

async function nextTestCaseId(requirementId: string, index: number): Promise<string> {
  const count = await prisma.testCase.count({ where: { requirementId } });
  const seq = String(count + index + 1).padStart(3, "0");
  return `TC-${requirementId.slice(0, 8).toUpperCase()}-${seq}`;
}

async function persistGeneratedTestCases(
  requirementId: string,
  generated: GeneratedTestCase[],
  defaults: { priority: TestPriority; severity: TestSeverity },
) {
  const saved = [];

  for (const [index, tc] of generated.entries()) {
    const uniqueId = await nextTestCaseId(requirementId, index);
    const existing = await prisma.testCase.findUnique({ where: { testCaseId: tc.testCaseId } });
    const testCaseId = existing ? uniqueId : tc.testCaseId;

    const record = await prisma.testCase.create({
      data: {
        requirementId,
        testCaseId,
        title: tc.title,
        category: normalizeCategory(tc.category),
        priority: normalizePriority(tc.priority, defaults.priority),
        severity: normalizeSeverity(tc.severity, defaults.severity),
        preconditions: tc.preconditions.join("\n"),
        expectedResult: tc.expectedResult,
        postconditions: tc.postconditions || null,
        automationCandidate: tc.automationCandidate,
        steps: {
          create: tc.steps.map((step) => ({
            stepNumber: step.stepNumber,
            action: step.action,
            testData: step.testData || null,
            expectedResult: step.expectedResult,
          })),
        },
        testData: {
          create: tc.testData.map((row) => ({
            field: row.field,
            value: row.value,
            dataType: row.dataType,
          })),
        },
      },
      include: {
        steps: { orderBy: { stepNumber: "asc" } },
        testData: true,
        requirement: {
          select: { id: true, title: true, project: { select: { name: true } } },
        },
      },
    });

    saved.push(record);
  }

  return saved;
}

export async function listTestCases(requirementId?: string) {
  return prisma.testCase.findMany({
    where: requirementId ? { requirementId } : undefined,
    include: {
      steps: { orderBy: { stepNumber: "asc" } },
      testData: true,
      requirement: {
        select: { id: true, title: true, project: { select: { id: true, name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTestCaseById(id: string) {
  const testCase = await prisma.testCase.findUnique({
    where: { id },
    include: {
      steps: { orderBy: { stepNumber: "asc" } },
      testData: true,
      automationCode: { orderBy: { createdAt: "desc" }, take: 1 },
      requirement: {
        select: { id: true, title: true, project: { select: { name: true } } },
      },
    },
  });

  if (!testCase) throw new HttpError(404, "Test case not found");
  return testCase;
}

export async function updateTestCase(id: string, body: UpdateTestCaseBody) {
  await getTestCaseById(id);

  return prisma.testCase.update({
    where: { id },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.category !== undefined ? { category: normalizeCategory(body.category) } : {}),
      ...(body.priority !== undefined ? { priority: body.priority } : {}),
      ...(body.severity !== undefined ? { severity: body.severity } : {}),
      ...(body.preconditions !== undefined ? { preconditions: body.preconditions } : {}),
      ...(body.expectedResult !== undefined ? { expectedResult: body.expectedResult } : {}),
      ...(body.postconditions !== undefined ? { postconditions: body.postconditions } : {}),
      ...(body.automationCandidate !== undefined
        ? { automationCandidate: body.automationCandidate }
        : {}),
    },
    include: {
      steps: { orderBy: { stepNumber: "asc" } },
      testData: true,
      requirement: { select: { id: true, title: true } },
    },
  });
}

export async function deleteTestCase(id: string) {
  await getTestCaseById(id);
  await prisma.testCase.delete({ where: { id } });
}

export async function duplicateTestCase(id: string) {
  const original = await getTestCaseById(id);
  const newTestCaseId = `${original.testCaseId}-COPY`;

  let suffix = 1;
  let candidate = newTestCaseId;
  while (await prisma.testCase.findUnique({ where: { testCaseId: candidate } })) {
    candidate = `${newTestCaseId}-${suffix}`;
    suffix += 1;
  }

  return prisma.testCase.create({
    data: {
      requirementId: original.requirementId,
      testCaseId: candidate,
      title: `${original.title} (Copy)`,
      category: original.category,
      priority: original.priority,
      severity: original.severity,
      preconditions: original.preconditions,
      expectedResult: original.expectedResult,
      postconditions: original.postconditions,
      automationCandidate: original.automationCandidate,
      steps: {
        create: original.steps.map((step) => ({
          stepNumber: step.stepNumber,
          action: step.action,
          testData: step.testData,
          expectedResult: step.expectedResult,
        })),
      },
      testData: {
        create: original.testData.map((row) => ({
          field: row.field,
          value: row.value,
          dataType: row.dataType,
        })),
      },
    },
    include: {
      steps: { orderBy: { stepNumber: "asc" } },
      testData: true,
      requirement: { select: { id: true, title: true } },
    },
  });
}

export async function regenerateTestCase(id: string, onProgress?: ProgressCallback) {
  const existing = await getTestCaseById(id);
  const requirement = await getRequirementById(existing.requirementId);
  const latestAnalysis = requirement.analyses[0];

  onProgress?.("analyzing_requirement", "Analyzing requirement...");
  onProgress?.("identifying_scenarios", "Identifying scenarios...");
  onProgress?.("generating_test_cases", "Generating test cases...");

  const generated = await generateTestCasesWithAi({
    requirement: {
      title: requirement.title,
      description: requirement.description,
      userStory: requirement.userStory,
      applicationModule: requirement.applicationModule,
      priority: requirement.priority,
      acceptanceCriteriaText: requirement.acceptanceCriteriaText,
      additionalContext: requirement.additionalContext,
    },
    analysis: latestAnalysis
      ? {
          summary: latestAnalysis.summary,
          actors: asStringArray(latestAnalysis.actors),
          preconditions: asStringArray(latestAnalysis.preconditions),
          businessRules: asStringArray(latestAnalysis.businessRules),
          functionalRequirements: asStringArray(latestAnalysis.functionalRequirements),
          nonFunctionalRequirements: asStringArray(latestAnalysis.nonFunctionalRequirements),
          assumptions: asStringArray(latestAnalysis.assumptions),
          ambiguities: asStringArray(latestAnalysis.ambiguities),
          missingInformation: asStringArray(latestAnalysis.missingInformation),
          riskAreas: asStringArray(latestAnalysis.riskAreas),
        }
      : null,
    testTypes: [CATEGORY_TO_LABEL[existing.category] ?? "Functional"],
    numberOfTestCases: 1,
    priority: existing.priority,
    severity: existing.severity,
  });

  onProgress?.("finalizing", "Finalizing test suite...");

  const replacement = generated[0];
  await prisma.testStep.deleteMany({ where: { testCaseId: id } });
  await prisma.testData.deleteMany({ where: { testCaseId: id } });

  const updated = await prisma.testCase.update({
    where: { id },
    data: {
      title: replacement.title,
      category: normalizeCategory(replacement.category),
      priority: normalizePriority(replacement.priority, existing.priority),
      severity: normalizeSeverity(replacement.severity, existing.severity),
      preconditions: replacement.preconditions.join("\n"),
      expectedResult: replacement.expectedResult,
      postconditions: replacement.postconditions || null,
      automationCandidate: replacement.automationCandidate,
      steps: {
        create: replacement.steps.map((step) => ({
          stepNumber: step.stepNumber,
          action: step.action,
          testData: step.testData || null,
          expectedResult: step.expectedResult,
        })),
      },
      testData: {
        create: replacement.testData.map((row) => ({
          field: row.field,
          value: row.value,
          dataType: row.dataType,
        })),
      },
    },
    include: {
      steps: { orderBy: { stepNumber: "asc" } },
      testData: true,
      requirement: { select: { id: true, title: true } },
    },
  });

  return updated;
}

export async function generateTestCases(
  body: GenerateTestCasesBody,
  onProgress: ProgressCallback,
) {
  onProgress("analyzing_requirement", "Analyzing requirement...");

  const requirement = await getRequirementById(body.requirementId);
  const latestAnalysis = requirement.analyses[0];

  if (!latestAnalysis) {
    throw new HttpError(
      400,
      "Requirement must be analyzed before generating test cases. Run requirement analysis first.",
    );
  }

  onProgress("identifying_scenarios", "Identifying scenarios...");

  const historyEntry = await prisma.generationHistory.create({
    data: {
      requirementId: body.requirementId,
      generationType: GenerationType.TEST_CASES,
      model: env.openAiModel,
      status: GenerationStatus.PROCESSING,
      input: body as unknown as Prisma.InputJsonValue,
      output: {},
    },
  });

  try {
    onProgress("generating_test_cases", "Generating test cases...");

    const generated = await generateTestCasesWithAi({
      requirement: {
        title: requirement.title,
        description: requirement.description,
        userStory: requirement.userStory,
        applicationModule: requirement.applicationModule,
        priority: requirement.priority,
        acceptanceCriteriaText: requirement.acceptanceCriteriaText,
        additionalContext: requirement.additionalContext,
      },
      analysis: {
        summary: latestAnalysis.summary,
        actors: asStringArray(latestAnalysis.actors),
        preconditions: asStringArray(latestAnalysis.preconditions),
        businessRules: asStringArray(latestAnalysis.businessRules),
        functionalRequirements: asStringArray(latestAnalysis.functionalRequirements),
        nonFunctionalRequirements: asStringArray(latestAnalysis.nonFunctionalRequirements),
        assumptions: asStringArray(latestAnalysis.assumptions),
        ambiguities: asStringArray(latestAnalysis.ambiguities),
        missingInformation: asStringArray(latestAnalysis.missingInformation),
        riskAreas: asStringArray(latestAnalysis.riskAreas),
      },
      testTypes: body.testTypes,
      numberOfTestCases: body.numberOfTestCases,
      priority: body.priority,
      severity: body.severity,
    });

    onProgress("finalizing", "Finalizing test suite...");

    const saved = await persistGeneratedTestCases(body.requirementId, generated, {
      priority: body.priority,
      severity: body.severity,
    });

    await prisma.generationHistory.update({
      where: { id: historyEntry.id },
      data: {
        status: GenerationStatus.COMPLETED,
        output: {
          count: saved.length,
          testCaseIds: saved.map((tc) => tc.testCaseId),
        } as unknown as Prisma.InputJsonValue,
      },
    });

    return saved;
  } catch (error) {
    await prisma.generationHistory.update({
      where: { id: historyEntry.id },
      data: {
        status: GenerationStatus.FAILED,
        output: {
          error: error instanceof Error ? error.message : "Generation failed",
        } as unknown as Prisma.InputJsonValue,
      },
    });
    throw error;
  }
}
