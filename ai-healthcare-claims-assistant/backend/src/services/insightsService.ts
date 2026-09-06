import { ClaimStatus } from "@prisma/client";
import { prisma } from "../database/prisma";

export async function getInsights() {
  const claims = await prisma.claim.findMany({
    include: { applicableRule: true },
  });

  const byStatus = {
    APPROVED: 0,
    REJECTED: 0,
    PENDING: 0,
    REVIEW: 0,
  } satisfies Record<ClaimStatus, number>;

  const reasonCounts = new Map<string, number>();
  const ruleCounts = new Map<string, { name: string; count: number }>();
  const monthly = new Map<string, { rejected: number; total: number }>();

  claims.forEach((claim) => {
    byStatus[claim.status] += 1;
    const month = claim.serviceDate.toISOString().slice(0, 7);
    const bucket = monthly.get(month) ?? { rejected: 0, total: 0 };
    bucket.total += 1;
    if (claim.status === "REJECTED") {
      bucket.rejected += 1;
      const reason = claim.rejectionReason ?? "Unspecified";
      reasonCounts.set(reason, (reasonCounts.get(reason) ?? 0) + 1);
      if (claim.applicableRule) {
        const current = ruleCounts.get(claim.applicableRule.ruleId) ?? {
          name: claim.applicableRule.name,
          count: 0,
        };
        current.count += 1;
        ruleCounts.set(claim.applicableRule.ruleId, current);
      }
    }
    monthly.set(month, bucket);
  });

  const topReasons = [...reasonCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([reason, count]) => ({ reason, count }));

  const rulesCausingRejections = [...ruleCounts.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6)
    .map(([ruleId, value]) => ({ ruleId, name: value.name, count: value.count }));

  const rejectionTrend = [...monthly.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, value]) => ({
      month,
      rejected: value.rejected,
      total: value.total,
    }));

  const reviewClaims = claims
    .filter((claim) => claim.status === "REVIEW")
    .slice(0, 8)
    .map((claim) => ({
      claimId: claim.claimId,
      serviceName: claim.serviceName,
      submittedAmount: Number(claim.submittedAmount),
      status: claim.status,
    }));

  const cards = [
    {
      title: "Most common rejection reason",
      detail: topReasons[0]
        ? `${topReasons[0].reason} (${topReasons[0].count} claims)`
        : "No rejections in the demo set",
      severity: "high" as const,
    },
    {
      title: "Rules with highest rejection volume",
      detail: rulesCausingRejections[0]
        ? `${rulesCausingRejections[0].ruleId} — ${rulesCausingRejections[0].name}`
        : "No rule-linked rejections",
      severity: "medium" as const,
    },
    {
      title: "Claims requiring manual review",
      detail: `${byStatus.REVIEW} claims are queued for analyst review`,
      severity: "medium" as const,
    },
    {
      title: "Potential rule conflict",
      detail:
        "MR-204 is eligibility-led without prior authorization, while MR-305 requires both eligibility and PA for overlapping specialty services.",
      severity: "low" as const,
    },
  ];

  return {
    totals: {
      total: claims.length,
      ...byStatus,
    },
    topReasons,
    rulesCausingRejections,
    rejectionTrend,
    reviewClaims,
    cards,
  };
}
