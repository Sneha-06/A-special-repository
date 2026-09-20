import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CodeIcon from "@mui/icons-material/Code";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Chip, IconButton, Paper, Skeleton, Stack, Tooltip } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { EmptyState } from "../common/EmptyState";
import type { TestCase } from "../../types/testCase";

interface TestCasesGridProps {
  rows: TestCase[];
  loading?: boolean;
  actionLoadingId?: string | null;
  onView: (testCase: TestCase) => void;
  onEdit: (testCase: TestCase) => void;
  onDuplicate: (testCase: TestCase) => void;
  onDelete: (testCase: TestCase) => void;
  onRegenerate: (testCase: TestCase) => void;
  onAutomation: (testCase: TestCase) => void;
}

export function TestCasesGrid({
  rows,
  loading,
  actionLoadingId,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  onRegenerate,
  onAutomation,
}: TestCasesGridProps) {
  const columns: GridColDef<TestCase>[] = [
    { field: "testCaseId", headerName: "ID", width: 150 },
    { field: "title", headerName: "Title", flex: 1.2, minWidth: 200 },
    {
      field: "category",
      headerName: "Category",
      width: 130,
      valueFormatter: (value: string) => value.replace(/_/g, " "),
    },
    {
      field: "priority",
      headerName: "Priority",
      width: 100,
      renderCell: (params) => <Chip label={params.value as string} size="small" variant="outlined" />,
    },
    {
      field: "severity",
      headerName: "Severity",
      width: 100,
      renderCell: (params) => <Chip label={params.value as string} size="small" variant="outlined" />,
    },
    {
      field: "automationCandidate",
      headerName: "Automation",
      width: 110,
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
      field: "actions",
      headerName: "Actions",
      width: 220,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const row = params.row;
        const busy = actionLoadingId === row.id;
        return (
          <Stack direction="row" spacing={0.25}>
            <Tooltip title="View">
              <IconButton size="small" onClick={() => onView(row)} disabled={busy}>
                <VisibilityOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => onEdit(row)} disabled={busy}>
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Duplicate">
              <IconButton size="small" onClick={() => onDuplicate(row)} disabled={busy}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" onClick={() => onDelete(row)} disabled={busy}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Regenerate">
              <IconButton size="small" onClick={() => onRegenerate(row)} disabled={busy}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Generate Automation Code">
              <IconButton size="small" onClick={() => onAutomation(row)} disabled={busy}>
                <CodeIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        );
      },
    },
  ];

  if (loading) return <Skeleton variant="rounded" height={420} />;

  if (rows.length === 0) {
    return (
      <Paper sx={{ p: 1 }}>
        <EmptyState
          title="No test cases yet"
          description="Select a requirement and generate AI-powered test cases."
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
        disableRowSelectionOnClick
        pageSizeOptions={[10, 25, 50]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        sx={{
          border: "none",
          "& .MuiDataGrid-columnHeaders": { bgcolor: "background.default" },
        }}
      />
    </Paper>
  );
}
