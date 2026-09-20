import {
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import type { TestCase } from "../../types/testCase";

interface TestCaseViewDialogProps {
  open: boolean;
  testCase: TestCase | null;
  onClose: () => void;
}

export function TestCaseViewDialog({ open, testCase, onClose }: TestCaseViewDialogProps) {
  if (!testCase) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{testCase.testCaseId}: {testCase.title}</DialogTitle>
      <DialogContent dividers>
        <StackRow label="Category" value={testCase.category.replace(/_/g, " ")} />
        <StackRow label="Priority" value={testCase.priority} />
        <StackRow label="Severity" value={testCase.severity} />
        <StackRow
          label="Automation Candidate"
          value={testCase.automationCandidate ? "Yes" : "No"}
        />

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>Preconditions</Typography>
        <Typography variant="body2" sx={{ mb: 2, whiteSpace: "pre-wrap" }}>
          {testCase.preconditions}
        </Typography>

        <Typography variant="subtitle2" gutterBottom>Test Steps</Typography>
        <List dense>
          {testCase.steps.map((step) => (
            <ListItem key={step.id} alignItems="flex-start" sx={{ px: 0 }}>
              <ListItemText
                primary={`${step.stepNumber}. ${step.action}`}
                secondary={
                  <>
                    {step.testData ? `Data: ${step.testData} · ` : ""}
                    Expected: {step.expectedResult}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>

        {testCase.testData.length > 0 ? (
          <>
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Test Data</Typography>
            <List dense>
              {testCase.testData.map((row) => (
                <ListItem key={row.id} sx={{ px: 0 }}>
                  <ListItemText
                    primary={`${row.field} (${row.dataType})`}
                    secondary={row.value}
                  />
                </ListItem>
              ))}
            </List>
          </>
        ) : null}

        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Expected Result</Typography>
        <Typography variant="body2">{testCase.expectedResult}</Typography>

        {testCase.postconditions ? (
          <>
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Postconditions</Typography>
            <Typography variant="body2">{testCase.postconditions}</Typography>
          </>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Chip
          label={testCase.requirement?.title ?? "Requirement"}
          size="small"
          variant="outlined"
        />
      </DialogActions>
    </Dialog>
  );
}

function StackRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 160 }}>{label}</Typography>
      <Typography variant="body2" fontWeight={500}>{value}</Typography>
    </Box>
  );
}
