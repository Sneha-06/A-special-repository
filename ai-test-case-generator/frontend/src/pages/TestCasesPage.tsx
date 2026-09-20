import AutoFixHighOutlinedIcon from "@mui/icons-material/AutoFixHighOutlined";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { ErrorState } from "../components/common/ErrorState";
import { GenerateTestCasesDialog } from "../components/testCases/GenerateTestCasesDialog";
import { GenerationProgress } from "../components/testCases/GenerationProgress";
import { TestCaseEditDialog } from "../components/testCases/TestCaseEditDialog";
import { TestCaseViewDialog } from "../components/testCases/TestCaseViewDialog";
import { TestCasesGrid } from "../components/testCases/TestCasesGrid";
import { getErrorMessage } from "../services/api";
import { fetchRequirements } from "../services/requirementService";
import {
  deleteTestCase,
  duplicateTestCase,
  fetchTestCases,
  regenerateTestCase,
  updateTestCase,
} from "../services/testCaseService";
import { AutomationCodeDialog } from "../components/testCases/AutomationCodeDialog";
import { ExportTestCasesMenu } from "../components/testCases/ExportTestCasesMenu";
import type { Requirement } from "../types/requirement";
import type { GenerationStage, TestCase, UpdateTestCasePayload } from "../types/testCase";
import { SyntheticTestDataPanel } from "../components/testData/SyntheticTestDataPanel";

export function TestCasesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [selectedRequirementId, setSelectedRequirementId] = useState(
    searchParams.get("requirementId") ?? "",
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [viewCase, setViewCase] = useState<TestCase | null>(null);
  const [editCase, setEditCase] = useState<TestCase | null>(null);
  const [deleteCase, setDeleteCase] = useState<TestCase | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [regenerateStage, setRegenerateStage] = useState<GenerationStage | null>(null);
  const [automationCase, setAutomationCase] = useState<TestCase | null>(null);

  const selectedRequirement = requirements.find((r) => r.id === selectedRequirementId) ?? null;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [reqList, cases] = await Promise.all([
        fetchRequirements(),
        fetchTestCases(selectedRequirementId || undefined),
      ]);
      setRequirements(reqList);
      setTestCases(cases);
      if (!selectedRequirementId && reqList.length > 0) {
        setSelectedRequirementId(reqList[0].id);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [selectedRequirementId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  useEffect(() => {
    if (selectedRequirementId) {
      setSearchParams({ requirementId: selectedRequirementId });
    }
  }, [selectedRequirementId, setSearchParams]);

  const handleRequirementChange = (id: string) => {
    setSelectedRequirementId(id);
  };

  const handleGenerated = (newCases: TestCase[]) => {
    setTestCases((prev) => [...newCases, ...prev]);
  };

  const handleDuplicate = async (testCase: TestCase) => {
    setActionLoadingId(testCase.id);
    try {
      const copy = await duplicateTestCase(testCase.id);
      setTestCases((prev) => [copy, ...prev]);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteCase) return;
    setActionLoadingId(deleteCase.id);
    try {
      await deleteTestCase(deleteCase.id);
      setTestCases((prev) => prev.filter((tc) => tc.id !== deleteCase.id));
      setDeleteCase(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRegenerate = async (testCase: TestCase) => {
    setActionLoadingId(testCase.id);
    setRegenerateStage(null);
    try {
      const updated = await regenerateTestCase(testCase.id, (event) => {
        setRegenerateStage(event.stage);
      });
      setTestCases((prev) => prev.map((tc) => (tc.id === updated.id ? updated : tc)));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoadingId(null);
      setRegenerateStage(null);
    }
  };

  const handleAutomation = (testCase: TestCase) => {
    setAutomationCase(testCase);
  };

  const handleSaveEdit = async (payload: UpdateTestCasePayload) => {
    if (!editCase) return;
    setActionLoadingId(editCase.id);
    try {
      const updated = await updateTestCase(editCase.id, payload);
      setTestCases((prev) => prev.map((tc) => (tc.id === updated.id ? updated : tc)));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Test Cases"
        subtitle="Generate, review, and manage AI-created test cases."
        crumbs={[{ label: "Home", to: "/" }, { label: "Test Cases" }]}
        actions={
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <ExportTestCasesMenu
              testCases={testCases}
              requirementTitle={selectedRequirement?.title}
              disabled={loading}
            />
            <Button
              variant="contained"
              startIcon={<AutoFixHighOutlinedIcon />}
              onClick={() => setGenerateOpen(true)}
              disabled={!selectedRequirement}
            >
              Generate Test Cases
            </Button>
          </Box>
        }
      />

      {error ? <ErrorState message={error} onRetry={loadData} /> : null}

      <Box sx={{ mb: 2, maxWidth: 480 }}>
        <FormControl fullWidth size="small">
          <InputLabel id="req-filter">Requirement</InputLabel>
          <Select
            labelId="req-filter"
            label="Requirement"
            value={selectedRequirementId}
            onChange={(e) => handleRequirementChange(e.target.value)}
          >
            {requirements.map((req) => (
              <MenuItem key={req.id} value={req.id}>{req.title}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {regenerateStage ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          <GenerationProgress activeStage={regenerateStage} />
        </Alert>
      ) : null}

      <TestCasesGrid
        rows={testCases}
        loading={loading}
        actionLoadingId={actionLoadingId}
        onView={setViewCase}
        onEdit={setEditCase}
        onDuplicate={handleDuplicate}
        onDelete={setDeleteCase}
        onRegenerate={handleRegenerate}
        onAutomation={handleAutomation}
      />

      {selectedRequirementId ? (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Synthetic Test Data
          </Typography>
          <SyntheticTestDataPanel requirementId={selectedRequirementId} />
        </Box>
      ) : null}

      <GenerateTestCasesDialog
        open={generateOpen}
        requirement={selectedRequirement}
        onClose={() => setGenerateOpen(false)}
        onGenerated={handleGenerated}
      />

      <TestCaseViewDialog
        open={Boolean(viewCase)}
        testCase={viewCase}
        onClose={() => setViewCase(null)}
      />

      <TestCaseEditDialog
        open={Boolean(editCase)}
        testCase={editCase}
        loading={Boolean(actionLoadingId)}
        onClose={() => setEditCase(null)}
        onSave={handleSaveEdit}
      />

      <AutomationCodeDialog
        open={Boolean(automationCase)}
        testCase={automationCase}
        onClose={() => setAutomationCase(null)}
        onGenerated={() => {
          setTestCases((prev) =>
            prev.map((tc) =>
              tc.id === automationCase?.id ? { ...tc, automationCandidate: true } : tc,
            ),
          );
        }}
      />

      <Dialog open={Boolean(deleteCase)} onClose={() => setDeleteCase(null)}>
        <DialogTitle>Delete test case?</DialogTitle>
        <DialogContent>
          <Typography>
            Permanently delete &quot;{deleteCase?.testCaseId}: {deleteCase?.title}&quot;?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteCase(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
