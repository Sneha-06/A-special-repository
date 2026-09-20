-- CreateTable
CREATE TABLE "github_repositories" (
    "id" TEXT NOT NULL,
    "githubId" INTEGER,
    "owner" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "description" TEXT,
    "defaultBranch" TEXT NOT NULL DEFAULT 'main',
    "language" TEXT,
    "htmlUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "github_repositories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "code_reviews" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "repositoryId" TEXT,
    "fileName" TEXT,
    "language" TEXT NOT NULL,
    "framework" TEXT,
    "reviewTypes" TEXT[],
    "overallScore" INTEGER NOT NULL,
    "issueCount" INTEGER NOT NULL DEFAULT 0,
    "criticalCount" INTEGER NOT NULL DEFAULT 0,
    "highCount" INTEGER NOT NULL DEFAULT 0,
    "mediumCount" INTEGER NOT NULL DEFAULT 0,
    "lowCount" INTEGER NOT NULL DEFAULT 0,
    "summary" TEXT NOT NULL,
    "reviewResult" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "code_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_issues" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "lineStart" INTEGER,
    "lineEnd" INTEGER,
    "suggestion" TEXT,
    "explanation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_history" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "action" TEXT NOT NULL DEFAULT 'created',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "github_repositories_githubId_key" ON "github_repositories"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "github_repositories_owner_name_key" ON "github_repositories"("owner", "name");

-- CreateIndex
CREATE INDEX "code_reviews_createdAt_idx" ON "code_reviews"("createdAt");

-- CreateIndex
CREATE INDEX "code_reviews_repositoryId_idx" ON "code_reviews"("repositoryId");

-- CreateIndex
CREATE INDEX "code_reviews_overallScore_idx" ON "code_reviews"("overallScore");

-- CreateIndex
CREATE INDEX "code_reviews_language_idx" ON "code_reviews"("language");

-- CreateIndex
CREATE INDEX "review_issues_reviewId_idx" ON "review_issues"("reviewId");

-- CreateIndex
CREATE INDEX "review_issues_severity_idx" ON "review_issues"("severity");

-- CreateIndex
CREATE INDEX "review_issues_category_idx" ON "review_issues"("category");

-- CreateIndex
CREATE INDEX "review_history_reviewId_idx" ON "review_history"("reviewId");

-- CreateIndex
CREATE INDEX "review_history_createdAt_idx" ON "review_history"("createdAt");

-- AddForeignKey
ALTER TABLE "code_reviews" ADD CONSTRAINT "code_reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_reviews" ADD CONSTRAINT "code_reviews_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "github_repositories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_issues" ADD CONSTRAINT "review_issues_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "code_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_history" ADD CONSTRAINT "review_history_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "code_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
