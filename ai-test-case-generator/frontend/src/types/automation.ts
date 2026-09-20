export type AutomationFramework = "Playwright" | "Cypress" | "Selenium";
export type AutomationLanguage = "TypeScript" | "JavaScript" | "Java";

export interface AutomationCodeResult {
  testCaseId: string;
  framework: AutomationFramework;
  language: AutomationLanguage;
  code: string;
  automationId: string;
  createdAt: string;
}

export interface GenerateAutomationRequest {
  testCaseId: string;
  framework: AutomationFramework;
  language: AutomationLanguage;
}
