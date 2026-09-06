import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { ClaimStatus, PrismaClient, RuleStatus } from "@prisma/client";
import { mockEmbed } from "../src/rag/embeddings";
import { chunkText } from "../src/rag/chunking";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const prisma = new PrismaClient();

const SAMPLE_MANDATE = `NORTHSTAR PBM SYNTHETIC MANDATE PACK
Effective 2025-01-01. Demo content only. No real member data.

Rule MR-204 Eligibility Verification for Specialty Pharmacy Services
Eligibility condition: Member must be active on an eligible commercial or exchange plan on the date of service.
Prior authorization is not required for standard specialty fills under MR-204.
Coverage is denied when eligibility cannot be verified or the member is termed.

Rule MR-305 Specialty Authorization and Eligibility Combined
Eligibility condition: Member must be active AND the requested NDC must appear on the specialty formulary.
Prior authorization is required before the first fill.
Service restriction: Limited to in-network specialty pharmacies.

Important changes in 2025:
- MR-204 no longer requires PA for maintenance specialty drugs.
- MR-305 raised the PA lookback window to 12 months.
- MR-410 adds quantity-limit edits for high-cost injectables.

Eligibility language common to all commercial plans:
The member must be enrolled, premiums current, and the service must be a covered pharmacy benefit.
`;

type RuleSeed = {
  ruleId: string;
  name: string;
  category: string;
  effectiveDate: string;
  status: RuleStatus;
  description: string;
  eligibilityConditions: string;
  authorizationRequirements: string;
  serviceRestrictions: string;
  coverageConditions: string;
};

const rules: RuleSeed[] = [
  {
    ruleId: "MR-204",
    name: "Eligibility Verification for Specialty Pharmacy",
    category: "Eligibility",
    effectiveDate: "2025-01-01",
    status: "ACTIVE",
    description: "Rejects claims when the member is not eligible on the date of service for specialty pharmacy benefits.",
    eligibilityConditions: "Member must be active on a covered commercial or exchange plan on the date of service.",
    authorizationRequirements: "Prior authorization is not required for standard specialty fills.",
    serviceRestrictions: "Applies to specialty pharmacy NDCs billed under the pharmacy benefit.",
    coverageConditions: "Service is covered only while eligibility is verified and the member is not termed.",
  },
  {
    ruleId: "MR-305",
    name: "Specialty PA and Eligibility Combined",
    category: "Authorization",
    effectiveDate: "2025-01-01",
    status: "ACTIVE",
    description: "Requires both eligibility verification and prior authorization for specialty medications.",
    eligibilityConditions: "Member must be active and the NDC must appear on the specialty formulary.",
    authorizationRequirements: "Prior authorization is required before the first fill and is valid for 12 months.",
    serviceRestrictions: "Limited to in-network specialty pharmacies.",
    coverageConditions: "Coverage begins only after PA approval and eligibility confirmation.",
  },
  {
    ruleId: "MR-118",
    name: "Formulary Tier Exception",
    category: "Formulary",
    effectiveDate: "2024-07-01",
    status: "ACTIVE",
    description: "Non-preferred brands require a formulary exception when a preferred alternative exists.",
    eligibilityConditions: "Member must have an active pharmacy benefit with exception processing enabled.",
    authorizationRequirements: "Formulary exception request required for non-preferred brands.",
    serviceRestrictions: "Generic and preferred brand alternatives must be considered first.",
    coverageConditions: "Exception approval places the product on a higher copay tier.",
  },
  {
    ruleId: "MR-221",
    name: "Quantity Limit Edit",
    category: "Utilization",
    effectiveDate: "2024-03-15",
    status: "ACTIVE",
    description: "Enforces plan quantity limits per 30-day supply.",
    eligibilityConditions: "Member must be eligible for pharmacy benefits.",
    authorizationRequirements: "Quantity limit override may be requested after a medical necessity review.",
    serviceRestrictions: "Days supply cannot exceed the plan maximum without an override.",
    coverageConditions: "Quantities within limit are covered at the applicable tier.",
  },
  {
    ruleId: "MR-330",
    name: "Step Therapy for Insulin",
    category: "Utilization",
    effectiveDate: "2024-11-01",
    status: "ACTIVE",
    description: "Requires documented trial of preferred insulin before covering a non-preferred product.",
    eligibilityConditions: "Member must have diabetes coverage on an active medical/pharmacy plan.",
    authorizationRequirements: "Step therapy exception if preferred agents are contraindicated.",
    serviceRestrictions: "Non-preferred insulin is not first-line.",
    coverageConditions: "Preferred insulin is covered without step documentation.",
  },
  {
    ruleId: "MR-401",
    name: "Out-of-Network Pharmacy Denial",
    category: "Network",
    effectiveDate: "2024-01-01",
    status: "ACTIVE",
    description: "Rejects retail claims billed by pharmacies outside the contracted network.",
    eligibilityConditions: "Member must use an in-network pharmacy unless an access exception applies.",
    authorizationRequirements: "Network exception required for out-of-network fills.",
    serviceRestrictions: "Out-of-network pharmacies are not payable by default.",
    coverageConditions: "In-network pharmacies are paid at contracted rates.",
  },
  {
    ruleId: "MR-410",
    name: "High-Cost Injectable Quantity Guard",
    category: "Utilization",
    effectiveDate: "2025-02-01",
    status: "ACTIVE",
    description: "Adds quantity and site-of-care checks for high-cost injectables.",
    eligibilityConditions: "Member must be eligible and the diagnosis must support the injectable.",
    authorizationRequirements: "PA required for first fill and for dose increases above labeled maximum.",
    serviceRestrictions: "Home infusion only when site-of-care criteria are met.",
    coverageConditions: "Covered when PA, quantity, and site-of-care edits pass.",
  },
  {
    ruleId: "MR-512",
    name: "Medicare Part D Transition Fill",
    category: "Transition",
    effectiveDate: "2025-01-01",
    status: "ACTIVE",
    description: "Allows a one-time transition fill for new enrollees on non-formulary maintenance drugs.",
    eligibilityConditions: "Member must be in the first 90 days of a new Part D enrollment (synthetic demo).",
    authorizationRequirements: "No PA on the first transition fill; subsequent fills follow standard edits.",
    serviceRestrictions: "Limited to a 30-day supply.",
    coverageConditions: "Transition fill is payable once per NDC per enrollment year.",
  },
  {
    ruleId: "MR-540",
    name: "Duplicate Therapy Guard",
    category: "Clinical",
    effectiveDate: "2024-05-01",
    status: "ACTIVE",
    description: "Rejects overlapping therapy in the same pharmacological class within 25 days.",
    eligibilityConditions: "Member must be eligible; history claims are evaluated.",
    authorizationRequirements: "Clinical override from a pharmacist reviewer.",
    serviceRestrictions: "Two concurrent agents in the same class are not payable.",
    coverageConditions: "Single-agent therapy is covered when otherwise eligible.",
  },
  {
    ruleId: "MR-602",
    name: "Age Restriction Pediatric",
    category: "Clinical",
    effectiveDate: "2023-09-01",
    status: "ACTIVE",
    description: "Certain pediatric formulations are covered only for members under 18.",
    eligibilityConditions: "Member age on date of service must be under 18.",
    authorizationRequirements: "Adult use requires a medical exception.",
    serviceRestrictions: "Adult members are not eligible for pediatric-only NDCs.",
    coverageConditions: "Pediatric members meeting age criteria are covered.",
  },
  {
    ruleId: "MR-710",
    name: "Coordination of Benefits Primary Payer",
    category: "COB",
    effectiveDate: "2024-06-01",
    status: "ACTIVE",
    description: "Requires other insurance to be billed first when the member has dual coverage.",
    eligibilityConditions: "COB flag must be current on the member record.",
    authorizationRequirements: "None.",
    serviceRestrictions: "Secondary payer claims need primary EOB.",
    coverageConditions: "Payable as secondary after primary adjudication.",
  },
  {
    ruleId: "MR-808",
    name: "Missing NDC / Invalid Service",
    category: "Data Quality",
    effectiveDate: "2023-01-01",
    status: "ACTIVE",
    description: "Rejects claims submitted without a valid service/NDC code.",
    eligibilityConditions: "Not evaluated until the service code is valid.",
    authorizationRequirements: "Not applicable.",
    serviceRestrictions: "Placeholder or blank NDC values are invalid.",
    coverageConditions: "Valid billed services proceed to remaining edits.",
  },
  {
    ruleId: "MR-901",
    name: "Experimental Therapy Exclusion",
    category: "Coverage",
    effectiveDate: "2024-08-01",
    status: "ACTIVE",
    description: "Excludes therapies designated as experimental in the synthetic coverage list.",
    eligibilityConditions: "Member eligibility is required but does not override the exclusion.",
    authorizationRequirements: "Coverage exception through medical policy review only.",
    serviceRestrictions: "Experimental NDCs are not a covered benefit.",
    coverageConditions: "Standard FDA-labeled therapies remain covered.",
  },
  {
    ruleId: "MR-990",
    name: "Draft Biosimilar Interchange",
    category: "Formulary",
    effectiveDate: "2026-01-01",
    status: "DRAFT",
    description: "Proposed interchange from originator biologics to preferred biosimilars.",
    eligibilityConditions: "Will apply to active specialty members after go-live.",
    authorizationRequirements: "PA may be waived when switching to the preferred biosimilar.",
    serviceRestrictions: "Originator product restricted after the effective date.",
    coverageConditions: "Preferred biosimilar covered at preferred specialty tier.",
  },
];

const members = [
  ["MEM-1001", "Ava", "Patel", "1988-04-12", "Northstar PPO Gold", "ACTIVE", "GRP-2201"],
  ["MEM-1002", "Noah", "Kim", "1975-11-03", "Northstar HMO Plus", "ACTIVE", "GRP-2201"],
  ["MEM-1003", "Mia", "Johnson", "1992-07-21", "Northstar Exchange Silver", "TERMINATED", "GRP-4480"],
  ["MEM-1004", "Liam", "Garcia", "1969-02-02", "Northstar Medicare Demo", "ACTIVE", "GRP-3309"],
  ["MEM-1005", "Sophia", "Nguyen", "2008-01-15", "Northstar Family PPO", "ACTIVE", "GRP-1188"],
  ["MEM-1006", "Ethan", "Brooks", "1981-09-30", "Northstar PPO Gold", "ACTIVE", "GRP-2201"],
  ["MEM-1007", "Olivia", "Rahman", "1996-12-08", "Northstar HMO Plus", "INACTIVE", "GRP-2201"],
  ["MEM-1008", "Lucas", "Singh", "1958-05-19", "Northstar Medicare Demo", "ACTIVE", "GRP-3309"],
] as const;

const providers = [
  ["PRV-501", "Lakeside Specialty Pharmacy", "1234567890", "Specialty Pharmacy", "IN_NETWORK"],
  ["PRV-502", "Harborview Medical Center", "2345678901", "Hospital Outpatient", "IN_NETWORK"],
  ["PRV-503", "Summit Retail Pharmacy", "3456789012", "Retail Pharmacy", "IN_NETWORK"],
  ["PRV-504", "Westfield Infusion", "4567890123", "Infusion", "IN_NETWORK"],
  ["PRV-505", "OpenRoad Pharmacy", "5678901234", "Retail Pharmacy", "OUT_OF_NETWORK"],
] as const;

const services = [
  ["J3490", "Specialty injectable — demo NDC A"],
  ["J3590", "Unclassified biologic — demo NDC B"],
  ["S5100", "Home infusion therapy visit"],
  ["99213", "Office visit, established patient"],
  ["J1745", "Infliximab demo unit"],
  ["J1439", "Ferric carboxymaltose demo"],
  ["00093-0058", "Preferred insulin analog demo"],
  ["00002-8215", "Non-preferred insulin demo"],
  ["C9399", "Unclassified drug / invalid NDC"],
];

function daysAgo(offset: number) {
  const date = new Date("2026-03-15T12:00:00Z");
  date.setUTCDate(date.getUTCDate() - offset);
  return date;
}

function timeline(status: ClaimStatus, submitted: Date) {
  const received = new Date(submitted);
  received.setUTCDate(received.getUTCDate() + 1);
  const adjudicated = new Date(received);
  adjudicated.setUTCDate(adjudicated.getUTCDate() + 2);
  return [
    { label: "Submitted", at: submitted.toISOString(), state: "complete" },
    { label: "Received", at: received.toISOString(), state: "complete" },
    {
      label: "Adjudicated",
      at: adjudicated.toISOString(),
      state: status === "PENDING" ? "current" : "complete",
    },
    {
      label: status === "REVIEW" ? "Manual review" : "Closed",
      at: status === "PENDING" ? null : adjudicated.toISOString(),
      state: status === "PENDING" ? "upcoming" : status === "REVIEW" ? "current" : "complete",
    },
  ];
}

function claimText(input: {
  claimId: string;
  status: string;
  serviceName: string;
  rejectionReason?: string;
  ruleId?: string;
}) {
  return [
    input.claimId,
    input.status,
    input.serviceName,
    input.rejectionReason ?? "",
    input.ruleId ?? "",
    "eligibility authorization coverage claim",
  ].join(" ");
}

async function main() {
  await prisma.aiMessage.deleteMany();
  await prisma.aiConversation.deleteMany();
  await prisma.documentChunk.deleteMany();
  await prisma.document.deleteMany();
  await prisma.claim.deleteMany();
  await prisma.mandateRule.deleteMany();
  await prisma.member.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.user.deleteMany();

  const password = process.env.DEMO_USER_PASSWORD ?? "DemoPass123!";
  await prisma.user.create({
    data: {
      email: (process.env.DEMO_USER_EMAIL ?? "analyst@demo.health").toLowerCase(),
      name: "Sneha Analyst",
      passwordHash: bcrypt.hashSync(password, 10),
      role: "analyst",
    },
  });

  const memberRows = await Promise.all(
    members.map(([memberId, firstName, lastName, dob, planName, eligibilityStatus, groupNumber]) =>
      prisma.member.create({
        data: {
          memberId,
          firstName,
          lastName,
          dateOfBirth: new Date(dob),
          planName,
          eligibilityStatus,
          groupNumber,
        },
      }),
    ),
  );

  const providerRows = await Promise.all(
    providers.map(([providerId, name, npi, specialty, networkStatus]) =>
      prisma.provider.create({
        data: { providerId, name, npi, specialty, networkStatus },
      }),
    ),
  );

  const ruleRows = await Promise.all(
    rules.map((rule) =>
      prisma.mandateRule.create({
        data: {
          ...rule,
          effectiveDate: new Date(rule.effectiveDate),
          embedding: mockEmbed(
            `${rule.ruleId} ${rule.name} ${rule.category} ${rule.description} ${rule.eligibilityConditions} ${rule.authorizationRequirements} ${rule.coverageConditions}`,
          ) as object,
        },
      }),
    ),
  );

  const ruleByCode = Object.fromEntries(ruleRows.map((rule) => [rule.ruleId, rule]));

  const statuses: ClaimStatus[] = [
    "REJECTED",
    "APPROVED",
    "REJECTED",
    "PENDING",
    "REVIEW",
    "APPROVED",
    "REJECTED",
    "APPROVED",
    "REJECTED",
    "REVIEW",
  ];
  const reasons = [
    "Eligibility condition not satisfied",
    null,
    "Prior authorization missing",
    null,
    "Quantity limit exceeded",
    null,
    "Out-of-network pharmacy",
    null,
    "Invalid or missing service code",
    "Potential duplicate therapy",
  ];
  const reasonRules = [
    "MR-204",
    "MR-204",
    "MR-305",
    "MR-118",
    "MR-221",
    "MR-330",
    "MR-401",
    "MR-512",
    "MR-808",
    "MR-540",
  ];

  const claimCreates = [];
  for (let i = 0; i < 48; i += 1) {
    const claimId = i === 0 ? "CLM-1024" : `CLM-${1025 + i}`;
    const status = i === 0 ? "REJECTED" : statuses[i % statuses.length];
    const rejectionReason =
      i === 0
        ? "Eligibility condition not satisfied"
        : status === "REJECTED" || status === "REVIEW"
          ? reasons[i % reasons.length]
          : null;
    const ruleId = i === 0 ? "MR-204" : reasonRules[i % reasonRules.length];
    const member = memberRows[i % memberRows.length];
    const provider = providerRows[i % providerRows.length];
    const service = i === 0 ? services[0] : services[i % services.length];
    const submitted = 180 + (i % 17) * 12;
    const approved = status === "APPROVED" ? submitted - (i % 5) * 4 : status === "PENDING" ? 0 : 0;
    const serviceDate = daysAgo(8 + i * 4);
    const missing =
      status === "REJECTED" && ruleId === "MR-204"
        ? ["Active eligibility on date of service"]
        : status === "REJECTED" && ruleId === "MR-305"
          ? ["Prior authorization number"]
          : [];

    claimCreates.push(
      prisma.claim.create({
        data: {
          claimId,
          memberId: member.id,
          providerId: provider.id,
          serviceCode: service[0],
          serviceName: service[1],
          serviceDate,
          submittedAmount: submitted,
          approvedAmount: approved,
          status,
          rejectionReason,
          applicableRuleId: ruleByCode[ruleId].id,
          timeline: timeline(status, serviceDate) as object,
          missingInformation: missing as object,
          embedding: mockEmbed(
            claimText({
              claimId,
              status,
              serviceName: service[1],
              rejectionReason: rejectionReason ?? undefined,
              ruleId,
            }),
          ) as object,
        },
      }),
    );
  }
  await Promise.all(claimCreates);

  const chunks = chunkText(SAMPLE_MANDATE);
  await prisma.document.create({
    data: {
      filename: "seed-northstar-mandate.txt",
      originalName: "Northstar PBM Synthetic Mandate Pack.txt",
      mimeType: "text/plain",
      size: SAMPLE_MANDATE.length,
      textContent: SAMPLE_MANDATE,
      summary:
        "Synthetic 2025 mandate pack covering MR-204 eligibility-only specialty rules and MR-305 combined PA plus eligibility.",
      keyRules: ["MR-204", "MR-305", "MR-410"],
      eligibilityConditions: [
        "Member must be active on an eligible commercial or exchange plan on the date of service.",
        "MR-305 also requires the NDC to appear on the specialty formulary.",
      ],
      importantChanges: [
        "MR-204 no longer requires PA for maintenance specialty drugs.",
        "MR-305 raised the PA lookback window to 12 months.",
      ],
      insights: [
        "Eligibility failures concentrate on MR-204.",
        "Specialty claims without PA are more likely to hit MR-305.",
      ],
      chunks: {
        create: chunks.map((chunk) => ({
          chunkIndex: chunk.chunkIndex,
          content: chunk.content,
          embedding: mockEmbed(chunk.content) as object,
        })),
      },
    },
  });

  const conversation = await prisma.aiConversation.create({
    data: {
      title: "Why was CLM-1024 rejected?",
    },
  });
  await prisma.aiMessage.createMany({
    data: [
      {
        conversationId: conversation.id,
        role: "user",
        content: "Why was claim CLM-1024 rejected?",
      },
      {
        conversationId: conversation.id,
        role: "assistant",
        content:
          "The claim was rejected because the submitted service does not satisfy the eligibility condition defined in Rule MR-204.",
        structured: {
          answer:
            "The claim was rejected because the submitted service does not satisfy the eligibility condition defined in Rule MR-204.",
          claimId: "CLM-1024",
          ruleId: "MR-204",
          confidence: 0.92,
          sources: [{ type: "rule", id: "MR-204", title: "Eligibility Rule" }],
          recommendations: [
            "Review member eligibility",
            "Verify submitted service information",
          ],
        },
      },
    ],
  });

  console.log("Seed complete: synthetic claims, rules, documents, and demo user created.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
