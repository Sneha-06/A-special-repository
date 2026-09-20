import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeViewerProps {
  code: string;
  language: string;
  framework: string;
  testCaseId: string;
  onCopy?: () => void;
  onDownload?: () => void;
  onRegenerate?: () => void;
  regenerating?: boolean;
}

function toSyntaxLanguage(language: string): string {
  const map: Record<string, string> = {
    TypeScript: "typescript",
    JavaScript: "javascript",
    Java: "java",
  };
  return map[language] ?? "typescript";
}

export function CodeViewer({
  code,
  language,
  framework,
  testCaseId,
  onCopy,
  onDownload,
  onRegenerate,
  regenerating,
}: CodeViewerProps) {
  return (
    <Paper variant="outlined" sx={{ overflow: "hidden" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1}
        sx={{ px: 2, py: 1.5, bgcolor: "background.default", borderBottom: 1, borderColor: "divider" }}
      >
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip label={testCaseId} size="small" color="primary" variant="outlined" />
          <Chip label={framework} size="small" variant="outlined" />
          <Chip label={language} size="small" variant="outlined" />
        </Stack>
        <Stack direction="row" spacing={1}>
          {onCopy ? (
            <Button size="small" startIcon={<ContentCopyIcon />} onClick={onCopy}>
              Copy
            </Button>
          ) : null}
          {onDownload ? (
            <Button size="small" startIcon={<DownloadIcon />} onClick={onDownload}>
              Download
            </Button>
          ) : null}
          {onRegenerate ? (
            <Button
              size="small"
              startIcon={<RefreshIcon />}
              onClick={onRegenerate}
              disabled={regenerating}
            >
              {regenerating ? "Regenerating..." : "Regenerate"}
            </Button>
          ) : null}
        </Stack>
      </Stack>

      <Box sx={{ maxHeight: 480, overflow: "auto" }}>
        <SyntaxHighlighter
          language={toSyntaxLanguage(language)}
          style={oneLight}
          customStyle={{
            margin: 0,
            borderRadius: 0,
            fontSize: 13,
            background: "#FAFBFC",
          }}
          showLineNumbers
        >
          {code}
        </SyntaxHighlighter>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: "block", px: 2, py: 1 }}>
        Generated automation code — review selectors and assertions before running in CI.
      </Typography>
    </Paper>
  );
}
