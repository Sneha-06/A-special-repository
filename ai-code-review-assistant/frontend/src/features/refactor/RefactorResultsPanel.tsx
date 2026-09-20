import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Alert, Box, Button, Card, CardContent, List, ListItem, ListItemIcon, ListItemText,
  Snackbar, Stack, Typography,
} from "@mui/material";
import { useState } from "react";
import { DiffViewer } from "../workspace/DiffViewer";
import type { RefactorResult } from "../../types/refactor";
import { copyToClipboard, downloadTextFile } from "../../utils/download";

interface RefactorResultsPanelProps {
  result: RefactorResult;
  language: string;
  fileName: string;
  onApply: (code: string) => void;
  onRegenerate: () => void;
  regenerating: boolean;
}

export function RefactorResultsPanel({
  result, language, fileName, onApply, onRegenerate, regenerating,
}: RefactorResultsPanelProps) {
  const [snack, setSnack] = useState<string | null>(null);
  const [confirmApply, setConfirmApply] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(result.afterCode);
    setSnack("Improved code copied to clipboard");
  };

  const handleDownload = () => {
    const name = fileName || `improved.${language === "typescript" ? "ts" : language}`;
    downloadTextFile(result.afterCode, name.replace(/\.[^.]+$/, "") + ".improved." + (name.split(".").pop() ?? "txt"));
    setSnack("Download started");
  };

  const handleApply = () => {
    if (!confirmApply) {
      setConfirmApply(true);
      return;
    }
    onApply(result.afterCode);
    setConfirmApply(false);
    setSnack("Changes applied to editor");
  };

  const unchanged = result.beforeCode.trim() === result.afterCode.trim();

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Code Improvements</Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {result.summary}
        </Typography>

        {result.improvements.length > 0 && (
          <List dense sx={{ mb: 2, bgcolor: "grey.50", borderRadius: 2 }}>
            {result.improvements.map((item) => (
              <ListItem key={item}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckIcon color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={item} primaryTypographyProps={{ variant: "body2" }} />
              </ListItem>
            ))}
          </List>
        )}

        {result.explanation && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Explanation</Typography>
            <Typography variant="body2">{result.explanation}</Typography>
          </Alert>
        )}

        {unchanged && (
          <Alert severity="success" sx={{ mb: 2 }}>
            The code is already in good shape for the selected options. No changes were necessary.
          </Alert>
        )}

        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
          <Button
            variant="contained"
            color={confirmApply ? "warning" : "primary"}
            onClick={handleApply}
            disabled={unchanged}
          >
            {confirmApply ? "Confirm Apply Changes" : "Apply Changes"}
          </Button>
          <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={handleCopy}>
            Copy Improved Code
          </Button>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownload}>
            Download
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={onRegenerate}
            disabled={regenerating}
          >
            {regenerating ? "Regenerating…" : "Regenerate"}
          </Button>
        </Stack>

        {confirmApply && (
          <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setConfirmApply(false)}>
            This will replace the code in the editor. Click &quot;Confirm Apply Changes&quot; to proceed, or dismiss to cancel.
          </Alert>
        )}

        <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>Original</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>Improved</Typography>
        </Box>

        <DiffViewer
          original={result.beforeCode}
          modified={result.afterCode}
          language={language}
          height={480}
          hideTitle
        />
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
