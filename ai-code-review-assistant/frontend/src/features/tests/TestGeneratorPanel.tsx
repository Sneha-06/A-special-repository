import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Box, Button, Card, CardContent, Chip, Grid, List, ListItem, ListItemText,
  Snackbar, Stack, Typography,
} from "@mui/material";
import { useState } from "react";
import { CodeEditor } from "../workspace/CodeEditor";
import type { TestGeneratorResult } from "../../types/testGenerator";
import { copyToClipboard, downloadTextFile } from "../../utils/download";

const CATEGORY_COLORS: Record<string, "success" | "warning" | "error" | "info" | "default"> = {
  "happy-path": "success",
  negative: "warning",
  "edge-case": "info",
  error: "error",
  async: "default",
};

interface TestGeneratorPanelProps {
  result: TestGeneratorResult;
  onRegenerate: () => void;
  regenerating: boolean;
}

export function TestGeneratorPanel({ result, onRegenerate, regenerating }: TestGeneratorPanelProps) {
  const [snack, setSnack] = useState<string | null>(null);
  const editorLanguage = result.testFileName.endsWith(".tsx") ? "typescript" : "typescript";

  const handleCopy = async () => {
    await copyToClipboard(result.code);
    setSnack("Test code copied to clipboard");
  };

  const handleDownload = () => {
    downloadTextFile(result.code, result.testFileName);
    setSnack("Download started");
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Generated Tests — {result.testFileName}</Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip size="small" label={result.testFramework} color="primary" variant="outlined" />
        </Stack>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2, textAlign: "center" }}>
              <Typography variant="h4" fontWeight={700}>{result.summary.totalTests}</Typography>
              <Typography variant="body2" color="text.secondary">Tests generated</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2, textAlign: "center" }}>
              <Typography variant="h4" fontWeight={700}>{result.summary.functionsCovered.length}</Typography>
              <Typography variant="body2" color="text.secondary">Functions covered</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2, textAlign: "center" }}>
              <Typography variant="h4" fontWeight={700}>{result.summary.edgeCasesCovered}</Typography>
              <Typography variant="body2" color="text.secondary">Edge / error cases</Typography>
            </Box>
          </Grid>
        </Grid>

        {result.summary.functionsCovered.length > 0 && (
          <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mb: 2 }}>
            {result.summary.functionsCovered.map((fn) => (
              <Chip key={fn} size="small" label={fn} variant="outlined" />
            ))}
          </Stack>
        )}

        <Typography variant="subtitle2" gutterBottom>Test cases</Typography>
        <List dense sx={{ mb: 2, bgcolor: "grey.50", borderRadius: 2 }}>
          {result.tests.map((test) => (
            <ListItem key={test.name} alignItems="flex-start">
              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Chip size="small" label={test.category} color={CATEGORY_COLORS[test.category] ?? "default"} />
                    <Typography variant="body2" fontWeight={600}>{test.name}</Typography>
                  </Stack>
                }
                secondary={test.description}
              />
            </ListItem>
          ))}
        </List>

        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
          <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={handleCopy}>Copy</Button>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownload}>Download</Button>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onRegenerate} disabled={regenerating}>
            {regenerating ? "Regenerating…" : "Regenerate"}
          </Button>
        </Stack>

        <Typography variant="subtitle2" gutterBottom>Test file</Typography>
        <CodeEditor value={result.code} language={editorLanguage} onChange={() => {}} readOnly height={420} />
      </CardContent>

      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={3000}
        message={snack}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Card>
  );
}
