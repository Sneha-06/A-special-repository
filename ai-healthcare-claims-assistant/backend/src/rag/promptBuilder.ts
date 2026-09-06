import type { LlmMessage } from "../ai/types";

const SYSTEM_PROMPT = `You are an enterprise healthcare/PBM claims copilot for analysts.
Use only the retrieved context. Do not invent patient data.
Respond with a single JSON object matching this schema:
{
  "answer": "string",
  "claimId": "string or null",
  "ruleId": "string or null",
  "confidence": 0.0,
  "sources": [{ "type": "claim|rule|document", "id": "string", "title": "string" }],
  "recommendations": ["string"],
  "simpleExplanation": "string"
}
All claims and members in this system are synthetic demo records.`;

export function buildPrompt(question: string, context: string): LlmMessage[] {
  return [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `Retrieved context:\n${context}\n\nAnalyst question:\n${question}`,
    },
  ];
}
