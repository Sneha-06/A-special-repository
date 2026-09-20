import { Paper, Skeleton, Typography } from "@mui/material";
import { DataGrid, type GridColDef, type GridPaginationModel } from "@mui/x-data-grid";
import { EmptyState } from "../common/EmptyState";
import { StatusChip } from "../dashboard/StatusChip";
import type { GenerationHistoryItem } from "../../types/history";

interface GenerationHistoryGridProps {
  rows: GenerationHistoryItem[];
  loading?: boolean;
  rowCount: number;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  onRowOpen: (item: GenerationHistoryItem) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const columns: GridColDef<GenerationHistoryItem>[] = [
  {
    field: "requirementTitle",
    headerName: "Requirement",
    flex: 1.3,
    minWidth: 200,
  },
  {
    field: "generationTypeLabel",
    headerName: "Generation Type",
    flex: 1,
    minWidth: 170,
  },
  {
    field: "model",
    headerName: "Model",
    flex: 0.8,
    minWidth: 120,
  },
  {
    field: "status",
    headerName: "Status",
    width: 130,
    renderCell: (params) => <StatusChip status={params.value as string} />,
  },
  {
    field: "generatedItemCount",
    headerName: "Generated Items",
    type: "number",
    width: 140,
    align: "center",
    headerAlign: "center",
  },
  {
    field: "createdAt",
    headerName: "Date",
    flex: 0.9,
    minWidth: 170,
    valueFormatter: (value: string) => formatDate(value),
  },
];

export function GenerationHistoryGrid({
  rows,
  loading,
  rowCount,
  paginationModel,
  onPaginationModelChange,
  onRowOpen,
}: GenerationHistoryGridProps) {
  return (
    <Paper sx={{ p: 2.5 }}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        AI Generation History
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Audit trail of all AI generation runs with input and output snapshots
      </Typography>

      {loading && rows.length === 0 ? (
        <Skeleton variant="rounded" height={420} />
      ) : rowCount === 0 ? (
        <EmptyState
          title="No generation history"
          description="Run requirement analysis, test case generation, or other AI features to populate the history log."
        />
      ) : (
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          rowCount={rowCount}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={onPaginationModelChange}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          onRowClick={(params) => onRowOpen(params.row)}
          autoHeight
          sx={{
            border: "none",
            "& .MuiDataGrid-row": { cursor: "pointer" },
            "& .MuiDataGrid-columnHeaders": { bgcolor: "background.default" },
          }}
        />
      )}
    </Paper>
  );
}
