import RefreshIcon from "@mui/icons-material/Refresh";
import { Box, Button, Stack } from "@mui/material";
import { useCallback, useEffect } from "react";
import { PageHeader } from "../components/PageHeader";
import { ErrorState } from "../components/common/ErrorState";
import { DashboardCharts } from "../components/dashboard/DashboardCharts";
import { DashboardMetrics } from "../components/dashboard/DashboardMetrics";
import { QuickActions } from "../components/dashboard/QuickActions";
import { RecentActivityTable } from "../components/dashboard/RecentActivityTable";
import { useAppDispatch, useAppSelector } from "../hooks";
import { loadDashboard } from "../store/slices/dashboardSlice";

export function DashboardPage() {
  const dispatch = useAppDispatch();
  const { data, status, error } = useAppSelector((state) => state.dashboard);
  const loading = status === "loading" || status === "idle";

  const refresh = useCallback(() => {
    void dispatch(loadDashboard());
  }, [dispatch]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of projects, requirements, test coverage, and generation activity."
        crumbs={[{ label: "Home" }]}
        actions={
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refresh}
            disabled={status === "loading"}
          >
            Refresh
          </Button>
        }
      />

      {error ? <ErrorState message={error} onRetry={refresh} /> : null}

      <Stack spacing={2.5}>
        <DashboardMetrics metrics={data?.metrics ?? null} loading={loading} />

        <DashboardCharts
          categoryData={data?.testCasesByCategory ?? []}
          priorityData={data?.testCasesByPriority ?? []}
          timelineData={data?.requirementsAnalyzedOverTime ?? []}
          loading={loading}
        />

        <Box>
          <QuickActions />
        </Box>

        <RecentActivityTable rows={data?.recentActivity ?? []} loading={loading} />
      </Stack>
    </>
  );
}
