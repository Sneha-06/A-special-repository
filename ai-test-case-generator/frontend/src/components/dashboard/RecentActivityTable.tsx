import { Paper, Skeleton, Typography } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { EmptyState } from "../common/EmptyState";
import { StatusChip } from "./StatusChip";
import type { RecentActivityItem } from "../../types/dashboard";

interface RecentActivityTableProps {
  rows: RecentActivityItem[];
  loading?: boolean;
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

const columns: GridColDef<RecentActivityItem>[] = [
  {
    field: "requirement",
    headerName: "Requirement",
    flex: 1.4,
    minWidth: 200,
  },
  {
    field: "project",
    headerName: "Project",
    flex: 1,
    minWidth: 160,
  },
  {
    field: "testCasesGenerated",
    headerName: "Test Cases",
    type: "number",
    width: 120,
    align: "center",
    headerAlign: "center",
  },
  {
    field: "date",
    headerName: "Date",
    flex: 0.9,
    minWidth: 170,
    valueFormatter: (value: string) => formatDate(value),
  },
  {
    field: "status",
    headerName: "Status",
    width: 130,
    renderCell: (params) => <StatusChip status={params.value as string} />,
  },
];

export function RecentActivityTable({ rows, loading }: RecentActivityTableProps) {
  return (
    <Paper sx={{ p: 2.5 }}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Recent Activity
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Latest test case generation runs across projects
      </Typography>
      {loading ? (
        <Skeleton variant="rounded" height={320} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No recent activity"
          description="Generation history will appear here after test cases are created."
        />
      ) : (
        <DataGrid
          rows={rows}
          columns={columns}
          autoHeight
          disableRowSelectionOnClick
          pageSizeOptions={[5, 10]}
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
          }}
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: "background.default",
            },
          }}
        />
      )}
    </Paper>
  );
}
