import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { StatusChip } from "../dashboard/StatusChip";
import type { GenerationHistoryItem } from "../../types/history";
import { normalizeAnalysisRecord } from "../../utils/parseAnalysis";
import { AnalysisResultPanel } from "../requirements/AnalysisResultPanel";

interface GenerationDetailDialogProps {
  open: boolean;
  item: GenerationHistoryItem | null;
  onClose: () => void;
}

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function getNavigation(item: GenerationHistoryItem) {
  switch (item.generationType) {
    case "REQUIREMENT_ANALYSIS":
      return { label: "Open Requirement", path: `/requirements/${item.requirementId}` };
    case "TEST_CASES":
    case "AUTOMATION_CODE":
      return { label: "Open Test Cases", path: `/test-cases?requirementId=${item.requirementId}` };
    case "ACCEPTANCE_CRITERIA":
      return { label: "Open Acceptance Criteria", path: `/requirements/${item.requirementId}` };
    case "SYNTHETIC_TEST_DATA":
      return { label: "Open Test Data", path: `/test-cases?requirementId=${item.requirementId}` };
    case "COVERAGE_ANALYSIS":
      return { label: "Open Coverage", path: "/coverage" };
    default:
      return { label: "Open Requirement", path: `/requirements/${item.requirementId}` };
  }
}

export function GenerationDetailDialog({ open, item, onClose }: GenerationDetailDialogProps) {
  const navigate = useNavigate();

  if (!item) return null;

  const nav = getNavigation(item);
  const showAnalysis =
    item.generationType === "REQUIREMENT_ANALYSIS" &&
    item.status === "COMPLETED" &&
    item.output &&
    typeof item.output === "object";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Generation Details</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label={item.generationTypeLabel} color="primary" variant="outlined" />
            <StatusChip status={item.status} />
            <Chip label={item.model} size="small" variant="outlined" />
          </Stack>

          <Box>
            <Typography variant="subtitle2" color="text.secondary">Requirement</Typography>
            <Typography variant="body1" fontWeight={600}>{item.requirementTitle}</Typography>
            <Typography variant="body2" color="text.secondary">{item.projectName}</Typography>
          </Box>

          <Typography variant="body2" color="text.secondary">
            {new Date(item.createdAt).toLocaleString()} · {item.generatedItemCount} generated item(s)
          </Typography>

          {showAnalysis ? (
            <AnalysisResultPanel
              analysis={normalizeAnalysisRecord(item.output as Record<string, unknown>)}
              analyzedAt={item.createdAt}
            />
          ) : (
            <>
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>Input</Typography>
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    p: 2,
                    bgcolor: "background.default",
                    borderRadius: 1,
                    overflow: "auto",
                    fontSize: 12,
                  }}
                >
                  {formatJson(item.input)}
                </Box>
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>Output</Typography>
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    p: 2,
                    bgcolor: "background.default",
                    borderRadius: 1,
                    overflow: "auto",
                    fontSize: 12,
                  }}
                >
                  {formatJson(item.output)}
                </Box>
              </Box>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          endIcon={<OpenInNewIcon />}
          onClick={() => {
            navigate(nav.path);
            onClose();
          }}
        >
          {nav.label}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
