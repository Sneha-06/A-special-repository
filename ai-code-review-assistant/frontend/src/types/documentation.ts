export const DOC_FORMATS = [
  { value: "jsdoc", label: "JSDoc" },
  { value: "markdown", label: "Markdown" },
  { value: "readme", label: "README" },
  { value: "api", label: "API documentation" },
] as const;

export type DocFormat = (typeof DOC_FORMATS)[number]["value"];

export interface DocumentedItem {
  name: string;
  type: "function" | "component" | "class" | "variable" | "hook" | "other";
  description: string;
  parameters: Array<{
    name: string;
    type?: string;
    description?: string;
    required?: boolean;
  }>;
  returns?: { type?: string; description?: string };
  examples: string[];
}

export interface DocumentationResult {
  format: DocFormat;
  title: string;
  summary: string;
  content: string;
  items: DocumentedItem[];
  usageExamples: string[];
}

export interface CreateDocumentationRequest {
  code: string;
  language: string;
  framework: string;
  format: DocFormat;
  fileName?: string;
}
