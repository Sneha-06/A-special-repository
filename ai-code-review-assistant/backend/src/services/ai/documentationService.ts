import { callOpenAiJson, extractJsonFromAi } from "../../utils/aiJson";
import { HttpError } from "../../utils/httpError";
import {
  documentationResponseSchema,
  type CreateDocumentationBody,
  type DocFormat,
  type DocumentationResponse,
} from "../../validators/documentationSchemas";

const FORMAT_INSTRUCTIONS: Record<DocFormat, string> = {
  jsdoc: `Generate JSDoc-style comments that can be placed directly above functions/components.
The "content" field should contain the full annotated source or standalone JSDoc blocks.`,
  markdown: `Generate clean Markdown technical documentation with headings, code blocks, and tables where useful.
The "content" field should be the complete Markdown document.`,
  readme: `Generate a README-style document with overview, installation/usage if inferable, API summary, and examples.
The "content" field should be the complete README Markdown.`,
  api: `Generate API reference documentation with endpoints or public API surface, parameters, return types, and examples.
The "content" field should be the complete API reference document.`,
};

const SYSTEM_PROMPT = `You are a technical writer generating developer documentation from source code.

Rules:
- Document only what exists in the provided code.
- items: structured breakdown of each function, component, class, hook, or important export.
- content: the full generated documentation in the requested format, ready to copy.
- usageExamples: practical code examples showing how to use the documented code.
- Include parameters, return values, and descriptions for each documented item.

Return ONLY valid JSON:
{
  "format": "jsdoc|markdown|readme|api",
  "title": "document title",
  "summary": "brief summary",
  "content": "full generated documentation text",
  "items": [{
    "name": "functionOrComponentName",
    "type": "function|component|class|variable|hook|other",
    "description": "...",
    "parameters": [{ "name": "...", "type": "...", "description": "...", "required": true }],
    "returns": { "type": "...", "description": "..." },
    "examples": ["..."]
  }],
  "usageExamples": ["..."]
}`;

const RETRY_SUFFIX = `\n\nYour previous response failed JSON validation. Return ONLY valid JSON. content must be non-empty.`;

function buildUserPrompt(input: CreateDocumentationBody): string {
  const formatGuide = FORMAT_INSTRUCTIONS[input.format];
  return [
    `Language: ${input.language}`,
    `Framework: ${input.framework}`,
    `Documentation format: ${input.format}`,
    input.fileName ? `File: ${input.fileName}` : null,
    `\nFormat instructions:\n${formatGuide}`,
    `\nSource code:\n\`\`\`${input.language}\n${input.code}\n\`\`\``,
  ]
    .filter(Boolean)
    .join("\n");
}

async function callAndValidate(input: CreateDocumentationBody, userPrompt: string): Promise<DocumentationResponse> {
  const raw = await callOpenAiJson(SYSTEM_PROMPT, userPrompt);
  const parsed = extractJsonFromAi(raw);
  const result = documentationResponseSchema.safeParse(parsed);
  if (!result.success) throw result.error;

  return { ...result.data, format: input.format };
}

export async function runDocumentationGeneration(input: CreateDocumentationBody): Promise<DocumentationResponse> {
  const userPrompt = buildUserPrompt(input);
  try {
    return await callAndValidate(input, userPrompt);
  } catch (firstError) {
    try {
      return await callAndValidate(input, userPrompt + RETRY_SUFFIX);
    } catch {
      throw new HttpError(502, "AI returned an invalid documentation response after retry", {
        reason: firstError instanceof Error ? firstError.message : "validation failed",
      });
    }
  }
}
