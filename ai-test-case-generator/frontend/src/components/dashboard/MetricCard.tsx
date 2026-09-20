import { Box, Paper, Skeleton, Tooltip, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  tooltip?: string;
  loading?: boolean;
  accent?: string;
}

export function MetricCard({ label, value, icon, tooltip, loading, accent }: MetricCardProps) {
  const content = (
    <Paper sx={{ p: 2.5, height: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Typography variant="subtitle2" color="text.secondary">{label}</Typography>
        {icon ? (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              bgcolor: accent ? `${accent}14` : "primary.main",
              color: accent ?? "primary.main",
              "& .MuiSvgIcon-root": { fontSize: 22 },
            }}
          >
            {icon}
          </Box>
        ) : null}
      </Box>
      {loading ? (
        <Skeleton variant="text" width="40%" height={48} sx={{ mt: 1 }} />
      ) : (
        <Typography variant="h4" sx={{ mt: 1.5, fontWeight: 700 }}>
          {value}
        </Typography>
      )}
    </Paper>
  );

  if (tooltip) {
    return <Tooltip title={tooltip} arrow>{content}</Tooltip>;
  }

  return content;
}
