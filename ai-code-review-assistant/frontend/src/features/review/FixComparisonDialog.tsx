import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography,
} from "@mui/material";
import { DiffViewer } from "../workspace/DiffViewer";
import type { ReviewIssue } from "../../types/review";

interface FixComparisonDialogProps {
  open: boolean;
  issue: ReviewIssue | null;
  sourceCode: string;
  language: string;
  onClose: () => void;
}

function extractLines(source: string, lineStart?: number | null, lineEnd?: number | null): string {
  if (!lineStart) return source;
  const lines = source.split("\n");
  const start = Math.max(0, lineStart - 1);
  const end = Math.min(lines.length, (lineEnd ?? lineStart));
  return lines.slice(start, end).join("\n");
}

export function FixComparisonDialog({ open, issue, sourceCode, language, onClose }: FixComparisonDialogProps) {
  if (!issue) return null;

  const original = extractLines(sourceCode, issue.lineStart, issue.lineEnd);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Before / After — {issue.title}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Compare the original code with the suggested fix for {issue.id}.
        </Typography>
        <DiffViewer
          original={original || sourceCode}
          modified={issue.suggestion}
          language={language}
          height={360}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
