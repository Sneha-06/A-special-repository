import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { ErrorState } from "../components/common/ErrorState";
import { PageHeader } from "../components/common/PageHeader";
import { DashboardCharts } from "../features/dashboard/DashboardCharts";
import { MetricsCards } from "../features/dashboard/MetricsCards";
import { fetchReviewDashboard } from "../services/reviewService";
import type { ReviewDashboardStats } from "../types/review";

function scoreColor(score: number): "success" | "warning" | "error" {
  if (score >= 80) return "success";
  if (score >= 60) return "warning";
  return "error";
}

export function DashboardPage() {
  const [stats, setStats] = useState<ReviewDashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setError(null);
    fetchReviewDashboard()
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (loading || !stats) return <Typography>Loading dashboard…</Typography>;

  return (
    <Box>
      <PageHeader
        title="Developer Dashboard"
        subtitle="Code review metrics, issue trends, and recent AI-assisted reviews"
        action={
          <Stack direction="row" spacing={1}>
            <Button component={RouterLink} to="/history" variant="outlined">
              Review History
            </Button>
            <Button component={RouterLink} to="/workspace" variant="contained">
              Open Workspace
            </Button>
          </Stack>
        }
      />

      <MetricsCards stats={stats} />
      <DashboardCharts stats={stats} />

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Recent Reviews</Typography>
            <Button component={RouterLink} to="/history" size="small">View all</Button>
          </Stack>

          {stats.recentReviews.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No reviews yet. Run a code review from the workspace to get started.
            </Typography>
          ) : (
            <Grid container spacing={1}>
              {stats.recentReviews.map((review) => (
                <Grid item xs={12} key={review.id}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    spacing={1}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: 1,
                      borderColor: "divider",
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {review.fileName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {review.repository} · {new Date(review.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Chip size="small" label={`Score ${review.overallScore}`} color={scoreColor(review.overallScore)} />
                      <Chip size="small" label={`${review.issueCount} issues`} variant="outlined" />
                      {review.criticalCount > 0 && (
                        <Chip size="small" label={`${review.criticalCount} critical`} color="error" />
                      )}
                      <Button
                        component={RouterLink}
                        to={`/history/${review.id}`}
                        size="small"
                        variant="outlined"
                        endIcon={<OpenInNewOutlinedIcon />}
                      >
                        Open
                      </Button>
                    </Stack>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
