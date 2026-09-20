import type { AutomationCodeResult, GenerateAutomationRequest } from "../types/automation";
import { api } from "./api";

export async function generateAutomationCode(
  payload: GenerateAutomationRequest,
): Promise<AutomationCodeResult> {
  const { data } = await api.post<AutomationCodeResult>("/automation/generate", payload);
  return data;
}

export async function fetchLatestAutomationCode(
  testCaseDbId: string,
): Promise<AutomationCodeResult> {
  const { data } = await api.get<AutomationCodeResult>(
    `/automation/test-case/${testCaseDbId}`,
  );
  return data;
}

export function getFileExtension(framework: string, language: string): string {
  if (language === "Java") return ".java";
  if (framework === "Cypress") return language === "TypeScript" ? ".cy.ts" : ".cy.js";
  if (framework === "Playwright") return language === "TypeScript" ? ".spec.ts" : ".spec.js";
  return language === "TypeScript" ? ".ts" : ".js";
}
