import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import { AppLayout } from "./layouts/AppLayout";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { useAppDispatch, useAppSelector } from "./hooks";
import { hydrateSession } from "./store/slices/authSlice";

const DashboardPage = lazy(() =>
  import("./pages/DashboardPage").then((module) => ({ default: module.DashboardPage })),
);
const ClaimsExplorerPage = lazy(() =>
  import("./pages/ClaimsExplorerPage").then((module) => ({ default: module.ClaimsExplorerPage })),
);
const ClaimDetailsPage = lazy(() =>
  import("./pages/ClaimDetailsPage").then((module) => ({ default: module.ClaimDetailsPage })),
);
const AssistantPage = lazy(() =>
  import("./pages/AssistantPage").then((module) => ({ default: module.AssistantPage })),
);
const RulesExplorerPage = lazy(() =>
  import("./pages/RulesExplorerPage").then((module) => ({ default: module.RulesExplorerPage })),
);
const RuleDetailsPage = lazy(() =>
  import("./pages/RuleDetailsPage").then((module) => ({ default: module.RuleDetailsPage })),
);
const RuleComparePage = lazy(() =>
  import("./pages/RuleComparePage").then((module) => ({ default: module.RuleComparePage })),
);
const DocumentsPage = lazy(() =>
  import("./pages/DocumentsPage").then((module) => ({ default: module.DocumentsPage })),
);
const InsightsPage = lazy(() =>
  import("./pages/InsightsPage").then((module) => ({ default: module.InsightsPage })),
);

function Fallback() {
  return (
    <Box sx={{ display: "grid", placeItems: "center", minHeight: 240 }}>
      <CircularProgress aria-label="Loading page" />
    </Box>
  );
}

export default function App() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);

  useEffect(() => {
    if (token) {
      void dispatch(hydrateSession());
    }
  }, [dispatch, token]);

  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/claims" element={<ClaimsExplorerPage />} />
            <Route path="/claims/:id" element={<ClaimDetailsPage />} />
            <Route path="/assistant" element={<AssistantPage />} />
            <Route path="/rules" element={<RulesExplorerPage />} />
            <Route path="/rules/compare" element={<RuleComparePage />} />
            <Route path="/rules/:id" element={<RuleDetailsPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/insights" element={<InsightsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
