import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import AutoFixHighOutlinedIcon from "@mui/icons-material/AutoFixHighOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { ErrorState } from "../components/common/ErrorState";
import { AnalysisResultPanel } from "../components/requirements/AnalysisResultPanel";
import { RequirementForm } from "../components/requirements/RequirementForm";
import { getErrorMessage } from "../services/api";
import { fetchProjects } from "../services/projectService";
import {
  analyzeRequirement,
  deleteRequirement,
  fetchRequirement,
  updateRequirement,
} from "../services/requirementService";
import type {
  AnalysisResult,
  ProjectSummary,
  Requirement,
  RequirementFormValues,
} from "../types/requirement";
import { normalizeAnalysis } from "../utils/parseAnalysis";
import { AcceptanceCriteriaPanel } from "../components/acceptanceCriteria/AcceptanceCriteriaPanel";

export function RequirementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzedAt, setAnalyzedAt] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [projectList, detail] = await Promise.all([
        fetchProjects(),
        fetchRequirement(id),
      ]);
      setProjects(projectList);
      setRequirement(detail);
      const latest = detail.analyses?.[0];
      if (latest) {
        setAnalysis(normalizeAnalysis(latest));
        setAnalyzedAt(latest.createdAt);
      } else {
        setAnalysis(null);
        setAnalyzedAt(undefined);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  const handleUpdate = async (values: RequirementFormValues) => {
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateRequirement(id, values);
      setRequirement(updated);
      setTab(0);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleAnalyze = async () => {
    if (!id) return;
    setAnalyzing(true);
    setError(null);
    try {
      const response = await analyzeRequirement(id);
      setAnalysis(response.result);
      setAnalyzedAt(response.analysis.createdAt);
      setTab(1);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteRequirement(id);
      navigate("/requirements");
    } catch (err) {
      setError(getErrorMessage(err));
      setDeleteOpen(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", minHeight: 320 }}>
        <CircularProgress aria-label="Loading requirement" />
      </Box>
    );
  }

  if (!requirement) {
    return <ErrorState message={error ?? "Requirement not found"} onRetry={loadData} />;
  }

  return (
    <>
      <PageHeader
        title={requirement.title}
        subtitle={requirement.project?.name ?? "Requirement detail"}
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Requirements", to: "/requirements" },
          { label: requirement.title },
        ]}
        actions={
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              startIcon={analyzing ? <CircularProgress size={18} color="inherit" /> : <AnalyticsOutlinedIcon />}
              onClick={handleAnalyze}
              disabled={analyzing}
            >
              {analyzing ? "Analyzing..." : "Analyze Requirement"}
            </Button>
            <Button
              variant="outlined"
              startIcon={<AutoFixHighOutlinedIcon />}
              onClick={() => navigate(`/test-cases?requirementId=${requirement.id}`)}
              disabled={!analysis}
            >
              Generate Test Cases
            </Button>
            <Button
              color="error"
              variant="outlined"
              startIcon={<DeleteOutlineIcon />}
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
          </Stack>
        }
      />

      {error ? <ErrorState message={error} onRetry={loadData} /> : null}

      {analyzing ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          Running AI analysis via OpenAI. This may take a few seconds...
        </Alert>
      ) : null}

      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="Details" />
        <Tab label="Analysis" disabled={!analysis && !analyzing} />
        <Tab label="Acceptance Criteria" />
        <Tab label="Edit" />
      </Tabs>

      {tab === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Description</Typography>
              <Typography variant="body1">{requirement.description}</Typography>
            </Box>
            {requirement.userStory ? (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">User Story</Typography>
                <Typography variant="body2">{requirement.userStory}</Typography>
              </Box>
            ) : null}
            {requirement.applicationModule ? (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Application / Module</Typography>
                <Typography variant="body2">{requirement.applicationModule}</Typography>
              </Box>
            ) : null}
            {requirement.acceptanceCriteriaText ? (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Acceptance Criteria</Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {requirement.acceptanceCriteriaText}
                </Typography>
              </Box>
            ) : null}
            {requirement.additionalContext ? (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Additional Context</Typography>
                <Typography variant="body2">{requirement.additionalContext}</Typography>
              </Box>
            ) : null}
          </Stack>
        </Paper>
      ) : null}

      {tab === 1 && analysis ? (
        <AnalysisResultPanel
          analysis={analysis}
          analyzedAt={analyzedAt}
          requirementTitle={requirement.title}
          projectName={requirement.project?.name}
          showExport
        />
      ) : null}

      {tab === 1 && !analysis && !analyzing ? (
        <Paper sx={{ p: 3 }}>
          <Typography color="text.secondary">
            No analysis yet. Click &quot;Analyze Requirement&quot; to generate structured insights.
          </Typography>
        </Paper>
      ) : null}

      {tab === 2 ? (
        <Paper sx={{ p: 3 }}>
          <AcceptanceCriteriaPanel requirementId={requirement.id} />
        </Paper>
      ) : null}

      {tab === 3 ? (
        <Paper sx={{ p: 3 }}>
          <RequirementForm
            projects={projects}
            initialValues={requirement}
            loading={saving}
            submitLabel="Save Changes"
            onSubmit={handleUpdate}
            onCancel={() => setTab(0)}
          />
        </Paper>
      ) : null}

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete requirement?</DialogTitle>
        <DialogContent>
          <Typography>
            This will permanently delete &quot;{requirement.title}&quot; and all associated analyses.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
