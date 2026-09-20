import { Box, Card, CardContent, Grid, LinearProgress, Typography, useTheme } from "@mui/material";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { CodeReviewResult, IssueCounts } from "../../types/review";

function ScoreCard({ score }: { score: number }) {
  const theme = useTheme();
  const color =
    score >= 80 ? theme.palette.success.main
      : score >= 60 ? theme.palette.warning.main
        : theme.palette.error.main;

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>Overall Score</Typography>
        <Typography variant="h3" sx={{ color, fontWeight: 700 }}>{score}</Typography>
        <LinearProgress
          variant="determinate"
          value={score}
          sx={{ mt: 2, height: 8, borderRadius: 4, bgcolor: "grey.100", "& .MuiLinearProgress-bar": { bgcolor: color } }}
        />
      </CardContent>
    </Card>
  );
}

function CountCard({ label, count, colorKey }: { label: string; count: number; colorKey: "total" | "critical" | "high" | "medium" | "low" }) {
  const theme = useTheme();
  const color = colorKey === "total" ? theme.palette.text.primary : theme.palette.severity[colorKey].main;

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="h4" sx={{ color, fontWeight: 700 }}>{count}</Typography>
      </CardContent>
    </Card>
  );
}

export function ReviewOverview({ review, counts }: { review: CodeReviewResult; counts: IssueCounts }) {
  const theme = useTheme();
  const chartData = [
    { name: "Critical", value: counts.critical, color: theme.palette.severity.critical.main },
    { name: "High", value: counts.high, color: theme.palette.severity.high.main },
    { name: "Medium", value: counts.medium, color: theme.palette.severity.medium.main },
    { name: "Low", value: counts.low, color: theme.palette.severity.low.main },
    { name: "Info", value: counts.info, color: theme.palette.severity.info.main },
  ].filter((d) => d.value > 0);

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>Overview</Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <ScoreCard score={review.overallScore} />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <CountCard label="Total Issues" count={counts.total} colorKey="total" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <CountCard label="Critical" count={counts.critical} colorKey="critical" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <CountCard label="High" count={counts.high} colorKey="high" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <CountCard label="Medium" count={counts.medium} colorKey="medium" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <CountCard label="Low" count={counts.low} colorKey="low" />
        </Grid>
      </Grid>

      {chartData.length > 0 && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>Issues by Severity</Typography>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2}>
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{review.summary}</Typography>
    </Box>
  );
}
