import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Accordion, AccordionDetails, AccordionSummary, Box, Button, Card, CardContent,
  Chip, Snackbar, Stack, Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState } from "react";
import { CodeEditor } from "../workspace/CodeEditor";
import type { DocumentationResult } from "../../types/documentation";
import { copyToClipboard, downloadTextFile } from "../../utils/download";

interface DocumentationPanelProps {
  result: DocumentationResult;
  onRegenerate: () => void;
  regenerating: boolean;
}

const FORMAT_EXT: Record<string, string> = {
  jsdoc: "js",
  markdown: "md",
  readme: "md",
  api: "md",
};

export function DocumentationPanel({ result, onRegenerate, regenerating }: DocumentationPanelProps) {
  const [snack, setSnack] = useState<string | null>(null);
  const editorLanguage = result.format === "jsdoc" ? "javascript" : "markdown";

  const handleCopy = async () => {
    await copyToClipboard(result.content);
    setSnack("Documentation copied to clipboard");
  };

  const handleDownload = () => {
    const ext = FORMAT_EXT[result.format] ?? "txt";
    const safeTitle = result.title.replace(/[^a-z0-9-_]/gi, "-").toLowerCase();
    downloadTextFile(result.content, `${safeTitle}.${ext}`);
    setSnack("Download started");
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>{result.title}</Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip size="small" label={result.format.toUpperCase()} color="primary" variant="outlined" />
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{result.summary}</Typography>

        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
          <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={handleCopy}>Copy</Button>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownload}>Download</Button>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onRegenerate} disabled={regenerating}>
            {regenerating ? "Regenerating…" : "Regenerate"}
          </Button>
        </Stack>

        {result.items.length > 0 && (
          <Accordion disableGutters sx={{ mb: 2, "&:before": { display: "none" } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>Documented items ({result.items.length})</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {result.items.map((item) => (
                <Box key={item.name} sx={{ mb: 2, p: 1.5, bgcolor: "grey.50", borderRadius: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <Typography variant="subtitle2" fontFamily="monospace">{item.name}</Typography>
                    <Chip size="small" label={item.type} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">{item.description}</Typography>
                  {item.parameters.length > 0 && (
                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                      Parameters: {item.parameters.map((p) => p.name).join(", ")}
                    </Typography>
                  )}
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        )}

        <Typography variant="subtitle2" gutterBottom>Generated documentation</Typography>
        <CodeEditor
          value={result.content}
          language={editorLanguage}
          onChange={() => {}}
          readOnly
          height={420}
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
