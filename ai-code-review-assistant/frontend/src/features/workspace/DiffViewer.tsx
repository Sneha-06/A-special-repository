import { DiffEditor } from "@monaco-editor/react";
import { Box, Typography } from "@mui/material";

interface DiffViewerProps {
  original: string;
  modified: string;
  language: string;
  height?: number | string;
  hideTitle?: boolean;
}

export function DiffViewer({ original, modified, language, height = 400, hideTitle = false }: DiffViewerProps) {
  if (!modified) return null;

  return (
    <Box>
      {!hideTitle && (
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Before / After Comparison</Typography>
      )}
      <Box sx={{ border: 1, borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
        <DiffEditor
          height={height}
          language={language}
          original={original}
          modified={modified}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            renderSideBySide: true,
            automaticLayout: true,
          }}
        />
      </Box>
    </Box>
  );
}
