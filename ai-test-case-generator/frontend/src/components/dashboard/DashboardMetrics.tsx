import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import SpeedOutlinedIcon from "@mui/icons-material/SpeedOutlined";
import Grid from "@mui/material/Grid2";
import { MetricCard } from "./MetricCard";
import type { DashboardMetrics as DashboardMetricsType } from "../../types/dashboard";

interface DashboardMetricsProps {
  metrics: DashboardMetricsType | null;
  loading?: boolean;
}

export function DashboardMetrics({ metrics, loading }: DashboardMetricsProps) {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <MetricCard
          label="Total Projects"
          value={metrics?.totalProjects ?? 0}
          icon={<FolderOutlinedIcon />}
          loading={loading}
          tooltip="Active and archived projects in the workspace"
          accent="#2563EB"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <MetricCard
          label="Total Requirements"
          value={metrics?.totalRequirements ?? 0}
          icon={<DescriptionOutlinedIcon />}
          loading={loading}
          tooltip="Captured software requirements awaiting or completed analysis"
          accent="#0F766E"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <MetricCard
          label="Total Test Cases"
          value={metrics?.totalTestCases ?? 0}
          icon={<ScienceOutlinedIcon />}
          loading={loading}
          tooltip="Generated test cases across all requirements"
          accent="#7C3AED"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <MetricCard
          label="Automation Candidates"
          value={metrics?.automationCandidates ?? 0}
          icon={<SmartToyOutlinedIcon />}
          loading={loading}
          tooltip="Test cases flagged as suitable for automation"
          accent="#D97706"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <MetricCard
          label="Test Coverage"
          value={`${metrics?.testCoveragePercent ?? 0}%`}
          icon={<SpeedOutlinedIcon />}
          loading={loading}
          tooltip="Percentage of requirements with at least one generated test case"
          accent="#059669"
        />
      </Grid>
    </Grid>
  );
}
