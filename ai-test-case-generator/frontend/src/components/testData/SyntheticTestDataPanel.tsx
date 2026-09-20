import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "../common/EmptyState";
import { ErrorState } from "../common/ErrorState";
import { getErrorMessage } from "../../services/api";
import {
  copyTestDataToClipboard,
  exportTestDataCsv,
  fetchSyntheticTestData,
  generateSyntheticTestData,
} from "../../services/syntheticTestDataService";
import type { SyntheticTestDataRow, TestDataPurpose } from "../../types/syntheticTestData";

interface SyntheticTestDataPanelProps {
  requirementId: string;
}

const PURPOSE_COLORS: Record<TestDataPurpose, "success" | "error" | "warning" | "info" | "default"> = {
  valid: "success",
  invalid: "error",
  boundary: "warning",
  edge: "info",
  empty: "default",
};

export function SyntheticTestDataPanel({ requirementId }: SyntheticTestDataPanelProps) {
  const [rows, setRows] = useState<SyntheticTestDataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSyntheticTestData(requirementId);
      setRows(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [requirementId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const data = await generateSyntheticTestData(requirementId, true);
      setRows(data);
      setSnackbar(`Generated ${data.length} synthetic test data rows.`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (rows.length === 0) return;
    const text = copyTestDataToClipboard(rows);
    await navigator.clipboard.writeText(text);
    setSnackbar("Test data copied to clipboard.");
  };

  const handleExport = () => {
    if (rows.length === 0) return;
    const csv = exportTestDataCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `test-data-${requirementId.slice(0, 8)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setSnackbar("Test data exported as CSV.");
  };

  if (loading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", py: 6 }}>
        <CircularProgress aria-label="Loading test data" />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Synthetic test data only — no real personal information is generated.
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            variant="contained"
            size="small"
            startIcon={generating ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
            onClick={handleGenerate}
            disabled={generating}
          >
            {rows.length === 0 ? "Generate" : "Regenerate"}
          </Button>
          <Button size="small" startIcon={<ContentCopyIcon />} onClick={handleCopy} disabled={rows.length === 0}>
            Copy
          </Button>
          <Button size="small" startIcon={<DownloadIcon />} onClick={handleExport} disabled={rows.length === 0}>
            Export
          </Button>
        </Stack>
      </Stack>

      {error ? <ErrorState message={error} onRetry={loadData} /> : null}

      {generating ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          Analyzing requirement and test cases to generate synthetic data...
        </Alert>
      ) : null}

      {rows.length === 0 ? (
        <EmptyState
          title="No test data generated"
          description="Generate synthetic valid, invalid, boundary, edge, and empty test values."
          action={
            <Button variant="contained" onClick={handleGenerate} disabled={generating}>
              Generate Test Data
            </Button>
          }
        />
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Field</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Data Type</TableCell>
                <TableCell>Purpose</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id ?? `${row.field}-${row.purpose}-${row.value}`} hover>
                  <TableCell>{row.field}</TableCell>
                  <TableCell sx={{ fontFamily: "monospace", fontSize: 13 }}>{row.value || "—"}</TableCell>
                  <TableCell>{row.dataType}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.purpose}
                      size="small"
                      color={PURPOSE_COLORS[row.purpose as TestDataPurpose] ?? "default"}
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
        message={snackbar}
      />
    </Box>
  );
}
