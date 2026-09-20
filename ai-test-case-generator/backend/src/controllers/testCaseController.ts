import type { Response } from "express";
import { generateAutomationCode } from "../services/automationService";
import {
  deleteTestCase,
  duplicateTestCase,
  generateTestCases,
  getTestCaseById,
  listTestCases,
  regenerateTestCase,
  updateTestCase,
} from "../services/testCaseService";
import { asyncHandler } from "../utils/asyncHandler";
import type { GenerationStage } from "../types/testCase";

function paramId(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

const STAGE_MESSAGES: Record<GenerationStage, string> = {
  analyzing_requirement: "Analyzing requirement...",
  identifying_scenarios: "Identifying scenarios...",
  generating_test_cases: "Generating test cases...",
  finalizing: "Finalizing test suite...",
};

function writeSse(res: Response, event: string, data: unknown) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

export const getTestCases = asyncHandler(async (req, res) => {
  const requirementId = typeof req.query.requirementId === "string"
    ? req.query.requirementId
    : undefined;
  const testCases = await listTestCases(requirementId);
  res.json(testCases);
});

export const getTestCase = asyncHandler(async (req, res) => {
  const testCase = await getTestCaseById(paramId(req.params.id));
  res.json(testCase);
});

export const putTestCase = asyncHandler(async (req, res) => {
  const testCase = await updateTestCase(paramId(req.params.id), req.body);
  res.json(testCase);
});

export const removeTestCase = asyncHandler(async (req, res) => {
  await deleteTestCase(paramId(req.params.id));
  res.status(204).send();
});

export const postDuplicateTestCase = asyncHandler(async (req, res) => {
  const testCase = await duplicateTestCase(paramId(req.params.id));
  res.status(201).json(testCase);
});

export const postRegenerateTestCase = asyncHandler(async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const id = paramId(req.params.id);

  try {
    const testCase = await regenerateTestCase(id, (stage) => {
      writeSse(res, "stage", { stage, message: STAGE_MESSAGES[stage] });
    });
    writeSse(res, "complete", { testCases: [testCase] });
    res.end();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Regeneration failed";
    writeSse(res, "error", { message });
    res.end();
  }
});

export const postAutomationCode = asyncHandler(async (req, res) => {
  const result = await generateAutomationCode({
    testCaseId: paramId(req.params.id),
    framework: "Playwright",
    language: "TypeScript",
  });
  res.json(result);
});

export const postGenerateTestCases = asyncHandler(async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  try {
    const testCases = await generateTestCases(req.body, (stage) => {
      writeSse(res, "stage", { stage, message: STAGE_MESSAGES[stage] });
    });
    writeSse(res, "complete", { testCases });
    res.end();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Test case generation failed";
    writeSse(res, "error", { message });
    res.end();
  }
});
