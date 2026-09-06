import { Chip, LinearProgress, Stack, Typography } from "@mui/material";

export function ConfidenceMeter({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <Stack spacing={0.5} sx={{ minWidth: 140 }}>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="caption" color="text.secondary">
          Confidence
        </Typography>
        <Typography variant="caption" fontWeight={600}>
          {pct}%
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={pct}
        aria-label={`Confidence ${pct} percent`}
        sx={{ height: 8, borderRadius: 4 }}
      />
    </Stack>
  );
}

export function AiGeneratedBadge() {
  return (
    <Chip
      size="small"
      variant="outlined"
      color="primary"
      label="AI-generated"
      sx={{ fontWeight: 600 }}
    />
  );
}
