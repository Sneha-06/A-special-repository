import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import { Card, CardContent, Grid, Typography } from "@mui/material";
import type { ReviewDashboardStats } from "../../types/review";

function MetricCard({
  label,
  value,
  icon,
  suffix,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  suffix?: string;
}) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>{label}</Typography>
        <Typography variant="h4" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {icon}
          {value}
          {suffix && (
            <Typography component="span" variant="h6" color="text.secondary">{suffix}</Typography>
          )}
        </Typography>
      </CardContent>
    </Card>
  );
}

export function MetricsCards({ stats }: { stats: ReviewDashboardStats }) {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <MetricCard label="Total Reviews" value={stats.totalReviews} icon={<CodeOutlinedIcon color="primary" />} />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <MetricCard
          label="Avg. Code Quality"
          value={stats.averageScore}
          suffix="/100"
          icon={<TrendingUpOutlinedIcon color="success" />}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <MetricCard label="Critical Issues" value={stats.criticalIssues} icon={<BugReportOutlinedIcon color="error" />} />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <MetricCard label="High Severity" value={stats.highIssues} icon={<AssessmentOutlinedIcon color="warning" />} />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <MetricCard
          label="Reviews This Month"
          value={stats.reviewsThisMonth}
          icon={<CalendarMonthOutlinedIcon color="info" />}
        />
      </Grid>
    </Grid>
  );
}
