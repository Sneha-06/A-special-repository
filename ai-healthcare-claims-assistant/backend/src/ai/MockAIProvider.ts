import type { AIProvider, AiResponse, GenerateParams } from "./types";
import { coerceAiResponse } from "./responseParser";

function findId(context: string, pattern: RegExp): string | null {
  return context.match(pattern)?.[1] ?? null;
}

export class MockAIProvider implements AIProvider {
  name = "mock";

  async generate(params: GenerateParams): Promise<AiResponse> {
    const question = params.messages.at(-1)?.content ?? "";
    const context = params.retrievedContext;
    const claimId =
      findId(question, /\b(CLM-\d+)\b/i)?.toUpperCase() ??
      findId(context, /\[CLAIM (CLM-\d+)\]/i);
    const ruleMentions = [...context.matchAll(/\[RULE (MR-\d+)\]/gi)].map((match) =>
      match[1].toUpperCase(),
    );
    const uniqueRules = [...new Set(ruleMentions)];
    const ruleIdFromQuestion = findId(question, /\b(MR-\d+)\b/i)?.toUpperCase();
    const ruleId = ruleIdFromQuestion ?? uniqueRules[0] ?? null;

    const lower = question.toLowerCase();
    const isCompare = lower.includes("compare") && uniqueRules.length >= 2;
    const isSimple = lower.includes("simple");
    const isEligibility = lower.includes("eligib");

    let answer: string;
    if (isCompare && uniqueRules.length >= 2) {
      answer = `Rule ${uniqueRules[0]} and ${uniqueRules[1]} differ in eligibility verification and prior authorization. ${uniqueRules[0]} is typically eligibility-led, while ${uniqueRules[1]} adds authorization and tighter service restrictions. Use the comparison panel for a field-level view.`;
    } else if (claimId && /reject/.test(lower)) {
      answer = `Claim ${claimId} was rejected because the submitted service does not satisfy the eligibility condition defined in Rule ${ruleId ?? "the applicable mandate"}.`;
    } else if (ruleId && isEligibility) {
      answer = `Eligibility for ${ruleId} requires the member to be active on a covered plan on the date of service and to meet the plan-specific conditions stored on that mandate.`;
    } else if (claimId) {
      answer = `Claim ${claimId} is governed by ${ruleId ?? "the retrieved mandate rules"}. Status, amounts, and timeline in the claim record should be used together with the cited rule.`;
    } else if (ruleId) {
      answer = `Rule ${ruleId} is an active mandate in the synthetic PBM catalog. Review eligibility, authorization, and coverage conditions before applying it to a claim.`;
    } else {
      answer =
        "Based on retrieved claims, rules, and documents, I can help explain rejections, map applicable mandates, and recommend review steps. Ask about a claim ID or rule ID for a more precise answer.";
    }

    const sources: AiResponse["sources"] = [];
    if (claimId) sources.push({ type: "claim", id: claimId, title: `Claim ${claimId}` });
    uniqueRules.slice(0, 2).forEach((id) => {
      sources.push({ type: "rule", id, title: `Mandate ${id}` });
    });
    const documentId = findId(context, /\[DOCUMENT ([^\]]+)\]/);
    if (documentId) {
      sources.push({ type: "document", id: documentId, title: "Mandate document excerpt" });
    }

    const recommendations = [
      claimId ? `Open claim ${claimId} and confirm member eligibility on the date of service.` : "Search for a specific claim or rule ID.",
      ruleId ? `Review ${ruleId} eligibility and authorization requirements before resubmission.` : "Compare related rules if more than one mandate could apply.",
      "Do not use this demo output as a coverage determination for real members.",
    ];

    return coerceAiResponse(
      {
        answer,
        claimId,
        ruleId,
        confidence: claimId || ruleId ? 0.92 : 0.74,
        sources,
        recommendations,
        simpleExplanation: isSimple
          ? "The claim did not meet a coverage rule, so it was not paid. Check eligibility and any missing paperwork, then resubmit if the member qualifies."
          : answer,
      },
      answer,
    );
  }
}
