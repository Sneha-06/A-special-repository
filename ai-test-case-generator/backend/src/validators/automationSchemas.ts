import { z } from "zod";

export const AUTOMATION_FRAMEWORKS = ["Playwright", "Cypress", "Selenium"] as const;
export const AUTOMATION_LANGUAGES = ["TypeScript", "JavaScript", "Java"] as const;

export const generateAutomationSchema = z.object({
  testCaseId: z.string().min(1, "testCaseId is required"),
  framework: z.enum(AUTOMATION_FRAMEWORKS),
  language: z.enum(AUTOMATION_LANGUAGES),
});

export const aiAutomationResponseSchema = z.object({
  code: z.string().min(1),
});

export type GenerateAutomationBody = z.infer<typeof generateAutomationSchema>;
