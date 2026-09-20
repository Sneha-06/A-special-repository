import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";

const DashboardPage = lazy(() => import("../pages/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const WorkspacePage = lazy(() => import("../pages/WorkspacePage").then((m) => ({ default: m.WorkspacePage })));
const HistoryPage = lazy(() => import("../pages/HistoryPage").then((m) => ({ default: m.HistoryPage })));
const ReviewDetailPage = lazy(() => import("../pages/ReviewDetailPage").then((m) => ({ default: m.ReviewDetailPage })));
const GitHubPage = lazy(() => import("../pages/GitHubPage").then((m) => ({ default: m.GitHubPage })));
const RepoExplorerPage = lazy(() => import("../pages/RepoExplorerPage").then((m) => ({ default: m.RepoExplorerPage })));

function PageLoader() {
  return <div style={{ padding: 24 }}>Loading…</div>;
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="workspace" element={<WorkspacePage />} />
          <Route path="github" element={<GitHubPage />} />
          <Route path="github/:owner/:repo" element={<RepoExplorerPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="history/:id" element={<ReviewDetailPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
