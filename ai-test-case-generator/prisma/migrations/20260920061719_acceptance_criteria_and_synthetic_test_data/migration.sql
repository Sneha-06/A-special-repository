-- AlterEnum
ALTER TYPE "GenerationType" ADD VALUE 'SYNTHETIC_TEST_DATA';

-- AlterTable
ALTER TABLE "AcceptanceCriteria" ADD COLUMN     "criteriaKey" TEXT;

-- CreateTable
CREATE TABLE "SyntheticTestData" (
    "id" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyntheticTestData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SyntheticTestData_requirementId_idx" ON "SyntheticTestData"("requirementId");

-- CreateIndex
CREATE INDEX "SyntheticTestData_purpose_idx" ON "SyntheticTestData"("purpose");

-- CreateIndex
CREATE INDEX "SyntheticTestData_field_idx" ON "SyntheticTestData"("field");

-- CreateIndex
CREATE INDEX "AcceptanceCriteria_criteriaKey_idx" ON "AcceptanceCriteria"("criteriaKey");

-- AddForeignKey
ALTER TABLE "SyntheticTestData" ADD CONSTRAINT "SyntheticTestData_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "Requirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
