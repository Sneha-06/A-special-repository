import { Box, Tab, Tabs, useMediaQuery, useTheme } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useState } from "react";
import { RequirementsAnalyzedChart } from "./RequirementsAnalyzedChart";
import { TestCasesByCategoryChart } from "./TestCasesByCategoryChart";
import { TestCasesByPriorityChart } from "./TestCasesByPriorityChart";
import type { CategoryChartPoint, PriorityChartPoint, TimelineChartPoint } from "../../types/dashboard";

interface DashboardChartsProps {
  categoryData: CategoryChartPoint[];
  priorityData: PriorityChartPoint[];
  timelineData: TimelineChartPoint[];
  loading?: boolean;
}

export function DashboardCharts({
  categoryData,
  priorityData,
  timelineData,
  loading,
}: DashboardChartsProps) {
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down("lg"));
  const [tab, setTab] = useState(0);

  if (isCompact) {
    return (
      <Box>
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="By Category" />
          <Tab label="By Priority" />
          <Tab label="Over Time" />
        </Tabs>
        {tab === 0 ? (
          <TestCasesByCategoryChart data={categoryData} loading={loading} />
        ) : null}
        {tab === 1 ? (
          <TestCasesByPriorityChart data={priorityData} loading={loading} />
        ) : null}
        {tab === 2 ? (
          <RequirementsAnalyzedChart data={timelineData} loading={loading} />
        ) : null}
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, lg: 4 }}>
        <TestCasesByCategoryChart data={categoryData} loading={loading} />
      </Grid>
      <Grid size={{ xs: 12, lg: 4 }}>
        <TestCasesByPriorityChart data={priorityData} loading={loading} />
      </Grid>
      <Grid size={{ xs: 12, lg: 4 }}>
        <RequirementsAnalyzedChart data={timelineData} loading={loading} />
      </Grid>
    </Grid>
  );
}
