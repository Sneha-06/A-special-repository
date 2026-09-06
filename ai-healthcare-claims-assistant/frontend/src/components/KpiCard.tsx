import { Box, Card, CardContent, Typography } from "@mui/material";
import type { ReactNode } from "react";

export function KpiCard({
  label,
  value,
  hint,
  accent,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent: string;
  icon?: ReactNode;
}) {
  return (
    <Card sx={{ height: "100%", overflow: "hidden" }}>
      <Box sx={{ height: 4, bgcolor: accent }} />
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            {label}
          </Typography>
          {icon ? <Box sx={{ color: accent }}>{icon}</Box> : null}
        </Box>
        <Typography variant="h4" sx={{ letterSpacing: "-0.03em" }}>
          {value}
        </Typography>
        {hint ? (
          <Typography variant="caption" color="text.secondary">
            {hint}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
}
