import { Chip } from "@mui/material";
import type { ClaimStatus } from "../types";

const map: Record<
  string,
  { label: string; color: "success" | "error" | "warning" | "info" | "default" }
> = {
  APPROVED: { label: "Approved", color: "success" },
  REJECTED: { label: "Rejected", color: "error" },
  PENDING: { label: "Pending", color: "warning" },
  REVIEW: { label: "Needs review", color: "info" },
  ACTIVE: { label: "Active", color: "success" },
  INACTIVE: { label: "Inactive", color: "default" },
  DRAFT: { label: "Draft", color: "warning" },
};

export function StatusChip({ status }: { status: ClaimStatus | string }) {
  const config = map[status] ?? { label: status, color: "default" as const };
  return <Chip size="small" variant="outlined" color={config.color} label={config.label} />;
}
