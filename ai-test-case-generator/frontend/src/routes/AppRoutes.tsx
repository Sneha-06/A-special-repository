import { lazy, Suspense } from "react";
import { CircularProgress, Box } from "@mui/material";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";

const DashboardPage = lazy(() => import("../pages/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const ProjectsPage = lazy(() => import("../pages/ProjectsPage").then((m) => ({ default: m.ProjectsPage })));
const RequirementsPage = lazy(() => import("../pages/RequirementsPage").then((m) => ({ default: m.RequirementsPage })));
const RequirementDetailPage = lazy(() => import("../pages/RequirementDetailPage").then((m) => ({ default: m.RequirementDetailPage })));
const TestCasesPage = lazy(() => import("../pages/TestCasesPage").then((m) => ({ default: m.TestCasesPage })));
const CoveragePage = lazy(() => import("../pages/CoveragePage").then((m) => ({ default: m.CoveragePage })));
const GenerationHistoryPage = lazy(() => import("../pages/GenerationHistoryPage").then((m) => ({ default: m.GenerationHistoryPage })));

function Fallback() {
  return (
    <Box sx={{ display: "grid", placeItems: "center", minHeight: 240 }}>
      <CircularProgress aria-label="Loading page" />
    </Box>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/requirements" element={<RequirementsPage />} />
          <Route path="/requirements/:id" element={<RequirementDetailPage />} />
          <Route path="/test-cases" element={<TestCasesPage />} />
          <Route path="/coverage" element={<CoveragePage />} />
          <Route path="/history" element={<GenerationHistoryPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
