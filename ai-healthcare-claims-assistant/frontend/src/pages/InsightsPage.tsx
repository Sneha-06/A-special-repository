import { Card, CardContent, Grid, Paper, Skeleton, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ErrorState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { AiGeneratedBadge } from "../components/ConfidenceMeter";
import { fetchInsights } from "../services/insightsService";
import { getErrorMessage } from "../services/api";
import type { InsightsPayload } from "../types";

export function InsightsPage() {
  const [data, setData] = useState<InsightsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setError(null);
    fetchInsights()
      .then(setData)
      .catch((err) => setError(getErrorMessage(err)));
  };

  useEffect(() => {
    load();
  }, []);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return <Skeleton variant="rectangular" height={320} />;

  return (
    <>
      <PageHeader
        title="AI insights"
        subtitle="Patterns across synthetic claims and mandate rules"
        crumbs={[{ label: "Home", to: "/" }, { label: "Insights" }]}
      />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {data.cards.map((card) => (
          <Grid key={card.title} item xs={12} md={6}>
            <Card sx={{ height: "100%", borderRadius: 3 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="overline" color="primary" fontWeight={700}>
                  {card.severity} insight
                </Typography>
                <Typography variant="h6">{card.title}</Typography>
                <Typography color="text.secondary" sx={{ mt: 1, mb: 1.5 }}>
                  {card.detail}
                </Typography>
                <AiGeneratedBadge />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, height: 340 }}>
            <Typography variant="subtitle1">Increasing rejection trends</Typography>
            <ResponsiveContainer>
              <LineChart data={data.rejectionTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line dataKey="rejected" stroke="#9B3A3A" name="Rejected" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, height: 340 }}>
            <Typography variant="subtitle1">Rules causing highest rejection volume</Typography>
            <ResponsiveContainer>
              <BarChart data={data.rulesCausingRejections}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ruleId" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0F4C5C" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
