import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import {
  GenerationStatus,
  GenerationType,
  PrismaClient,
  ProjectStatus,
  RequirementPriority,
  SourceType,
  TestCategory,
  TestPriority,
  TestSeverity,
} from "@prisma/client";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const prisma = new PrismaClient();

const DEMO_PASSWORD = "DemoPass123!";

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const qaLead = await prisma.user.upsert({
    where: { email: "sarah.chen@demo.health" },
    update: { name: "Sarah Chen", passwordHash },
    create: {
      name: "Sarah Chen",
      email: "sarah.chen@demo.health",
      passwordHash,
    },
  });

  const analyst = await prisma.user.upsert({
    where: { email: "marcus.johnson@demo.health" },
    update: { name: "Marcus Johnson", passwordHash },
    create: {
      name: "Marcus Johnson",
      email: "marcus.johnson@demo.health",
      passwordHash,
    },
  });

  const project = await prisma.project.upsert({
    where: { id: "proj-healthcare-claims" },
    update: {
      name: "Healthcare Claims Management System",
      description:
        "Enterprise platform for adjudicating medical and pharmacy claims, verifying member eligibility, and managing prior authorization workflows for a regional health plan.",
      status: ProjectStatus.ACTIVE,
      createdBy: qaLead.id,
    },
    create: {
      id: "proj-healthcare-claims",
      name: "Healthcare Claims Management System",
      description:
        "Enterprise platform for adjudicating medical and pharmacy claims, verifying member eligibility, and managing prior authorization workflows for a regional health plan.",
      status: ProjectStatus.ACTIVE,
      createdBy: qaLead.id,
    },
  });

  const requirements = [
    {
      id: "req-eligibility-verification",
      title: "Real-time member eligibility verification",
      description:
        "When a claims processor submits a pharmacy or medical claim, the system must verify member eligibility in real time against the eligibility master. Claims for termed members or members with lapsed coverage must be rejected with a specific eligibility denial code (ELG-001).",
      priority: RequirementPriority.CRITICAL,
      sourceType: SourceType.BUSINESS_RULE,
    },
    {
      id: "req-prior-auth-specialty",
      title: "Prior authorization for specialty pharmacy claims",
      description:
        "Specialty pharmacy claims for NDCs on the specialty formulary require a valid prior authorization (PA) on file before adjudication. The PA must be active on the date of service and match the prescribing provider NPI.",
      priority: RequirementPriority.HIGH,
      sourceType: SourceType.REGULATION,
    },
    {
      id: "req-claim-adjudication",
      title: "Automated claim adjudication with benefit rules",
      description:
        "The adjudication engine must apply plan benefit rules including copay tiers, deductible accumulation, and out-of-pocket maximum tracking. Partial approvals must calculate member responsibility accurately and persist audit trail entries.",
      priority: RequirementPriority.HIGH,
      sourceType: SourceType.FUNCTIONAL_SPEC,
    },
    {
      id: "req-appeals-workflow",
      title: "Member appeals and grievance intake",
      description:
        "Members and authorized representatives can submit claim appeals within 180 days of denial. The system must capture appeal reason, supporting documents, and route to the appeals queue with SLA tracking (acknowledgment within 5 business days).",
      priority: RequirementPriority.MEDIUM,
      sourceType: SourceType.USER_STORY,
    },
    {
      id: "req-hipaa-audit",
      title: "HIPAA-compliant audit logging for PHI access",
      description:
        "All access to protected health information (PHI) including member demographics, diagnosis codes, and claim details must be logged with user ID, timestamp, action type, and record identifier. Logs must be immutable and retained for 7 years.",
      priority: RequirementPriority.CRITICAL,
      sourceType: SourceType.REGULATION,
    },
  ];

  for (const req of requirements) {
    await prisma.requirement.upsert({
      where: { id: req.id },
      update: {
        projectId: project.id,
        title: req.title,
        description: req.description,
        priority: req.priority,
        sourceType: req.sourceType,
      },
      create: {
        id: req.id,
        projectId: project.id,
        title: req.title,
        description: req.description,
        priority: req.priority,
        sourceType: req.sourceType,
      },
    });
  }

  await prisma.requirementAnalysis.upsert({
    where: { id: "analysis-eligibility" },
    update: {},
    create: {
      id: "analysis-eligibility",
      requirementId: "req-eligibility-verification",
      summary:
        "The system must perform synchronous eligibility lookups at claim submission and block adjudication when coverage is inactive.",
      actors: ["Claims Processor", "Eligibility Service", "Member Master Database"],
      preconditions: [
        "Member ID and date of service are present on the claim",
        "Eligibility service is available and responding within SLA",
      ],
      businessRules: [
        "Active coverage is required on the date of service",
        "Terminated members receive denial code ELG-001",
        "Grace period members are eligible only if premium is current",
      ],
      functionalRequirements: [
        "Call eligibility API with member ID, plan ID, and date of service",
        "Return eligibility status within 2 seconds for 95th percentile",
        "Persist eligibility response on the claim record",
      ],
      nonFunctionalRequirements: [
        "Eligibility lookup must complete within 2 seconds at p95",
        "System must handle 500 concurrent eligibility requests",
      ],
      assumptions: [
        "Eligibility master is updated nightly from enrollment system",
        "Member ID format is validated upstream",
      ],
      ambiguities: [
        "Grace period definition varies by plan type — needs plan-specific configuration",
      ],
      missingInformation: [
        "Retroactive eligibility adjustment window not specified",
      ],
      riskAreas: [
        "False positives on termed members could cause improper payment",
        "Eligibility service downtime could block all claim processing",
      ],
    },
  });

  await prisma.requirementAnalysis.upsert({
    where: { id: "analysis-prior-auth" },
    update: {},
    create: {
      id: "analysis-prior-auth",
      requirementId: "req-prior-auth-specialty",
      summary:
        "Specialty pharmacy claims require matching prior authorization before payment can be issued.",
      actors: ["Pharmacy Claims Adjudicator", "Prior Auth System", "Prescriber"],
      preconditions: [
        "NDC is on the specialty formulary list",
        "Claim is submitted through pharmacy benefit channel",
      ],
      businessRules: [
        "PA must be approved and not expired on date of service",
        "Prescriber NPI on claim must match PA prescriber NPI",
        "Quantity dispensed must not exceed PA approved quantity",
      ],
      functionalRequirements: [
        "Lookup PA by member ID and NDC",
        "Validate PA status, dates, and prescriber match",
        "Deny with PA-002 if no valid authorization found",
      ],
      nonFunctionalRequirements: [
        "PA lookup must not add more than 500ms to adjudication time",
      ],
      assumptions: ["PA system is source of truth for authorization status"],
      ambiguities: ["Partial fills against multi-fill PA not defined"],
      missingInformation: ["Override workflow for medical director exceptions"],
      riskAreas: [
        "Paying without PA creates compliance and fraud exposure",
        "Stale PA data could incorrectly deny valid claims",
      ],
    },
  });

  const acceptanceCriteria = [
    {
      id: "ac-eligibility-1",
      requirementId: "req-eligibility-verification",
      given: "An active member with valid coverage on the date of service",
      when: "A pharmacy claim is submitted for adjudication",
      then: "The claim proceeds to benefit rule evaluation with eligibility status VERIFIED",
    },
    {
      id: "ac-eligibility-2",
      requirementId: "req-eligibility-verification",
      given: "A member whose coverage terminated 30 days before the date of service",
      when: "A medical claim is submitted",
      then: "The claim is rejected with denial code ELG-001 and reason 'Member not eligible'",
    },
    {
      id: "ac-prior-auth-1",
      requirementId: "req-prior-auth-specialty",
      given: "A specialty NDC with an approved PA valid on the date of service",
      when: "A pharmacy claim is submitted with matching prescriber NPI",
      then: "The claim passes PA validation and proceeds to pricing",
    },
    {
      id: "ac-prior-auth-2",
      requirementId: "req-prior-auth-specialty",
      given: "A specialty NDC without any prior authorization on file",
      when: "A pharmacy claim is submitted",
      then: "The claim is denied with code PA-002 and message 'Prior authorization required'",
    },
    {
      id: "ac-hipaa-1",
      requirementId: "req-hipaa-audit",
      given: "An authenticated user with claims read permission",
      when: "The user views a member claim containing PHI",
      then: "An immutable audit log entry is created with user ID, timestamp, action VIEW, and claim ID",
    },
  ];

  for (const ac of acceptanceCriteria) {
    await prisma.acceptanceCriteria.upsert({
      where: { id: ac.id },
      update: ac,
      create: ac,
    });
  }

  const testCases = [
    {
      id: "tc-db-eligibility-active",
      requirementId: "req-eligibility-verification",
      testCaseId: "TC-HCM-ELG-001",
      title: "Verify claim adjudication for active member",
      category: TestCategory.FUNCTIONAL,
      priority: TestPriority.CRITICAL,
      severity: TestSeverity.CRITICAL,
      preconditions: "Member MBR-100234 is active with plan PLN-COMM-2025 on date of service 2025-09-15",
      expectedResult: "Claim status is APPROVED for eligibility check; eligibility flag is VERIFIED",
      postconditions: "Eligibility response is persisted on claim CLM-90001",
      automationCandidate: true,
      steps: [
        {
          stepNumber: 1,
          action: "Submit pharmacy claim with member ID MBR-100234 and DOS 2025-09-15",
          testData: "NDC: 00074-3799-02, Qty: 30",
          expectedResult: "Claim is accepted into adjudication queue",
        },
        {
          stepNumber: 2,
          action: "Verify eligibility lookup is triggered",
          testData: null,
          expectedResult: "Eligibility service returns status ACTIVE",
        },
        {
          stepNumber: 3,
          action: "Check claim eligibility status after adjudication",
          testData: null,
          expectedResult: "Claim shows eligibilityStatus=VERIFIED, no ELG denial codes",
        },
      ],
      testDataRows: [
        { field: "memberId", value: "MBR-100234", dataType: "string" },
        { field: "planId", value: "PLN-COMM-2025", dataType: "string" },
        { field: "dateOfService", value: "2025-09-15", dataType: "date" },
      ],
      automation: {
        framework: "Playwright",
        language: "TypeScript",
        code: `test('TC-HCM-ELG-001: active member eligibility', async ({ request }) => {
  const response = await request.post('/api/claims/adjudicate', {
    data: { memberId: 'MBR-100234', planId: 'PLN-COMM-2025', dateOfService: '2025-09-15' },
  });
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.eligibilityStatus).toBe('VERIFIED');
});`,
      },
    },
    {
      id: "tc-db-eligibility-term",
      requirementId: "req-eligibility-verification",
      testCaseId: "TC-HCM-ELG-002",
      title: "Reject claim for termed member",
      category: TestCategory.NEGATIVE,
      priority: TestPriority.CRITICAL,
      severity: TestSeverity.MAJOR,
      preconditions: "Member MBR-100567 coverage terminated on 2025-08-01",
      expectedResult: "Claim is rejected with denial code ELG-001",
      postconditions: "No payment is issued; denial reason is recorded",
      automationCandidate: true,
      steps: [
        {
          stepNumber: 1,
          action: "Submit medical claim for member MBR-100567 with DOS 2025-09-10",
          testData: "CPT: 99213, Place of service: 11",
          expectedResult: "Claim enters adjudication",
        },
        {
          stepNumber: 2,
          action: "Review adjudication outcome",
          testData: null,
          expectedResult: "Claim status is DENIED with code ELG-001",
        },
      ],
      testDataRows: [
        { field: "memberId", value: "MBR-100567", dataType: "string" },
        { field: "terminationDate", value: "2025-08-01", dataType: "date" },
      ],
      automation: null,
    },
    {
      id: "tc-db-pa-valid",
      requirementId: "req-prior-auth-specialty",
      testCaseId: "TC-HCM-PA-001",
      title: "Approve specialty claim with valid prior authorization",
      category: TestCategory.FUNCTIONAL,
      priority: TestPriority.HIGH,
      severity: TestSeverity.MAJOR,
      preconditions: "PA PA-77821 is approved for member MBR-100234, NDC 00074-3799-02, prescriber NPI 1234567890",
      expectedResult: "Claim passes PA validation and proceeds to benefit calculation",
      postconditions: "PA reference PA-77821 is linked to claim",
      automationCandidate: true,
      steps: [
        {
          stepNumber: 1,
          action: "Submit specialty pharmacy claim with NDC 00074-3799-02",
          testData: "Prescriber NPI: 1234567890, Qty: 30",
          expectedResult: "Claim accepted",
        },
        {
          stepNumber: 2,
          action: "Verify PA lookup matches approved authorization",
          testData: null,
          expectedResult: "PA validation returns PASS",
        },
      ],
      testDataRows: [
        { field: "paNumber", value: "PA-77821", dataType: "string" },
        { field: "ndc", value: "00074-3799-02", dataType: "string" },
      ],
      automation: {
        framework: "Cypress",
        language: "JavaScript",
        code: `it('TC-HCM-PA-001: valid PA allows specialty claim', () => {
  cy.submitPharmacyClaim({ memberId: 'MBR-100234', ndc: '00074-3799-02', paNumber: 'PA-77821' });
  cy.get('[data-testid=claim-status]').should('contain', 'PA_VALIDATED');
});`,
      },
    },
    {
      id: "tc-db-pa-missing",
      requirementId: "req-prior-auth-specialty",
      testCaseId: "TC-HCM-PA-002",
      title: "Deny specialty claim without prior authorization",
      category: TestCategory.NEGATIVE,
      priority: TestPriority.HIGH,
      severity: TestSeverity.MAJOR,
      preconditions: "Member MBR-100890 has no PA on file for specialty NDC 00074-3799-02",
      expectedResult: "Claim denied with code PA-002",
      postconditions: null,
      automationCandidate: false,
      steps: [
        {
          stepNumber: 1,
          action: "Submit specialty pharmacy claim without PA reference",
          testData: "NDC: 00074-3799-02, Member: MBR-100890",
          expectedResult: "Claim enters adjudication",
        },
        {
          stepNumber: 2,
          action: "Verify denial reason",
          testData: null,
          expectedResult: "Denial code PA-002 with message 'Prior authorization required'",
        },
      ],
      testDataRows: [
        { field: "memberId", value: "MBR-100890", dataType: "string" },
      ],
      automation: null,
    },
    {
      id: "tc-db-hipaa-audit",
      requirementId: "req-hipaa-audit",
      testCaseId: "TC-HCM-AUD-001",
      title: "Audit log created when PHI is accessed",
      category: TestCategory.SECURITY,
      priority: TestPriority.CRITICAL,
      severity: TestSeverity.CRITICAL,
      preconditions: "User analyst@demo.health is authenticated with claims read role",
      expectedResult: "Immutable audit entry created with user, timestamp, action, and record ID",
      postconditions: "Audit log cannot be modified or deleted by standard users",
      automationCandidate: true,
      steps: [
        {
          stepNumber: 1,
          action: "Authenticate as claims analyst",
          testData: `User: ${analyst.email}`,
          expectedResult: "Session established with claims:read scope",
        },
        {
          stepNumber: 2,
          action: "Retrieve claim CLM-90001 containing member PHI",
          testData: null,
          expectedResult: "Claim details returned successfully",
        },
        {
          stepNumber: 3,
          action: "Query audit log for claim CLM-90001",
          testData: null,
          expectedResult: "Entry exists with action=VIEW, userId matching analyst, timestamp within last minute",
        },
      ],
      testDataRows: [
        { field: "claimId", value: "CLM-90001", dataType: "string" },
        { field: "action", value: "VIEW", dataType: "string" },
      ],
      automation: null,
    },
  ];

  for (const tc of testCases) {
    await prisma.testCase.upsert({
      where: { id: tc.id },
      update: {
        requirementId: tc.requirementId,
        testCaseId: tc.testCaseId,
        title: tc.title,
        category: tc.category,
        priority: tc.priority,
        severity: tc.severity,
        preconditions: tc.preconditions,
        expectedResult: tc.expectedResult,
        postconditions: tc.postconditions,
        automationCandidate: tc.automationCandidate,
      },
      create: {
        id: tc.id,
        requirementId: tc.requirementId,
        testCaseId: tc.testCaseId,
        title: tc.title,
        category: tc.category,
        priority: tc.priority,
        severity: tc.severity,
        preconditions: tc.preconditions,
        expectedResult: tc.expectedResult,
        postconditions: tc.postconditions,
        automationCandidate: tc.automationCandidate,
      },
    });

    for (const step of tc.steps) {
      await prisma.testStep.upsert({
        where: {
          testCaseId_stepNumber: {
            testCaseId: tc.id,
            stepNumber: step.stepNumber,
          },
        },
        update: {
          action: step.action,
          testData: step.testData,
          expectedResult: step.expectedResult,
        },
        create: {
          testCaseId: tc.id,
          stepNumber: step.stepNumber,
          action: step.action,
          testData: step.testData,
          expectedResult: step.expectedResult,
        },
      });
    }

    for (const [index, row] of tc.testDataRows.entries()) {
      const dataId = `td-${tc.id}-${index}`;
      await prisma.testData.upsert({
        where: { id: dataId },
        update: row,
        create: {
          id: dataId,
          testCaseId: tc.id,
          ...row,
        },
      });
    }

    if (tc.automation) {
      await prisma.automationCode.upsert({
        where: { id: `auto-${tc.id}` },
        update: tc.automation,
        create: {
          id: `auto-${tc.id}`,
          testCaseId: tc.id,
          ...tc.automation,
        },
      });
    }
  }

  const generationHistory = [
    {
      id: "gen-eligibility-analysis",
      requirementId: "req-eligibility-verification",
      generationType: GenerationType.REQUIREMENT_ANALYSIS,
      model: "gpt-4o",
      status: GenerationStatus.COMPLETED,
      input: {
        title: "Real-time member eligibility verification",
        description:
          "When a claims processor submits a pharmacy or medical claim, the system must verify member eligibility in real time...",
      },
      output: {
        summary: "Synchronous eligibility verification required at claim submission",
        actors: ["Claims Processor", "Eligibility Service"],
        riskCount: 2,
      },
    },
    {
      id: "gen-eligibility-tests",
      requirementId: "req-eligibility-verification",
      generationType: GenerationType.TEST_CASES,
      model: "gpt-4o",
      status: GenerationStatus.COMPLETED,
      input: {
        requirementId: "req-eligibility-verification",
        acceptanceCriteriaCount: 2,
      },
      output: {
        testCasesGenerated: 2,
        testCaseIds: ["TC-HCM-ELG-001", "TC-HCM-ELG-002"],
      },
    },
    {
      id: "gen-pa-criteria",
      requirementId: "req-prior-auth-specialty",
      generationType: GenerationType.ACCEPTANCE_CRITERIA,
      model: "gpt-4o-mini",
      status: GenerationStatus.COMPLETED,
      input: {
        requirementId: "req-prior-auth-specialty",
      },
      output: {
        criteriaGenerated: 2,
        format: "Given-When-Then",
      },
    },
    {
      id: "gen-pa-automation",
      requirementId: "req-prior-auth-specialty",
      generationType: GenerationType.AUTOMATION_CODE,
      model: "gpt-4o",
      status: GenerationStatus.COMPLETED,
      input: {
        testCaseId: "TC-HCM-PA-001",
        framework: "Cypress",
      },
      output: {
        language: "JavaScript",
        linesOfCode: 3,
      },
    },
  ];

  for (const entry of generationHistory) {
    await prisma.generationHistory.upsert({
      where: { id: entry.id },
      update: entry,
      create: entry,
    });
  }

  console.log("Seed completed successfully.");
  console.log(`  Project: ${project.name}`);
  console.log(`  Users: ${qaLead.email}, ${analyst.email} (password: ${DEMO_PASSWORD})`);
  console.log(`  Requirements: ${requirements.length}`);
  console.log(`  Test cases: ${testCases.length}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
