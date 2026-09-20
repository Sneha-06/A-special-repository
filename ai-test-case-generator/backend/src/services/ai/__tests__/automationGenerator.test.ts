import { describe, expect, it, vi } from "vitest";
import { generateAutomationCodeWithAi } from "../automationGenerator";
import { HttpError } from "../../../utils/httpError";

const sampleContext = {
  testCaseId: "TC-LOGIN-001",
  title: "Login with valid credentials",
  category: "FUNCTIONAL",
  priority: "HIGH",
  severity: "MAJOR",
  preconditions: "User account exists with valid credentials",
  expectedResult: "User is redirected to dashboard",
  postconditions: "Session cookie is set",
  steps: [
    {
      stepNumber: 1,
      action: "Navigate to login page",
      testData: null,
      expectedResult: "Login form is displayed",
    },
    {
      stepNumber: 2,
      action: "Enter valid email and password",
      testData: "test.user@example.com / TestPass123!",
      expectedResult: "Credentials accepted",
    },
    {
      stepNumber: 3,
      action: "Click Sign In",
      testData: null,
      expectedResult: "User is redirected to dashboard",
    },
  ],
  testData: [
    { field: "email", value: "test.user@example.com", dataType: "string" },
    { field: "password", value: "TestPass123!", dataType: "string" },
  ],
  framework: "Playwright",
  language: "TypeScript",
};

describe("generateAutomationCodeWithAi", () => {
  it("returns validated code from mocked OpenAI response", async () => {
    const mockCode = `import { test, expect } from '@playwright/test';

test('TC-LOGIN-001: Login with valid credentials', async ({ page }) => {
  await page.goto('/login');
  await page.fill('#email', 'test.user@example.com');
  await page.fill('#password', 'TestPass123!');
  await page.click('button[type=submit]');
  await expect(page).toHaveURL('/dashboard');
});`;

    const caller = vi.fn().mockResolvedValue(JSON.stringify({ code: mockCode }));

    const result = await generateAutomationCodeWithAi(sampleContext, caller);

    expect(caller).toHaveBeenCalledOnce();
    expect(result).toContain("Login with valid credentials");
    expect(result).toContain("@playwright/test");
    expect(result).toContain("test.user@example.com");
  });

  it("throws HttpError when AI response fails validation", async () => {
    const caller = vi.fn().mockResolvedValue(JSON.stringify({ code: "" }));

    await expect(generateAutomationCodeWithAi(sampleContext, caller)).rejects.toThrow(HttpError);
  });

  it("throws HttpError when AI returns invalid JSON shape", async () => {
    const caller = vi.fn().mockResolvedValue(JSON.stringify({ notCode: "missing" }));

    await expect(generateAutomationCodeWithAi(sampleContext, caller)).rejects.toThrow(
      "AI automation code response failed validation",
    );
  });

  it("includes test steps in the prompt sent to OpenAI", async () => {
    const caller = vi.fn().mockResolvedValue(
      JSON.stringify({ code: "test('login', async () => {});" }),
    );

    await generateAutomationCodeWithAi(sampleContext, caller);

    const userPrompt = caller.mock.calls[0][1] as string;
    expect(userPrompt).toContain("TC-LOGIN-001");
    expect(userPrompt).toContain("Login with valid credentials");
    expect(userPrompt).toContain("Navigate to login page");
    expect(userPrompt).toContain("User is redirected to dashboard");
    expect(userPrompt).toContain("Playwright");
    expect(userPrompt).toContain("TypeScript");
  });
});
