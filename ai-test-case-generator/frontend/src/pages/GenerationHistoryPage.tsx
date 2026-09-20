import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import type { GridPaginationModel } from "@mui/x-data-grid";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { ErrorState } from "../components/common/ErrorState";
import { GenerationDetailDialog } from "../components/history/GenerationDetailDialog";
import { GenerationHistoryGrid } from "../components/history/GenerationHistoryGrid";
import { getErrorMessage } from "../services/api";
import { fetchHistory } from "../services/historyService";
import type { GenerationHistoryItem, GenerationStatus, GenerationType } from "../types/history";

const GENERATION_TYPES: Array<{ value: GenerationType | ""; label: string }> = [
  { value: "", label: "All types" },
  { value: "REQUIREMENT_ANALYSIS", label: "Requirement Analysis" },
  { value: "ACCEPTANCE_CRITERIA", label: "Acceptance Criteria" },
  { value: "TEST_CASES", label: "Test Cases" },
  { value: "SYNTHETIC_TEST_DATA", label: "Synthetic Test Data" },
  { value: "AUTOMATION_CODE", label: "Automation Code" },
  { value: "COVERAGE_ANALYSIS", label: "Coverage Analysis" },
];

const STATUSES: Array<{ value: GenerationStatus | ""; label: string }> = [
  { value: "", label: "All statuses" },
  { value: "COMPLETED", label: "Completed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "PENDING", label: "Pending" },
  { value: "FAILED", label: "Failed" },
];

export function GenerationHistoryPage() {
  const [items, setItems] = useState<GenerationHistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<GenerationHistoryItem | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });
  const [generationType, setGenerationType] = useState<GenerationType | "">("");
  const [status, setStatus] = useState<GenerationStatus | "">("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchHistory({
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        generationType: generationType || undefined,
        status: status || undefined,
        fromDate: fromDate ? new Date(fromDate).toISOString() : undefined,
        toDate: toDate ? new Date(`${toDate}T23:59:59`).toISOString() : undefined,
      });
      setItems(response.items);
      setTotal(response.total);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [fromDate, generationType, paginationModel.page, paginationModel.pageSize, status, toDate]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadHistory();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadHistory]);

  const handleApplyFilters = () => {
    setPaginationModel((current) => ({ ...current, page: 0 }));
  };

  const handleClearFilters = () => {
    setGenerationType("");
    setStatus("");
    setFromDate("");
    setToDate("");
    setPaginationModel({ page: 0, pageSize: 25 });
  };

  return (
    <>
      <PageHeader
        title="Generation History"
        subtitle="Audit trail of AI generation runs."
        crumbs={[{ label: "Home", to: "/" }, { label: "Generation History" }]}
        actions={
          <Button startIcon={<RefreshIcon />} onClick={loadHistory} disabled={loading}>
            Refresh
          </Button>
        }
      />

      {error ? <ErrorState message={error} onRetry={loadHistory} /> : null}

      <Stack spacing={3}>
        <Box
          sx={{
            p: 2,
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
            bgcolor: "background.paper",
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <FilterListOutlinedIcon fontSize="small" color="action" />
            <Box component="span" sx={{ fontWeight: 600 }}>Filters</Box>
          </Stack>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Generation Type</InputLabel>
              <Select
                label="Generation Type"
                value={generationType}
                onChange={(e) => setGenerationType(e.target.value as GenerationType | "")}
              >
                {GENERATION_TYPES.map((option) => (
                  <MenuItem key={option.label} value={option.value}>{option.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value as GenerationStatus | "")}
              >
                {STATUSES.map((option) => (
                  <MenuItem key={option.label} value={option.value}>{option.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="From date"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              size="small"
              label="To date"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={handleApplyFilters}>Apply</Button>
              <Button onClick={handleClearFilters}>Clear</Button>
            </Stack>
          </Stack>
        </Box>

        <GenerationHistoryGrid
          rows={items}
          loading={loading}
          rowCount={total}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          onRowOpen={setSelectedItem}
        />
      </Stack>

      <GenerationDetailDialog
        open={Boolean(selectedItem)}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </>
  );
}
