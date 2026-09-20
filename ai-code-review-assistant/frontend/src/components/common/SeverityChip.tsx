import { Chip } from "@mui/material";
import { SEVERITY_COLORS } from "../../utils/constants";

export function SeverityChip({ severity }: { severity: string }) {
  return (
    <Chip
      size="small"
      label={severity}
      color={SEVERITY_COLORS[severity] ?? "default"}
      variant="outlined"
    />
  );
}
