import { Chip, useTheme } from "@mui/material";
import type { ReviewSeverity } from "../../types/review";

export function ReviewSeverityChip({ severity }: { severity: ReviewSeverity }) {
  const theme = useTheme();
  const color = theme.palette.severity[severity].main;

  return (
    <Chip
      size="small"
      label={severity}
      sx={{
        borderColor: color,
        color,
        fontWeight: 600,
        textTransform: "capitalize",
      }}
      variant="outlined"
    />
  );
}
