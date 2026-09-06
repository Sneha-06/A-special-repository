export type SourceType = "claim" | "rule" | "document";

export interface AiSource {
  type: SourceType;
  id: string;
  title: string;
}

export interface AiResponse {
  answer: string;
  claimId?: string | null;
  ruleId?: string | null;
  confidence: number;
  sources: AiSource[];
  recommendations: string[];
  simpleExplanation?: string;
}

export interface LlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GenerateParams {
  messages: LlmMessage[];
  retrievedContext: string;
}

export interface AIProvider {
  name: string;
  generate(params: GenerateParams): Promise<AiResponse>;
}
