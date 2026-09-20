import { Box, Paper, Skeleton, Typography, useTheme } from "@mui/material";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EmptyState } from "../common/EmptyState";
import type { TimelineChartPoint } from "../../types/dashboard";

interface RequirementsAnalyzedChartProps {
  data: TimelineChartPoint[];
  loading?: boolean;
}

function formatDateLabel(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function RequirementsAnalyzedChart({ data, loading }: RequirementsAnalyzedChartProps) {
  const theme = useTheme();
  const chartData = data.map((point) => ({
    ...point,
    label: formatDateLabel(point.date),
  }));
  const hasData = chartData.length > 0;

  return (
    <Paper sx={{ p: 2.5, height: "100%" }}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Requirements Analyzed Over Time
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        AI analysis runs grouped by date
      </Typography>
      {loading ? (
        <Skeleton variant="rounded" height={280} />
      ) : !hasData ? (
        <EmptyState
          title="No analysis history"
          description="Run requirement analysis to populate this timeline."
        />
      ) : (
        <Box sx={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="analysisGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.palette.secondary.main} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={theme.palette.secondary.main} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: `1px solid ${theme.palette.divider}`,
                }}
                labelFormatter={(_, payload) => {
                  const item = payload?.[0]?.payload as TimelineChartPoint & { label: string };
                  return item?.date ?? "";
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke={theme.palette.secondary.main}
                fill="url(#analysisGradient)"
                name="Analyses"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Paper>
  );
}
