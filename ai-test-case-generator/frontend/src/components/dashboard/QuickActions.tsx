import AddIcon from "@mui/icons-material/Add";
import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import AutoFixHighOutlinedIcon from "@mui/icons-material/AutoFixHighOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

type DialogType = "requirement" | "analyze" | "generate" | null;

export function QuickActions() {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState<DialogType>(null);

  const closeDialog = () => setOpenDialog(null);

  const handleViewCoverage = () => {
    navigate("/coverage");
  };

  return (
    <>
      <Paper sx={{ p: 2.5 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Quick Actions
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Common QA workflows to move from requirements to test coverage
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          useFlexGap
          flexWrap="wrap"
        >
          <Tooltip title="Capture a new software requirement" arrow>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog("requirement")}
            >
              New Requirement
            </Button>
          </Tooltip>
          <Tooltip title="Run AI analysis on an existing requirement" arrow>
            <Button
              variant="outlined"
              startIcon={<AnalyticsOutlinedIcon />}
              onClick={() => setOpenDialog("analyze")}
            >
              Analyze Requirement
            </Button>
          </Tooltip>
          <Tooltip title="Generate test cases from analyzed requirements" arrow>
            <Button
              variant="outlined"
              startIcon={<AutoFixHighOutlinedIcon />}
              onClick={() => setOpenDialog("generate")}
            >
              Generate Test Cases
            </Button>
          </Tooltip>
          <Tooltip title="Open coverage mapping view" arrow>
            <Button
              variant="outlined"
              startIcon={<VisibilityOutlinedIcon />}
              onClick={handleViewCoverage}
            >
              View Coverage
            </Button>
          </Tooltip>
        </Stack>
      </Paper>

      <Dialog open={openDialog === "requirement"} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>New Requirement</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Requirement persistence will be available in the next API phase. Use the Requirements page to preview the intake form.
            </Typography>
            <Stack spacing={2}>
              <TextField label="Title" fullWidth disabled placeholder="e.g. Member eligibility verification" />
              <TextField label="Description" fullWidth multiline rows={3} disabled />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" onClick={() => { closeDialog(); navigate("/requirements"); setOpenDialog(null); }}>
            Create Requirement
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog === "analyze"} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>Analyze Requirement</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ pt: 1 }}>
            AI requirement analysis is not enabled yet. Once the OpenAI service is connected, you will be able to extract actors, business rules, risks, and ambiguities from requirement text.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Close</Button>
          <Button variant="contained" onClick={() => { closeDialog(); navigate("/requirements"); }}>
            View Requirements
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog === "generate"} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>Generate Test Cases</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ pt: 1 }}>
            Test case generation will run server-side via OpenAI. Generated cases will include steps, test data, and automation candidates stored in PostgreSQL.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Close</Button>
          <Button variant="contained" onClick={() => { closeDialog(); navigate("/test-cases"); setOpenDialog(null); }}>
            Open Test Cases
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
