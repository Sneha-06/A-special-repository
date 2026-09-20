import type { TestCase } from "../../types/testCase";
import type { CsvColumn } from "./csv";
import { exportCsv } from "./csv";
import { exportExcel } from "./excel";
import { exportJson } from "./json";

function formatSteps(testCase: TestCase): string {
  return testCase.steps
    .map((step) => `${step.stepNumber}. ${step.action} | Data: ${step.testData ?? "N/A"} | Expected: ${step.expectedResult}`)
    .join("\n");
}

function formatTestData(testCase: TestCase): string {
  return testCase.testData
    .map((row) => `${row.field} (${row.dataType}): ${row.value}`)
    .join("\n");
}

export const TEST_CASE_EXPORT_COLUMNS: CsvColumn<TestCase>[] = [
  { header: "Test Case ID", value: (row) => row.testCaseId },
  { header: "Title", value: (row) => row.title },
  { header: "Category", value: (row) => row.category.replace(/_/g, " ") },
  { header: "Priority", value: (row) => row.priority },
  { header: "Severity", value: (row) => row.severity },
  { header: "Preconditions", value: (row) => row.preconditions },
  { header: "Expected Result", value: (row) => row.expectedResult },
  { header: "Postconditions", value: (row) => row.postconditions ?? "" },
  { header: "Steps", value: formatSteps },
  { header: "Test Data", value: formatTestData },
  { header: "Automation Candidate", value: (row) => (row.automationCandidate ? "Yes" : "No") },
  { header: "Requirement", value: (row) => row.requirement?.title ?? "" },
];

function buildFilename(prefix: string, requirementTitle?: string) {
  const slug = (requirementTitle ?? "all")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const date = new Date().toISOString().slice(0, 10);
  return `${prefix}-${slug}-${date}`;
}

export function exportTestCasesCsv(testCases: TestCase[], requirementTitle?: string) {
  exportCsv(testCases, TEST_CASE_EXPORT_COLUMNS, `${buildFilename("test-cases", requirementTitle)}.csv`);
}

export function exportTestCasesExcel(testCases: TestCase[], requirementTitle?: string) {
  exportExcel(
    testCases,
    TEST_CASE_EXPORT_COLUMNS,
    `${buildFilename("test-cases", requirementTitle)}.xlsx`,
    "Test Cases",
  );
}

export function exportTestCasesJson(testCases: TestCase[], requirementTitle?: string) {
  exportJson(
    {
      exportedAt: new Date().toISOString(),
      requirementTitle,
      count: testCases.length,
      testCases,
    },
    `${buildFilename("test-cases", requirementTitle)}.json`,
  );
}
