import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SAMPLE_REVIEWS = [
  {
    fileName: "src/utils/pricing.ts",
    language: "typescript",
    framework: "node",
    reviewTypes: ["general", "bugs"],
    overallScore: 72,
    issues: [
      { issueId: "ISSUE-001", title: "Missing type annotation", description: "Parameter lacks type.", severity: "medium", category: "code-quality", lineStart: 6 },
      { issueId: "ISSUE-002", title: "No error handling on fetch", description: "Network failures are not handled.", severity: "high", category: "bug", lineStart: 7 },
    ],
    summary: "Utility module needs stronger typing and fetch error handling.",
    daysAgo: 28,
    repo: { owner: "acme-corp", name: "billing-api", fullName: "acme-corp/billing-api", language: "TypeScript" },
  },
  {
    fileName: "src/components/UserCard.tsx",
    language: "tsx",
    framework: "react",
    reviewTypes: ["react", "accessibility"],
    overallScore: 81,
    issues: [
      { issueId: "ISSUE-001", title: "Missing alt text", description: "Image lacks accessible label.", severity: "high", category: "accessibility", lineStart: 14 },
      { issueId: "ISSUE-002", title: "Inline handler recreated", description: "Anonymous function in JSX causes re-renders.", severity: "medium", category: "react", lineStart: 22 },
    ],
    summary: "Solid component structure with minor accessibility and render optimizations.",
    daysAgo: 21,
    repo: { owner: "acme-corp", name: "web-app", fullName: "acme-corp/web-app", language: "TypeScript" },
  },
  {
    fileName: "api/auth.py",
    language: "python",
    framework: "fastapi",
    reviewTypes: ["security", "bugs"],
    overallScore: 58,
    issues: [
      { issueId: "ISSUE-001", title: "Hardcoded secret fallback", description: "Default JWT secret in code path.", severity: "critical", category: "security", lineStart: 11 },
      { issueId: "ISSUE-002", title: "Broad exception catch", description: "Swallows auth errors without logging.", severity: "high", category: "bug", lineStart: 34 },
      { issueId: "ISSUE-003", title: "Missing rate limiting", description: "Login endpoint has no throttling.", severity: "medium", category: "security", lineStart: 40 },
    ],
    summary: "Authentication module has critical security gaps that should be addressed before release.",
    daysAgo: 14,
    repo: { owner: "acme-corp", name: "auth-service", fullName: "acme-corp/auth-service", language: "Python" },
  },
  {
    fileName: "internal/cache/redis.go",
    language: "go",
    framework: "go",
    reviewTypes: ["performance", "code-quality"],
    overallScore: 88,
    issues: [
      { issueId: "ISSUE-001", title: "Connection not pooled", description: "New client created per request.", severity: "high", category: "performance", lineStart: 19 },
    ],
    summary: "Well-structured cache helper with one notable connection pooling issue.",
    daysAgo: 7,
    repo: { owner: "acme-corp", name: "platform-core", fullName: "acme-corp/platform-core", language: "Go" },
  },
  {
    fileName: "src/hooks/useDashboard.ts",
    language: "typescript",
    framework: "react",
    reviewTypes: ["general", "react"],
    overallScore: 91,
    issues: [],
    summary: "Clean hook implementation with clear separation of data fetching and state.",
    daysAgo: 2,
    repo: { owner: "acme-corp", name: "web-app", fullName: "acme-corp/web-app", language: "TypeScript" },
  },
  {
    fileName: "services/payment.service.ts",
    language: "typescript",
    framework: "nestjs",
    reviewTypes: ["security", "bugs", "performance"],
    overallScore: 65,
    issues: [
      { issueId: "ISSUE-001", title: "Unvalidated amount", description: "Payment amount not validated server-side.", severity: "critical", category: "security", lineStart: 45 },
      { issueId: "ISSUE-002", title: "Race on idempotency key", description: "Concurrent requests may duplicate charges.", severity: "critical", category: "bug", lineStart: 62 },
      { issueId: "ISSUE-003", title: "N+1 query pattern", description: "Loads related entities in a loop.", severity: "high", category: "performance", lineStart: 88 },
    ],
    summary: "Payment service requires urgent fixes around validation and concurrency.",
    daysAgo: 1,
    repo: { owner: "acme-corp", name: "billing-api", fullName: "acme-corp/billing-api", language: "TypeScript" },
  },
];

function countSeverity(issues: typeof SAMPLE_REVIEWS[number]["issues"]) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  for (const issue of issues) {
    counts[issue.severity as keyof typeof counts]++;
  }
  return counts;
}

async function main() {
  const existing = await prisma.codeReview.count();
  if (existing > 0) {
    console.log("Seed skipped — code reviews already exist");
    return;
  }

  for (const sample of SAMPLE_REVIEWS) {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - sample.daysAgo);
    const severity = countSeverity(sample.issues);

    const repository = await prisma.gitHubRepository.upsert({
      where: { owner_name: { owner: sample.repo.owner, name: sample.repo.name } },
      create: {
        owner: sample.repo.owner,
        name: sample.repo.name,
        fullName: sample.repo.fullName,
        language: sample.repo.language,
      },
      update: {
        fullName: sample.repo.fullName,
        language: sample.repo.language,
      },
    });

    const reviewResult = {
      summary: sample.summary,
      overallScore: sample.overallScore,
      issues: sample.issues.map((issue) => ({
        id: issue.issueId,
        title: issue.title,
        description: issue.description,
        severity: issue.severity,
        category: issue.category,
        lineStart: issue.lineStart ?? null,
        lineEnd: null,
        suggestion: "",
        explanation: "",
      })),
      strengths: ["Clear structure"],
      recommendations: ["Add tests for edge cases"],
    };

    await prisma.codeReview.create({
      data: {
        fileName: sample.fileName,
        language: sample.language,
        framework: sample.framework,
        reviewTypes: sample.reviewTypes,
        overallScore: sample.overallScore,
        issueCount: sample.issues.length,
        criticalCount: severity.critical,
        highCount: severity.high,
        mediumCount: severity.medium,
        lowCount: severity.low,
        summary: sample.summary,
        reviewResult,
        createdAt,
        repositoryId: repository.id,
        issues: {
          create: sample.issues.map((issue) => ({
            issueId: issue.issueId,
            title: issue.title,
            description: issue.description,
            severity: issue.severity,
            category: issue.category,
            lineStart: issue.lineStart ?? null,
          })),
        },
        history: {
          create: { action: "created", metadata: { source: "seed" } },
        },
      },
    });
  }

  console.log(`Seeded ${SAMPLE_REVIEWS.length} code reviews`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
