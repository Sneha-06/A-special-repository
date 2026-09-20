-- CreateEnum
CREATE TYPE "AnalysisType" AS ENUM ('CODE_REVIEW', 'EXPLANATION', 'REFACTORING', 'BUG_DETECTION', 'PERFORMANCE', 'SECURITY', 'REACT_ANALYSIS', 'ACCESSIBILITY', 'UNIT_TESTS', 'DOCUMENTATION');

-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "FindingSeverity" AS ENUM ('INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "FindingCategory" AS ENUM ('BUG', 'SECURITY', 'PERFORMANCE', 'STYLE', 'ACCESSIBILITY', 'REACT', 'MAINTAINABILITY', 'TESTING', 'DOCUMENTATION', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "githubLogin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repository" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "githubId" INTEGER,
    "owner" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "description" TEXT,
    "defaultBranch" TEXT NOT NULL DEFAULT 'main',
    "language" TEXT,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "htmlUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Repository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PullRequest" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "githubId" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "author" TEXT,
    "baseBranch" TEXT,
    "headBranch" TEXT,
    "htmlUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PullRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "repositoryId" TEXT,
    "pullRequestId" TEXT,
    "title" TEXT NOT NULL,
    "filePath" TEXT,
    "language" TEXT NOT NULL DEFAULT 'typescript',
    "sourceCode" TEXT NOT NULL,
    "analysisType" "AnalysisType" NOT NULL,
    "status" "AnalysisStatus" NOT NULL DEFAULT 'PROCESSING',
    "model" TEXT NOT NULL,
    "summary" TEXT,
    "improvedCode" TEXT,
    "documentation" TEXT,
    "unitTests" TEXT,
    "input" JSONB NOT NULL,
    "output" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CodeSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Finding" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "FindingSeverity" NOT NULL DEFAULT 'MEDIUM',
    "category" "FindingCategory" NOT NULL DEFAULT 'OTHER',
    "lineStart" INTEGER,
    "lineEnd" INTEGER,
    "suggestion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Finding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE UNIQUE INDEX "Repository_githubId_key" ON "Repository"("githubId");
CREATE UNIQUE INDEX "Repository_owner_name_key" ON "Repository"("owner", "name");
CREATE INDEX "Repository_userId_idx" ON "Repository"("userId");
CREATE UNIQUE INDEX "PullRequest_repositoryId_number_key" ON "PullRequest"("repositoryId", "number");
CREATE INDEX "PullRequest_repositoryId_idx" ON "PullRequest"("repositoryId");
CREATE INDEX "CodeSession_analysisType_idx" ON "CodeSession"("analysisType");
CREATE INDEX "CodeSession_status_idx" ON "CodeSession"("status");
CREATE INDEX "CodeSession_createdAt_idx" ON "CodeSession"("createdAt");
CREATE INDEX "CodeSession_repositoryId_idx" ON "CodeSession"("repositoryId");
CREATE INDEX "Finding_sessionId_idx" ON "Finding"("sessionId");
CREATE INDEX "Finding_severity_idx" ON "Finding"("severity");
CREATE INDEX "Finding_category_idx" ON "Finding"("category");

-- AddForeignKey
ALTER TABLE "Repository" ADD CONSTRAINT "Repository_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PullRequest" ADD CONSTRAINT "PullRequest_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CodeSession" ADD CONSTRAINT "CodeSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CodeSession" ADD CONSTRAINT "CodeSession_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CodeSession" ADD CONSTRAINT "CodeSession_pullRequestId_fkey" FOREIGN KEY ("pullRequestId") REFERENCES "PullRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CodeSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
