import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import SummarizeOutlinedIcon from "@mui/icons-material/SummarizeOutlined";
import {
  Grid,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
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
import { KpiCard } from "../components/KpiCard";
import { PageHeader } from "../components/PageHeader";
import { StatusChip } from "../components/StatusChip";
import { ErrorState } from "../components/EmptyState";
import { fetchInsights } from "../services/insightsService";
import { getErrorMessage } from "../services/api";
import type { InsightsPayload } from "../types";

const pieColors = ["#2F7A55", "#B54A4A", "#C4892A", "#3D6E8C"];

export function DashboardPage() {
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
  if (!data) {
    return <Skeleton variant="rounded" height={360} />;
  }

  const kpis = [
    {
      label: "Total claims",
      value: data.totals.total,
      hint: "Synthetic book of business",
      accent: "#146072",
      icon: <SummarizeOutlinedIcon fontSize="small" />,
    },
    {
      label: "Approved",
      value: data.totals.APPROVED,
      hint: "Paid or accepted",
      accent: "#2F7A55",
      icon: <AssignmentTurnedInOutlinedIcon fontSize="small" />,
    },
    {
      label: "Rejected",
      value: data.totals.REJECTED,
      hint: "Failed a mandate edit",
      accent: "#B54A4A",
      icon: <ErrorOutlineIcon fontSize="small" />,
    },
    {
      label: "Pending",
      value: data.totals.PENDING,
      hint: "Still adjudicating",
      accent: "#C4892A",
      icon: <HourglassEmptyIcon fontSize="small" />,
    },
    {
      label: "Needs review",
      value: data.totals.REVIEW,
      hint: "Queued for an analyst",
      accent: "#3D6E8C",
      icon: <RateReviewOutlinedIcon fontSize="small" />,
    },
  ];

  const statusChart = [
    { name: "Approved", value: data.totals.APPROVED },
    { name: "Rejected", value: data.totals.REJECTED },
    { name: "Pending", value: data.totals.PENDING },
    { name: "Review", value: data.totals.REVIEW },
  ];

  return (
    <>
      <PageHeader
        title="Operations dashboard"
        subtitle="A calm view of volumes, rejection patterns, and claims waiting on an analyst."
        crumbs={[{ label: "Home" }]}
      />
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        {kpis.map((kpi) => (
          <Grid key={kpi.label} item xs={12} sm={6} md={4} lg={2} sx={{ flexGrow: { lg: 1 } }}>
            <KpiCard {...kpi} />
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2.5, height: 340 }}>
            <Typography variant="subtitle1" gutterBottom>
              Claim status mix
            </Typography>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={statusChart} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={2}>
                  {statusChart.map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2.5, height: 340 }}>
            <Typography variant="subtitle1" gutterBottom>
              Rejection trend
            </Typography>
            <ResponsiveContainer>
              <LineChart data={data.rejectionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4ECEE" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="rejected" stroke="#B54A4A" name="Rejected" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="total" stroke="#146072" name="Total" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2.5, height: 340 }}>
            <Typography variant="subtitle1" gutterBottom>
              Top rejection reasons
            </Typography>
            <ResponsiveContainer>
              <BarChart data={data.topReasons} layout="vertical" margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4ECEE" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="reason" width={168} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#146072" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2.5, minHeight: 340 }}>
            <Typography variant="subtitle1" gutterBottom>
              Claims requiring review
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Claim</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.reviewClaims.map((claim) => (
                  <TableRow key={claim.claimId}>
                    <TableCell sx={{ fontWeight: 600 }}>{claim.claimId}</TableCell>
                    <TableCell>{claim.serviceName}</TableCell>
                    <TableCell>${claim.submittedAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <StatusChip status={claim.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
