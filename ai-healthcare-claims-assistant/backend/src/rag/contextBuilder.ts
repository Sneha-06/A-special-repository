import type { RetrievedItem } from "./retrieval";

export function buildContext(items: RetrievedItem[]): string {
  if (!items.length) {
    return "No retrieved records.";
  }

  return items
    .map((item) => {
      if (item.kind === "claim") {
        return [
          `[CLAIM ${item.claimId}]`,
          `Status: ${item.status}`,
          `Service: ${item.serviceName}`,
          `Rejection reason: ${item.rejectionReason ?? "n/a"}`,
          `Applicable rule: ${item.ruleId ?? "n/a"}`,
          `Retrieval score: ${item.score.toFixed(3)}`,
        ].join("\n");
      }
      if (item.kind === "rule") {
        return [
          `[RULE ${item.ruleId}] ${item.name}`,
          `Category: ${item.category}`,
          `Description: ${item.description}`,
          `Eligibility: ${item.eligibilityConditions}`,
          `Authorization: ${item.authorizationRequirements}`,
          `Coverage: ${item.coverageConditions}`,
          `Restrictions: ${item.serviceRestrictions}`,
          `Retrieval score: ${item.score.toFixed(3)}`,
        ].join("\n");
      }
      return [
        `[DOCUMENT ${item.documentId}] ${item.title}`,
        item.content,
        `Retrieval score: ${item.score.toFixed(3)}`,
      ].join("\n");
    })
    .join("\n\n");
}
