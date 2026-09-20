import AddIcon from "@mui/icons-material/Add";
import { Alert, Button, Paper, Tab, Tabs, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { ErrorState } from "../components/common/ErrorState";
import { RequirementForm } from "../components/requirements/RequirementForm";
import { RequirementsList } from "../components/requirements/RequirementsList";
import { getErrorMessage } from "../services/api";
import { fetchProjects } from "../services/projectService";
import { createRequirement, fetchRequirements } from "../services/requirementService";
import type { ProjectSummary, Requirement, RequirementFormValues } from "../types/requirement";

export function RequirementsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [projectList, requirementList] = await Promise.all([
        fetchProjects(),
        fetchRequirements(),
      ]);
      setProjects(projectList);
      setRequirements(requirementList);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  const handleCreate = async (values: RequirementFormValues) => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const created = await createRequirement(values);
      setSuccess(`Requirement "${created.title}" created successfully.`);
      await loadData();
      navigate(`/requirements/${created.id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Requirements"
        subtitle="Capture software requirements and run AI-assisted analysis."
        crumbs={[{ label: "Home", to: "/" }, { label: "Requirements" }]}
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setTab(1)}
          >
            New Requirement
          </Button>
        }
      />

      {error ? <ErrorState message={error} onRetry={loadData} /> : null}
      {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}

      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="All Requirements" />
        <Tab label="Create Requirement" />
      </Tabs>

      {tab === 0 ? (
        <RequirementsList
          rows={requirements}
          loading={loading}
          onSelect={(id) => navigate(`/requirements/${id}`)}
        />
      ) : (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            New Requirement
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Provide as much detail as possible. The AI analyzer will not invent requirements
            beyond what you supply.
          </Typography>
          <RequirementForm
            projects={projects}
            loading={saving}
            submitLabel="Create & Analyze"
            onSubmit={handleCreate}
            onCancel={() => setTab(0)}
          />
        </Paper>
      )}
    </>
  );
}
