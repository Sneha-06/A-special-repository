import AddIcon from "@mui/icons-material/Add";
import AutoFixHighOutlinedIcon from "@mui/icons-material/AutoFixHighOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "../common/EmptyState";
import { ErrorState } from "../common/ErrorState";
import { getErrorMessage } from "../../services/api";
import {
  createAcceptanceCriterion,
  deleteAcceptanceCriterion,
  fetchAcceptanceCriteria,
  generateAcceptanceCriteria,
  updateAcceptanceCriterion,
} from "../../services/acceptanceCriteriaService";
import type { AcceptanceCriterion, AcceptanceCriterionInput } from "../../types/acceptanceCriteria";

interface AcceptanceCriteriaPanelProps {
  requirementId: string;
}

const EMPTY_FORM: AcceptanceCriterionInput = { given: "", when: "", then: "" };

export function AcceptanceCriteriaPanel({ requirementId }: AcceptanceCriteriaPanelProps) {
  const [criteria, setCriteria] = useState<AcceptanceCriterion[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AcceptanceCriterion | null>(null);
  const [form, setForm] = useState<AcceptanceCriterionInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadCriteria = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchAcceptanceCriteria(requirementId);
      setCriteria(list);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [requirementId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCriteria();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadCriteria]);

  const handleGenerate = async (replaceExisting = false) => {
    setGenerating(true);
    setError(null);
    try {
      const generated = await generateAcceptanceCriteria(requirementId, replaceExisting);
      setCriteria(generated);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setEditOpen(true);
  };

  const openEdit = (item: AcceptanceCriterion) => {
    setEditTarget(item);
    setForm({ given: item.given, when: item.when, then: item.then, criteriaKey: item.id });
    setEditOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      if (editTarget) {
        const updated = await updateAcceptanceCriterion(editTarget.dbId, form);
        setCriteria((prev) => prev.map((c) => (c.dbId === updated.dbId ? updated : c)));
      } else {
        const created = await createAcceptanceCriterion(requirementId, form);
        setCriteria((prev) => [...prev, created]);
      }
      setEditOpen(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: AcceptanceCriterion) => {
    try {
      await deleteAcceptanceCriterion(item.dbId);
      setCriteria((prev) => prev.filter((c) => c.dbId !== item.dbId));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", py: 6 }}>
        <CircularProgress aria-label="Loading acceptance criteria" />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 2 }} justifyContent="space-between">
        <Typography variant="body2" color="text.secondary">
          Given / When / Then acceptance criteria derived from the requirement.
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button size="small" startIcon={<AddIcon />} onClick={openAdd}>Add</Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={generating ? <CircularProgress size={16} /> : <AutoFixHighOutlinedIcon />}
            onClick={() => handleGenerate(criteria.length > 0)}
            disabled={generating}
          >
            {criteria.length === 0 ? "Generate" : "Regenerate"}
          </Button>
        </Stack>
      </Stack>

      {error ? <ErrorState message={error} onRetry={loadCriteria} /> : null}

      {generating ? (
        <Alert severity="info" sx={{ mb: 2 }}>Generating acceptance criteria via OpenAI...</Alert>
      ) : null}

      {criteria.length === 0 ? (
        <EmptyState
          title="No acceptance criteria"
          description="Generate AI acceptance criteria or add them manually."
          action={
            <Button variant="contained" onClick={() => handleGenerate(false)} disabled={generating}>
              Generate Criteria
            </Button>
          }
        />
      ) : (
        <Stack spacing={1.5}>
          {criteria.map((item) => (
            <Paper key={item.dbId} sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                <Chip label={item.id} size="small" sx={{ mb: 1 }} />
                <Stack direction="row">
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => openEdit(item)}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" onClick={() => handleDelete(item)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>Given</strong> {item.given}
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>When</strong> {item.when}
              </Typography>
              <Typography variant="body2">
                <strong>Then</strong> {item.then}
              </Typography>
            </Paper>
          ))}
        </Stack>
      )}

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editTarget ? "Edit Criterion" : "Add Criterion"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Given"
              fullWidth
              multiline
              minRows={2}
              value={form.given}
              onChange={(e) => setForm((f) => ({ ...f, given: e.target.value }))}
            />
            <TextField
              label="When"
              fullWidth
              multiline
              minRows={2}
              value={form.when}
              onChange={(e) => setForm((f) => ({ ...f, when: e.target.value }))}
            />
            <TextField
              label="Then"
              fullWidth
              multiline
              minRows={2}
              value={form.then}
              onChange={(e) => setForm((f) => ({ ...f, then: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !form.given || !form.when || !form.then}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
