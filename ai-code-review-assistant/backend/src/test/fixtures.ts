export const sampleReviewResponse = {
  summary: "Code has minor issues.",
  overallScore: 80,
  issues: [
    {
      id: "ISSUE-001",
      title: "Missing error handling",
      description: "Fetch has no try/catch.",
      severity: "high" as const,
      category: "bug" as const,
      lineStart: 3,
      lineEnd: 5,
      suggestion: "Wrap in try/catch.",
      explanation: "Network errors will crash the handler.",
    },
  ],
  strengths: ["Readable structure"],
  recommendations: ["Add unit tests"],
};

export const sampleRefactorResponse = {
  summary: "Improved readability.",
  improvedCode: "export const add = (a: number, b: number) => a + b;",
  changes: [{ title: "Typed parameters", description: "Added number types." }],
};

export const sampleExplanationResponse = {
  summary: "Adds two numbers.",
  purpose: "Utility function for arithmetic.",
  flow: [{ step: 1, title: "Add", description: "Returns sum of inputs." }],
  keyFunctions: [{ name: "add", description: "Sums a and b.", parameters: ["a", "b"] }],
  dependencies: [],
  potentialIssues: [],
};

export const sampleTestGeneratorResponse = {
  testFileName: "add.test.ts",
  testFramework: "vitest",
  tests: [
    { name: "adds numbers", description: "Happy path", category: "happy-path" as const, targetFunction: "add" },
  ],
  code: "import { describe, it, expect } from 'vitest';\n\ndescribe('add', () => { it('works', () => expect(1+1).toBe(2)); });",
  summary: { totalTests: 1, functionsCovered: ["add"], edgeCasesCovered: 0 },
};
