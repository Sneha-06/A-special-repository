import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import {
  Box, Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField,
} from "@mui/material";
import { ANALYSIS_TYPES, type AnalysisType } from "../../types/analysis";

interface AnalysisToolbarProps {
  analysisType: AnalysisType;
  language: string;
  filePath: string;
  title: string;
  context: string;
  loading: boolean;
  onAnalysisTypeChange: (v: AnalysisType) => void;
  onLanguageChange: (v: string) => void;
  onFilePathChange: (v: string) => void;
  onTitleChange: (v: string) => void;
  onContextChange: (v: string) => void;
  onAnalyze: () => void;
}

const LANGUAGES = ["typescript", "javascript", "tsx", "jsx", "python", "go", "java", "rust", "sql", "json"];

export function AnalysisToolbar(props: AnalysisToolbarProps) {
  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Analysis Type</InputLabel>
          <Select
            value={props.analysisType}
            label="Analysis Type"
            onChange={(e) => props.onAnalysisTypeChange(e.target.value as AnalysisType)}
          >
            {ANALYSIS_TYPES.map((t) => (
              <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Language</InputLabel>
          <Select value={props.language} label="Language" onChange={(e) => props.onLanguageChange(e.target.value)}>
            {LANGUAGES.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField
          size="small"
          label="File path"
          value={props.filePath}
          onChange={(e) => props.onFilePathChange(e.target.value)}
          sx={{ flex: 1 }}
        />
        <TextField
          size="small"
          label="Session title"
          value={props.title}
          onChange={(e) => props.onTitleChange(e.target.value)}
          sx={{ flex: 1 }}
        />
      </Stack>
      <TextField
        size="small"
        fullWidth
        multiline
        minRows={2}
        label="Additional context (optional)"
        value={props.context}
        onChange={(e) => props.onContextChange(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        startIcon={<AutoFixHighIcon />}
        onClick={props.onAnalyze}
        disabled={props.loading}
        size="large"
      >
        {props.loading ? "Analyzing…" : "Run AI Analysis"}
      </Button>
    </Box>
  );
}
