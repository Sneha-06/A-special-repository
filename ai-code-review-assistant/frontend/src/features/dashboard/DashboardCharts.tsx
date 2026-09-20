import { Card, CardContent, Grid, Typography } from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ReviewDashboardStats } from "../../types/review";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#DC2626",
  high: "#EA580C",
  medium: "#D97706",
  low: "#2563EB",
  info: "#64748B",
};

const CATEGORY_COLORS = ["#2563EB", "#7C3AED", "#059669", "#D97706", "#DC2626", "#0891B2", "#BE185D"];

function formatShortDate(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function DashboardCharts({ stats }: { stats: ReviewDashboardStats }) {
  const reviewsOverTime = stats.reviewsOverTime.map((row) => ({
    ...row,
    label: formatShortDate(row.date),
  }));

  const averageScoreOverTime = stats.averageScoreOverTime.map((row) => ({
    ...row,
    label: formatShortDate(row.date),
  }));

  const issuesBySeverity = stats.issuesBySeverity.map((row) => ({
    name: row.severity,
    count: row.count,
  }));

  const issuesByCategory = stats.issuesByCategory.map((row) => ({
    name: row.category.replace(/-/g, " "),
    count: row.count,
  }));

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} lg={6}>
        <Card sx={{ height: 340 }}>
          <CardContent sx={{ height: "100%" }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>Reviews Over Time</Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={reviewsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Reviews" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} lg={6}>
        <Card sx={{ height: 340 }}>
          <CardContent sx={{ height: "100%" }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>Issues by Severity</Typography>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={issuesBySeverity}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  label={({ name, value }) => `${name} (${value})`}
                >
                  {issuesBySeverity.map((entry) => (
                    <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name] ?? "#64748B"} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} lg={6}>
        <Card sx={{ height: 340 }}>
          <CardContent sx={{ height: "100%" }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>Issues by Category</Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={issuesByCategory} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Issues" radius={[0, 4, 4, 0]}>
                  {issuesByCategory.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} lg={6}>
        <Card sx={{ height: 340 }}>
          <CardContent sx={{ height: "100%" }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>Average Score Over Time</Typography>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={averageScoreOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Avg. Score"
                  stroke="#059669"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
