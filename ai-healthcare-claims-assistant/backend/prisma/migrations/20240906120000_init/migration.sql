-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('APPROVED', 'REJECTED', 'PENDING', 'REVIEW');

-- CreateEnum
CREATE TYPE "RuleStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DRAFT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'analyst',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "planName" TEXT NOT NULL,
    "eligibilityStatus" TEXT NOT NULL,
    "groupNumber" TEXT NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "npi" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "networkStatus" TEXT NOT NULL,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MandateRule" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "status" "RuleStatus" NOT NULL DEFAULT 'ACTIVE',
    "description" TEXT NOT NULL,
    "eligibilityConditions" TEXT NOT NULL,
    "authorizationRequirements" TEXT NOT NULL,
    "serviceRestrictions" TEXT NOT NULL,
    "coverageConditions" TEXT NOT NULL,
    "embedding" JSONB,

    CONSTRAINT "MandateRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "serviceCode" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "serviceDate" TIMESTAMP(3) NOT NULL,
    "submittedAmount" DECIMAL(12,2) NOT NULL,
    "approvedAmount" DECIMAL(12,2) NOT NULL,
    "status" "ClaimStatus" NOT NULL,
    "rejectionReason" TEXT,
    "applicableRuleId" TEXT,
    "timeline" JSONB NOT NULL,
    "missingInformation" JSONB,
    "embedding" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "textContent" TEXT NOT NULL,
    "summary" TEXT,
    "keyRules" JSONB,
    "eligibilityConditions" JSONB,
    "importantChanges" JSONB,
    "insights" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentChunk" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" JSONB NOT NULL,

    CONSTRAINT "DocumentChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiConversation" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "structured" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Member_memberId_key" ON "Member"("memberId");
CREATE UNIQUE INDEX "Provider_providerId_key" ON "Provider"("providerId");
CREATE UNIQUE INDEX "MandateRule_ruleId_key" ON "MandateRule"("ruleId");
CREATE UNIQUE INDEX "Claim_claimId_key" ON "Claim"("claimId");

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_applicableRuleId_fkey" FOREIGN KEY ("applicableRuleId") REFERENCES "MandateRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DocumentChunk" ADD CONSTRAINT "DocumentChunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiMessage" ADD CONSTRAINT "AiMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AiConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
