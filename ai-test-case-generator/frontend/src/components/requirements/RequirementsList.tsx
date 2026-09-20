import { Chip, Paper, Skeleton } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { EmptyState } from "../common/EmptyState";
import type { Requirement } from "../../types/requirement";

interface RequirementsListProps {
  rows: Requirement[];
  loading?: boolean;
  onSelect?: (id: string) => void;
}

const columns: GridColDef<Requirement>[] = [
  { field: "title", headerName: "Requirement", flex: 1.2, minWidth: 180 },
  {
    field: "project",
    headerName: "Project",
    flex: 1,
    minWidth: 160,
    valueGetter: (_, row) => row.project?.name ?? "—",
  },
  {
    field: "applicationModule",
    headerName: "Module",
    flex: 0.8,
    minWidth: 120,
    valueGetter: (value) => (value as string | null) ?? "—",
  },
  {
    field: "priority",
    headerName: "Priority",
    width: 110,
    renderCell: (params) => (
      <Chip label={params.value as string} size="small" variant="outlined" />
    ),
  },
  {
    field: "analyses",
    headerName: "Analyzed",
    width: 100,
    valueGetter: (_, row) => (row.analyses?.length ?? 0) > 0,
    renderCell: (params) => (
      <Chip
        label={params.value ? "Yes" : "No"}
        size="small"
        color={params.value ? "success" : "default"}
        variant="outlined"
      />
    ),
  },
  {
    field: "updatedAt",
    headerName: "Updated",
    width: 120,
    valueFormatter: (value: string) =>
      new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
  },
];

export function RequirementsList({ rows, loading, onSelect }: RequirementsListProps) {
  if (loading) {
    return <Skeleton variant="rounded" height={360} />;
  }

  if (rows.length === 0) {
    return (
      <Paper sx={{ p: 1 }}>
        <EmptyState
          title="No requirements yet"
          description="Create your first requirement to start AI-assisted analysis."
        />
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 1 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        autoHeight
        disableRowSelectionOnClick={!onSelect}
        onRowClick={(params) => onSelect?.(params.row.id)}
        pageSizeOptions={[5, 10, 25]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        sx={{
          border: "none",
          cursor: onSelect ? "pointer" : "default",
          "& .MuiDataGrid-columnHeaders": { bgcolor: "background.default" },
        }}
      />
    </Paper>
  );
}
