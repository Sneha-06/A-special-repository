import type { AnalyzeCodeBody } from "../../validators/analysisSchemas";

const BASE_JSON_SCHEMA = `Return ONLY valid JSON with this shape:
{
  "summary": "string — executive summary of the analysis",
  "findings": [
    {
      "title": "string",
      "description": "string",
      "severity": "INFO|LOW|MEDIUM|HIGH|CRITICAL",
      "category": "BUG|SECURITY|PERFORMANCE|STYLE|ACCESSIBILITY|REACT|MAINTAINABILITY|TESTING|DOCUMENTATION|OTHER",
      "lineStart": number or null,
      "lineEnd": number or null,
      "suggestion": "string or null"
    }
  ],
  "improvedCode": "string or null — refactored code when applicable",
  "documentation": "string or null — generated docs when applicable",
  "unitTests": "string or null — generated tests when applicable",
  "explanation": "string or null — detailed explanation when applicable",
  "metrics": {
    "qualityScore": 0-100,
    "securityScore": 0-100,
    "performanceScore": 0-100,
    "accessibilityScore": 0-100
  }
}`;

const PROMPTS: Record<AnalyzeCodeBody["analysisType"], string> = {
  CODE_REVIEW: `You are a senior staff engineer performing a thorough code review.
Focus on correctness, maintainability, readability, error handling, and best practices.
Provide actionable findings with line references when possible.
${BASE_JSON_SCHEMA}`,

  EXPLANATION: `You are a senior engineer explaining code to a mid-level developer.
Provide a clear, structured explanation in the "explanation" field covering purpose, flow, dependencies, and edge cases.
Include findings only for notable concerns. Set improvedCode, documentation, and unitTests to null unless essential.
${BASE_JSON_SCHEMA}`,

  REFACTORING: `You are a refactoring specialist. Identify code smells and produce improved code in "improvedCode".
Explain changes in findings. Prioritize readability, SOLID principles, and minimal behavioral change.
${BASE_JSON_SCHEMA}`,

  BUG_DETECTION: `You are a QA-minded engineer hunting bugs, race conditions, null/undefined issues, logic errors, and edge cases.
Category should be BUG for most findings. Be specific about failure scenarios.
${BASE_JSON_SCHEMA}`,

  PERFORMANCE: `You are a performance engineer. Analyze time/space complexity, unnecessary re-renders, N+1 patterns, blocking I/O, and memory leaks.
Category should be PERFORMANCE. Include improvedCode when fixes are clear.
${BASE_JSON_SCHEMA}`,

  SECURITY: `You are an application security engineer. Find injection risks, auth flaws, secrets exposure, insecure dependencies patterns, XSS, CSRF, and data leaks.
Category should be SECURITY. Severity should reflect real exploitability.
${BASE_JSON_SCHEMA}`,

  REACT_ANALYSIS: `You are a React architect. Analyze hooks usage, state management, re-render patterns, key props, effect dependencies, component composition, and accessibility in JSX.
Category should be REACT for React-specific issues.
${BASE_JSON_SCHEMA}`,

  ACCESSIBILITY: `You are an accessibility specialist (WCAG 2.1). Find missing labels, keyboard traps, color contrast issues, ARIA misuse, and semantic HTML problems.
Category should be ACCESSIBILITY.
${BASE_JSON_SCHEMA}`,

  UNIT_TESTS: `You are a test engineer. Generate comprehensive unit tests in "unitTests" using the project's likely test framework (Jest/Vitest for JS/TS).
Findings should cover untested paths. Category TESTING.
${BASE_JSON_SCHEMA}`,

  DOCUMENTATION: `You are a technical writer. Generate clear documentation in "documentation" (markdown) covering API, usage, parameters, and examples.
Findings should note missing docs. Category DOCUMENTATION.
${BASE_JSON_SCHEMA}`,
};

export function buildSystemPrompt(analysisType: AnalyzeCodeBody["analysisType"]): string {
  return PROMPTS[analysisType];
}

export function buildUserPrompt(input: AnalyzeCodeBody): string {
  const parts = [
    `Analysis type: ${input.analysisType}`,
    `Language: ${input.language}`,
    input.filePath ? `File path: ${input.filePath}` : null,
    input.title ? `Title: ${input.title}` : null,
    input.context ? `Additional context:\n${input.context}` : null,
    `\nSource code:\n\`\`\`${input.language}\n${input.sourceCode}\n\`\`\``,
  ].filter(Boolean);

  return parts.join("\n");
}
