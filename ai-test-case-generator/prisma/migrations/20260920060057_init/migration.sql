-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "RequirementPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('USER_STORY', 'BUSINESS_RULE', 'REGULATION', 'FUNCTIONAL_SPEC', 'BRD');

-- CreateEnum
CREATE TYPE "TestCategory" AS ENUM ('FUNCTIONAL', 'INTEGRATION', 'REGRESSION', 'SMOKE', 'SECURITY', 'PERFORMANCE', 'NEGATIVE', 'EDGE_CASE');

-- CreateEnum
CREATE TYPE "TestPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "TestSeverity" AS ENUM ('MINOR', 'MODERATE', 'MAJOR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "GenerationType" AS ENUM ('REQUIREMENT_ANALYSIS', 'ACCEPTANCE_CRITERIA', 'TEST_CASES', 'AUTOMATION_CODE');

-- CreateEnum
CREATE TYPE "GenerationStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Requirement" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "RequirementPriority" NOT NULL DEFAULT 'MEDIUM',
    "sourceType" "SourceType" NOT NULL DEFAULT 'USER_STORY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Requirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequirementAnalysis" (
    "id" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "actors" JSONB NOT NULL,
    "preconditions" JSONB NOT NULL,
    "businessRules" JSONB NOT NULL,
    "functionalRequirements" JSONB NOT NULL,
    "nonFunctionalRequirements" JSONB NOT NULL,
    "assumptions" JSONB NOT NULL,
    "ambiguities" JSONB NOT NULL,
    "missingInformation" JSONB NOT NULL,
    "riskAreas" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequirementAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcceptanceCriteria" (
    "id" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "given" TEXT NOT NULL,
    "when" TEXT NOT NULL,
    "then" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcceptanceCriteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestCase" (
    "id" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "testCaseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "TestCategory" NOT NULL,
    "priority" "TestPriority" NOT NULL DEFAULT 'MEDIUM',
    "severity" "TestSeverity" NOT NULL DEFAULT 'MODERATE',
    "preconditions" TEXT NOT NULL,
    "expectedResult" TEXT NOT NULL,
    "postconditions" TEXT,
    "automationCandidate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestStep" (
    "id" TEXT NOT NULL,
    "testCaseId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "testData" TEXT,
    "expectedResult" TEXT NOT NULL,

    CONSTRAINT "TestStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestData" (
    "id" TEXT NOT NULL,
    "testCaseId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,

    CONSTRAINT "TestData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationCode" (
    "id" TEXT NOT NULL,
    "testCaseId" TEXT NOT NULL,
    "framework" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AutomationCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenerationHistory" (
    "id" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "generationType" "GenerationType" NOT NULL,
    "model" TEXT NOT NULL,
    "status" "GenerationStatus" NOT NULL DEFAULT 'COMPLETED',
    "input" JSONB NOT NULL,
    "output" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GenerationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Project_createdBy_idx" ON "Project"("createdBy");

-- CreateIndex
CREATE INDEX "Project_createdAt_idx" ON "Project"("createdAt");

-- CreateIndex
CREATE INDEX "Requirement_projectId_idx" ON "Requirement"("projectId");

-- CreateIndex
CREATE INDEX "Requirement_priority_idx" ON "Requirement"("priority");

-- CreateIndex
CREATE INDEX "Requirement_sourceType_idx" ON "Requirement"("sourceType");

-- CreateIndex
CREATE INDEX "Requirement_createdAt_idx" ON "Requirement"("createdAt");

-- CreateIndex
CREATE INDEX "RequirementAnalysis_requirementId_idx" ON "RequirementAnalysis"("requirementId");

-- CreateIndex
CREATE INDEX "RequirementAnalysis_createdAt_idx" ON "RequirementAnalysis"("createdAt");

-- CreateIndex
CREATE INDEX "AcceptanceCriteria_requirementId_idx" ON "AcceptanceCriteria"("requirementId");

-- CreateIndex
CREATE UNIQUE INDEX "TestCase_testCaseId_key" ON "TestCase"("testCaseId");

-- CreateIndex
CREATE INDEX "TestCase_requirementId_idx" ON "TestCase"("requirementId");

-- CreateIndex
CREATE INDEX "TestCase_category_idx" ON "TestCase"("category");

-- CreateIndex
CREATE INDEX "TestCase_priority_idx" ON "TestCase"("priority");

-- CreateIndex
CREATE INDEX "TestCase_automationCandidate_idx" ON "TestCase"("automationCandidate");

-- CreateIndex
CREATE INDEX "TestStep_testCaseId_idx" ON "TestStep"("testCaseId");

-- CreateIndex
CREATE UNIQUE INDEX "TestStep_testCaseId_stepNumber_key" ON "TestStep"("testCaseId", "stepNumber");

-- CreateIndex
CREATE INDEX "TestData_testCaseId_idx" ON "TestData"("testCaseId");

-- CreateIndex
CREATE INDEX "TestData_field_idx" ON "TestData"("field");

-- CreateIndex
CREATE INDEX "AutomationCode_testCaseId_idx" ON "AutomationCode"("testCaseId");

-- CreateIndex
CREATE INDEX "AutomationCode_framework_idx" ON "AutomationCode"("framework");

-- CreateIndex
CREATE INDEX "GenerationHistory_requirementId_idx" ON "GenerationHistory"("requirementId");

-- CreateIndex
CREATE INDEX "GenerationHistory_generationType_idx" ON "GenerationHistory"("generationType");

-- CreateIndex
CREATE INDEX "GenerationHistory_status_idx" ON "GenerationHistory"("status");

-- CreateIndex
CREATE INDEX "GenerationHistory_createdAt_idx" ON "GenerationHistory"("createdAt");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requirement" ADD CONSTRAINT "Requirement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequirementAnalysis" ADD CONSTRAINT "RequirementAnalysis_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "Requirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcceptanceCriteria" ADD CONSTRAINT "AcceptanceCriteria_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "Requirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "Requirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestStep" ADD CONSTRAINT "TestStep_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "TestCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestData" ADD CONSTRAINT "TestData_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "TestCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationCode" ADD CONSTRAINT "AutomationCode_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "TestCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenerationHistory" ADD CONSTRAINT "GenerationHistory_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "Requirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
