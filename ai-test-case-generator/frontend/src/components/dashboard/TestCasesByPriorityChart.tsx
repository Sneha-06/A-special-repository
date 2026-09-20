import { Box, Paper, Skeleton, Typography, useTheme } from "@mui/material";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { EmptyState } from "../common/EmptyState";
import type { PriorityChartPoint } from "../../types/dashboard";

const PRIORITY_COLORS = ["#94A3B8", "#3B82F6", "#F59E0B", "#EF4444"];

interface TestCasesByPriorityChartProps {
  data: PriorityChartPoint[];
  loading?: boolean;
}

export function TestCasesByPriorityChart({ data, loading }: TestCasesByPriorityChartProps) {
  const theme = useTheme();
  const chartData = data.filter((point) => point.count > 0);
  const hasData = chartData.length > 0;

  return (
    <Paper sx={{ p: 2.5, height: "100%" }}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Test Cases by Priority
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Low, medium, high, and critical priority breakdown
      </Typography>
      {loading ? (
        <Skeleton variant="rounded" height={280} />
      ) : !hasData ? (
        <EmptyState
          title="No priority data"
          description="Test case priorities will appear after generation."
        />
      ) : (
        <Box sx={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="priority"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
              >
                {chartData.map((entry, index) => (
                  <Cell key={entry.priority} fill={PRIORITY_COLORS[index % PRIORITY_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Paper>
  );
}
