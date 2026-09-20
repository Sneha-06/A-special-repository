import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { getErrorMessage } from "../../services/api";
import { generateTestCases } from "../../services/testCaseService";
import type { Requirement } from "../../types/requirement";
import type {
  GenerationProgressEvent,
  GenerationStage,
  TestCase,
  TestPriority,
  TestSeverity,
  TestTypeOption,
} from "../../types/testCase";
import { TEST_TYPE_OPTIONS } from "../../types/testCase";
import { GenerationProgress } from "./GenerationProgress";

interface GenerateTestCasesDialogProps {
  open: boolean;
  requirement: Requirement | null;
  onClose: () => void;
  onGenerated: (testCases: TestCase[]) => void;
}

export function GenerateTestCasesDialog({
  open,
  requirement,
  onClose,
  onGenerated,
}: GenerateTestCasesDialogProps) {
  const [testTypes, setTestTypes] = useState<TestTypeOption[]>(["Functional", "Negative"]);
  const [numberOfTestCases, setNumberOfTestCases] = useState(5);
  const [priority, setPriority] = useState<TestPriority>("HIGH");
  const [severity, setSeverity] = useState<TestSeverity>("MAJOR");
  const [generating, setGenerating] = useState(false);
  const [activeStage, setActiveStage] = useState<GenerationStage | null>(null);
  const [stageMessage, setStageMessage] = useState<string>();
  const [error, setError] = useState<string | null>(null);

  const toggleType = (type: TestTypeOption) => {
    setTestTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const handleGenerate = async () => {
    if (!requirement) return;
    setGenerating(true);
    setError(null);
    setActiveStage(null);
    setStageMessage(undefined);

    try {
      const testCases = await generateTestCases(
        {
          requirementId: requirement.id,
          testTypes,
          numberOfTestCases,
          priority,
          severity,
        },
        (event: GenerationProgressEvent) => {
          setActiveStage(event.stage);
          setStageMessage(event.message);
        },
      );
      onGenerated(testCases);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setGenerating(false);
      setActiveStage(null);
    }
  };

  const handleClose = () => {
    if (!generating) onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Generate Test Cases</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">Requirement</Typography>
            <Typography variant="body1" fontWeight={600}>{requirement?.title ?? "—"}</Typography>
            <Typography variant="body2" color="text.secondary">{requirement?.description}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>Test Types</Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {TEST_TYPE_OPTIONS.map((type) => (
                <Chip
                  key={type}
                  label={type}
                  clickable
                  color={testTypes.includes(type) ? "primary" : "default"}
                  variant={testTypes.includes(type) ? "filled" : "outlined"}
                  onClick={() => toggleType(type)}
                  disabled={generating}
                />
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Number of Test Cases: {numberOfTestCases}
            </Typography>
            <Slider
              value={numberOfTestCases}
              min={1}
              max={15}
              step={1}
              marks
              disabled={generating}
              onChange={(_, value) => setNumberOfTestCases(value as number)}
            />
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel id="gen-priority">Priority</InputLabel>
              <Select
                labelId="gen-priority"
                label="Priority"
                value={priority}
                disabled={generating}
                onChange={(e) => setPriority(e.target.value as TestPriority)}
              >
                {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as TestPriority[]).map((p) => (
                  <MenuItem key={p} value={p}>{p}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="gen-severity">Severity</InputLabel>
              <Select
                labelId="gen-severity"
                label="Severity"
                value={severity}
                disabled={generating}
                onChange={(e) => setSeverity(e.target.value as TestSeverity)}
              >
                {(["MINOR", "MODERATE", "MAJOR", "CRITICAL"] as TestSeverity[]).map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {generating ? (
            <GenerationProgress activeStage={activeStage} currentMessage={stageMessage} />
          ) : null}

          {error ? (
            <Typography color="error" variant="body2">{error}</Typography>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={generating}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={generating || !requirement || testTypes.length === 0}
        >
          {generating ? "Generating..." : "Generate Test Cases"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
