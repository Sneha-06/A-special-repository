import { Chip, Tooltip } from "@mui/material";

const STATUS_CONFIG: Record<string, { label: string; color: "default" | "success" | "warning" | "error" | "info" }> = {
  COMPLETED: { label: "Completed", color: "success" },
  PENDING: { label: "Pending", color: "warning" },
  PROCESSING: { label: "Processing", color: "info" },
  FAILED: { label: "Failed", color: "error" },
};

interface StatusChipProps {
  status: string;
}

export function StatusChip({ status }: StatusChipProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, color: "default" as const };

  return (
    <Tooltip title={`Generation status: ${config.label}`} arrow>
      <Chip label={config.label} color={config.color} size="small" variant="outlined" />
    </Tooltip>
  );
}
