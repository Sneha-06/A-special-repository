import { Box, Paper, Skeleton, Typography, useTheme, type Theme } from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EmptyState } from "../common/EmptyState";
import type { CategoryChartPoint } from "../../types/dashboard";

interface TestCasesByCategoryChartProps {
  data: CategoryChartPoint[];
  loading?: boolean;
}

export function TestCasesByCategoryChart({ data, loading }: TestCasesByCategoryChartProps) {
  const theme = themeFromMui(useTheme());
  const hasData = data.some((point) => point.count > 0);

  return (
    <Paper sx={{ p: 2.5, height: "100%" }}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Test Cases by Category
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Distribution across functional, negative, edge, security, and regression
      </Typography>
      {loading ? (
        <Skeleton variant="rounded" height={280} />
      ) : !hasData ? (
        <EmptyState
          title="No test case data"
          description="Generate test cases to see category distribution."
        />
      ) : (
        <Box sx={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
              <XAxis dataKey="category" tick={{ fontSize: 12 }} stroke={theme.axis} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke={theme.axis} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: `1px solid ${theme.border}`,
                  boxShadow: "0 4px 12px rgba(15,23,42,0.08)",
                }}
              />
              <Bar dataKey="count" fill={theme.primary} radius={[6, 6, 0, 0]} name="Test cases" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Paper>
  );
}

function themeFromMui(muiTheme: Theme) {
  return {
    primary: muiTheme.palette.primary.main,
    grid: muiTheme.palette.divider,
    axis: muiTheme.palette.text.secondary,
    border: muiTheme.palette.divider,
  };
}
