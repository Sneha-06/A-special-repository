import type { AnalysisType } from "@prisma/client";
import { env } from "../../utils/env";
import { prisma } from "../../utils/prisma";
import { runAiAnalysis } from "../ai/analyzer";
import type { AnalyzeCodeBody } from "../../validators/analysisSchemas";
import { computeCodeMetrics } from "./metrics";

export async function analyzeCode(input: AnalyzeCodeBody) {
  const metrics = computeCodeMetrics(input.sourceCode);

  const session = await prisma.codeSession.create({
    data: {
      title: input.title ?? `${input.analysisType} — ${input.filePath ?? input.language}`,
      sourceCode: input.sourceCode,
      language: input.language,
      filePath: input.filePath,
      analysisType: input.analysisType as AnalysisType,
      status: "PROCESSING",
      repositoryId: input.repositoryId,
      model: env.openAiModel,
      input: JSON.parse(JSON.stringify({ ...input, metrics })),
      output: {},
    },
  });

  try {
    const aiResult = await runAiAnalysis(input);

    const updated = await prisma.codeSession.update({
      where: { id: session.id },
      data: {
        status: "COMPLETED",
        summary: aiResult.summary,
        improvedCode: aiResult.improvedCode ?? null,
        documentation: aiResult.documentation ?? null,
        unitTests: aiResult.unitTests ?? null,
        output: aiResult,
        findings: {
          create: aiResult.findings.map((f) => ({
            title: f.title,
            description: f.description,
            severity: f.severity,
            category: f.category,
            lineStart: f.lineStart ?? null,
            lineEnd: f.lineEnd ?? null,
            suggestion: f.suggestion ?? null,
          })),
        },
      },
      include: { findings: true, repository: true },
    });

    return { session: updated, metrics, aiResult };
  } catch (error) {
    await prisma.codeSession.update({
      where: { id: session.id },
      data: {
        status: "FAILED",
        summary: error instanceof Error ? error.message : "Analysis failed",
      },
    });
    throw error;
  }
}

export async function listSessions(limit = 20) {
  return prisma.codeSession.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      findings: { take: 5, orderBy: { severity: "desc" } },
      repository: true,
    },
  });
}

export async function getSession(id: string) {
  return prisma.codeSession.findUnique({
    where: { id },
    include: { findings: true, repository: true },
  });
}

export async function getDashboardStats() {
  const [totalSessions, completed, failed, findingsBySeverity, recentSessions] = await Promise.all([
    prisma.codeSession.count(),
    prisma.codeSession.count({ where: { status: "COMPLETED" } }),
    prisma.codeSession.count({ where: { status: "FAILED" } }),
    prisma.finding.groupBy({
      by: ["severity"],
      _count: { severity: true },
    }),
    prisma.codeSession.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        analysisType: true,
        status: true,
        createdAt: true,
        language: true,
      },
    }),
  ]);

  const byType = await prisma.codeSession.groupBy({
    by: ["analysisType"],
    _count: { analysisType: true },
  });

  return {
    totalSessions,
    completed,
    failed,
    findingsBySeverity: findingsBySeverity.map((f) => ({
      severity: f.severity,
      count: f._count.severity,
    })),
    sessionsByType: byType.map((t) => ({
      type: t.analysisType,
      count: t._count.analysisType,
    })),
    recentSessions,
  };
}
