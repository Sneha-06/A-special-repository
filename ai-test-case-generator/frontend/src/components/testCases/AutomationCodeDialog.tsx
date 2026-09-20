import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { CodeViewer } from "../common/CodeViewer";
import { getErrorMessage } from "../../services/api";
import {
  generateAutomationCode,
  getFileExtension,
} from "../../services/automationService";
import type { AutomationCodeResult, AutomationFramework, AutomationLanguage } from "../../types/automation";
import type { TestCase } from "../../types/testCase";

const FRAMEWORKS: AutomationFramework[] = ["Playwright", "Cypress", "Selenium"];
const LANGUAGES: AutomationLanguage[] = ["TypeScript", "JavaScript", "Java"];

interface AutomationCodeDialogProps {
  open: boolean;
  testCase: TestCase | null;
  onClose: () => void;
  onGenerated?: (result: AutomationCodeResult) => void;
}

export function AutomationCodeDialog({
  open,
  testCase,
  onClose,
  onGenerated,
}: AutomationCodeDialogProps) {
  const [framework, setFramework] = useState<AutomationFramework>("Playwright");
  const [language, setLanguage] = useState<AutomationLanguage>("TypeScript");
  const [result, setResult] = useState<AutomationCodeResult | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyNotice, setCopyNotice] = useState(false);

  const handleGenerate = async () => {
    if (!testCase) return;
    setGenerating(true);
    setError(null);
    setCopyNotice(false);
    try {
      const generated = await generateAutomationCode({
        testCaseId: testCase.id,
        framework,
        language,
      });
      setResult(generated);
      onGenerated?.(generated);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.code);
    setCopyNotice(true);
  };

  const handleDownload = () => {
    if (!result) return;
    const ext = getFileExtension(result.framework, result.language);
    const blob = new Blob([result.code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${result.testCaseId}${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    if (!generating) {
      setResult(null);
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
      <DialogTitle>Generate Automation Code</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {testCase ? (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Test Case</Typography>
              <Typography variant="body1" fontWeight={600}>
                {testCase.testCaseId}: {testCase.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Expected: {testCase.expectedResult}
              </Typography>
            </Box>
          ) : null}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Framework</InputLabel>
              <Select
                label="Framework"
                value={framework}
                disabled={generating}
                onChange={(e) => setFramework(e.target.value as AutomationFramework)}
              >
                {FRAMEWORKS.map((f) => (
                  <MenuItem key={f} value={f}>{f}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select
                label="Language"
                value={language}
                disabled={generating}
                onChange={(e) => setLanguage(e.target.value as AutomationLanguage)}
              >
                {LANGUAGES.map((l) => (
                  <MenuItem key={l} value={l}>{l}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {error ? <Alert severity="error">{error}</Alert> : null}
          {copyNotice ? <Alert severity="success">Code copied to clipboard.</Alert> : null}

          {generating ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 2 }}>
              <CircularProgress size={24} />
              <Typography variant="body2">Generating automation code via OpenAI...</Typography>
            </Box>
          ) : null}

          {result ? (
            <CodeViewer
              code={result.code}
              language={result.language}
              framework={result.framework}
              testCaseId={result.testCaseId}
              onCopy={handleCopy}
              onDownload={handleDownload}
              onRegenerate={handleGenerate}
              regenerating={generating}
            />
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={generating}>Close</Button>
        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={generating || !testCase}
        >
          {result ? "Regenerate" : "Generate"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
