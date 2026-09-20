import { callOpenAiJson, extractJsonFromAi } from "../../utils/aiJson";
import { HttpError } from "../../utils/httpError";
import {
  testGeneratorResponseSchema,
  type GenerateTestsBody,
  type TestGeneratorResponse,
} from "../../validators/testGeneratorSchemas";

const FRAMEWORK_IMPORTS: Record<string, string> = {
  vitest: "import { describe, it, expect, vi, beforeEach } from 'vitest';",
  jest: "/* @jest-environment jsdom */",
  "react-testing-library": "import { render, screen, waitFor } from '@testing-library/react';",
};

const SYSTEM_PROMPT = `You are a senior test engineer generating production-quality unit tests from source code.

Rules:
- Analyze the ACTUAL provided code. Tests must target real functions, components, hooks, and behaviors present in the code.
- Do NOT generate placeholder or meaningless tests (e.g. expect(true).toBe(true)).
- Cover: happy path, negative cases, edge cases, error cases, and async cases where relevant.
- Use the requested testing framework conventions and imports.
- code: the COMPLETE test file content, ready to save and run. Include all imports.
- tests: structured metadata for each test case generated in the code.
- category per test: happy-path | negative | edge-case | error | async
- summary: totalTests must match the number of test cases, functionsCovered lists tested functions/components, edgeCasesCovered counts edge-case + error tests.

Return ONLY valid JSON:
{
  "testFileName": "ComponentName.test.tsx",
  "testFramework": "vitest",
  "tests": [
    {
      "name": "renders user list on successful fetch",
      "description": "Verifies users are displayed after API returns data",
      "category": "happy-path",
      "targetFunction": "UserList"
    }
  ],
  "code": "full test file source code",
  "summary": {
    "totalTests": 5,
    "functionsCovered": ["UserList", "fetchUsers"],
    "edgeCasesCovered": 2
  }
}`;

const RETRY_SUFFIX = `\n\nYour previous response failed validation. Return ONLY valid JSON. code must be a complete test file. tests array must not be empty. No placeholder tests.`;

function buildUserPrompt(input: GenerateTestsBody): string {
  const importHint = FRAMEWORK_IMPORTS[input.testingFramework] ?? "";
  const rtlNote =
    input.testingFramework === "react-testing-library"
      ? "Use React Testing Library with Vitest or Jest patterns. Include @testing-library/react and @testing-library/jest-dom."
      : "";

  return [
    `Source language: ${input.language}`,
    `App framework: ${input.framework}`,
    `Testing framework: ${input.testingFramework}`,
    input.fileName ? `Source file: ${input.fileName}` : null,
    importHint ? `Suggested imports: ${importHint}` : null,
    rtlNote || null,
    `\nSource code to test:\n\`\`\`${input.language}\n${input.code}\n\`\`\``,
  ]
    .filter(Boolean)
    .join("\n");
}

function normalizeResponse(data: TestGeneratorResponse, input: GenerateTestsBody): TestGeneratorResponse {
  const edgeCasesCovered = data.tests.filter(
    (t) => t.category === "edge-case" || t.category === "error" || t.category === "negative",
  ).length;

  const functionsCovered = [
    ...new Set(
      data.tests.map((t) => t.targetFunction).filter((f): f is string => Boolean(f)),
    ),
  ];

  return {
    ...data,
    testFramework: input.testingFramework,
    summary: {
      totalTests: data.tests.length,
      functionsCovered: data.summary?.functionsCovered?.length
        ? data.summary.functionsCovered
        : functionsCovered,
      edgeCasesCovered: data.summary?.edgeCasesCovered ?? edgeCasesCovered,
    },
  };
}

async function callAndValidate(input: GenerateTestsBody, userPrompt: string): Promise<TestGeneratorResponse> {
  const raw = await callOpenAiJson(SYSTEM_PROMPT, userPrompt);
  const parsed = extractJsonFromAi(raw);
  const result = testGeneratorResponseSchema.safeParse(parsed);
  if (!result.success) throw result.error;
  return normalizeResponse(result.data, input);
}

export async function runTestGeneration(input: GenerateTestsBody): Promise<TestGeneratorResponse> {
  const userPrompt = buildUserPrompt(input);
  try {
    return await callAndValidate(input, userPrompt);
  } catch (firstError) {
    try {
      return await callAndValidate(input, userPrompt + RETRY_SUFFIX);
    } catch {
      throw new HttpError(502, "AI returned an invalid test generation response after retry", {
        reason: firstError instanceof Error ? firstError.message : "validation failed",
      });
    }
  }
}
