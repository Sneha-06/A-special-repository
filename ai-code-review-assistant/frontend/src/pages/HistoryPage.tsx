import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Chip,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { DataGrid, type GridColDef, type GridPaginationModel, type GridSortModel } from "@mui/x-data-grid";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ErrorState } from "../components/common/ErrorState";
import { PageHeader } from "../components/common/PageHeader";
import { fetchReviewHistory } from "../services/reviewService";
import type { ReviewHistoryItem } from "../types/review";

const LANGUAGE_OPTIONS = ["typescript", "tsx", "javascript", "python", "go", "java"];

function scoreColor(score: number): "success" | "warning" | "error" {
  if (score >= 80) return "success";
  if (score >= 60) return "warning";
  return "error";
}

export function HistoryPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ReviewHistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: "createdAt", sort: "desc" }]);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const sort = sortModel[0];
    fetchReviewHistory({
      page: paginationModel.page + 1,
      pageSize: paginationModel.pageSize,
      search: search.trim() || undefined,
      language: language || undefined,
      sortBy: sort?.field,
      sortOrder: sort?.sort ?? "desc",
    })
      .then((data) => {
        setRows(data.items);
        setTotal(data.total);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [paginationModel, search, language, sortModel]);

  useEffect(() => { load(); }, [load]);

  const columns = useMemo<GridColDef<ReviewHistoryItem>[]>(() => [
    { field: "fileName", headerName: "File", flex: 1, minWidth: 180 },
    { field: "repository", headerName: "Repository", flex: 1, minWidth: 160 },
    { field: "language", headerName: "Language", width: 110 },
    {
      field: "overallScore",
      headerName: "Score",
      width: 100,
      renderCell: ({ value }) => (
        <Chip size="small" label={value as number} color={scoreColor(value as number)} />
      ),
    },
    { field: "criticalCount", headerName: "Critical", width: 90, type: "number" },
    { field: "highCount", headerName: "High", width: 80, type: "number" },
    {
      field: "createdAt",
      headerName: "Date",
      width: 180,
      valueFormatter: (value) => new Date(value as string).toLocaleString(),
    },
  ], []);

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <>
      <PageHeader
        title="Review History"
        subtitle="Search, filter, and open past AI code reviews"
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search file or repository…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPaginationModel((prev) => ({ ...prev, page: 0 }));
          }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
          }}
          sx={{ minWidth: { xs: "100%", sm: 280 } }}
        />
        <TextField
          select
          size="small"
          label="Language"
          value={language}
          onChange={(e) => {
            setLanguage(e.target.value);
            setPaginationModel((prev) => ({ ...prev, page: 0 }));
          }}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All languages</MenuItem>
          {LANGUAGE_OPTIONS.map((lang) => (
            <MenuItem key={lang} value={lang}>{lang}</MenuItem>
          ))}
        </TextField>
      </Stack>

      <Box sx={{ width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          rowCount={total}
          loading={loading}
          autoHeight
          paginationMode="server"
          sortingMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          onRowClick={(params) => navigate(`/history/${params.id}`)}
          sx={{ bgcolor: "background.paper", borderRadius: 2 }}
        />
      </Box>
    </>
  );
}
