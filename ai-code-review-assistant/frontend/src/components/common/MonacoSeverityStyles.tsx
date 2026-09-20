import { GlobalStyles, useTheme } from "@mui/material";

export function MonacoSeverityStyles() {
  const theme = useTheme();
  const s = theme.palette.severity;

  return (
    <GlobalStyles
      styles={{
        ".monaco-severity-critical": { backgroundColor: `${s.critical.light} !important` },
        ".monaco-severity-high": { backgroundColor: `${s.high.light} !important` },
        ".monaco-severity-medium": { backgroundColor: `${s.medium.light} !important` },
        ".monaco-severity-low": { backgroundColor: `${s.low.light} !important` },
        ".monaco-severity-info": { backgroundColor: `${s.info.light} !important` },
        ".monaco-severity-glyph-critical::before": { color: s.critical.main },
        ".monaco-severity-glyph-high::before": { color: s.high.main },
        ".monaco-severity-glyph-medium::before": { color: s.medium.main },
        ".monaco-severity-glyph-low::before": { color: s.low.main },
        ".monaco-severity-glyph-info::before": { color: s.info.main },
      }}
    />
  );
}
