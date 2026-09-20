import RateReviewIcon from "@mui/icons-material/RateReview";
import {
  Box, Button, Chip, FormControl, InputLabel, MenuItem, Select, Stack, TextField,
} from "@mui/material";
import { REVIEW_TYPES, type ReviewType } from "../../types/review";

const LANGUAGES = [
  "typescript", "javascript", "tsx", "jsx", "python", "go", "java",
  "rust", "csharp", "ruby", "php", "sql", "json", "html", "css", "vue", "svelte",
];

const FRAMEWORKS = ["react", "vue", "angular", "svelte", "next", "express", "node", "none"];

interface ReviewToolbarProps {
  language: string;
  framework: string;
  fileName: string;
  projectContext: string;
  reviewTypes: ReviewType[];
  loading: boolean;
  onLanguageChange: (v: string) => void;
  onFrameworkChange: (v: string) => void;
  onFileNameChange: (v: string) => void;
  onProjectContextChange: (v: string) => void;
  onReviewTypesChange: (v: ReviewType[]) => void;
  onReview: () => void;
}

export function ReviewToolbar({
  language, framework, fileName, projectContext, reviewTypes, loading,
  onLanguageChange, onFrameworkChange, onFileNameChange, onProjectContextChange,
  onReviewTypesChange, onReview,
}: ReviewToolbarProps) {
  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Language</InputLabel>
          <Select value={language} label="Language" onChange={(e) => onLanguageChange(e.target.value)}>
            {LANGUAGES.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Framework</InputLabel>
          <Select value={framework} label="Framework" onChange={(e) => onFrameworkChange(e.target.value)}>
            {FRAMEWORKS.map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField
          size="small"
          label="File name"
          value={fileName}
          onChange={(e) => onFileNameChange(e.target.value)}
          sx={{ flex: 1 }}
          placeholder="src/components/UserList.tsx"
        />
      </Stack>

      <Box sx={{ mb: 2 }}>
        <InputLabel shrink sx={{ mb: 0.5 }}>Review types</InputLabel>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {REVIEW_TYPES.map((t) => {
            const selected = reviewTypes.includes(t.value);
            return (
              <Chip
                key={t.value}
                label={t.label}
                clickable
                color={selected ? "primary" : "default"}
                variant={selected ? "filled" : "outlined"}
                onClick={() => {
                  const next = selected
                    ? reviewTypes.filter((r) => r !== t.value)
                    : [...reviewTypes, t.value];
                  onReviewTypesChange(next.length > 0 ? next : ["general"]);
                }}
              />
            );
          })}
        </Stack>
      </Box>

      <TextField
        size="small"
        fullWidth
        multiline
        minRows={2}
        label="Project context (optional)"
        value={projectContext}
        onChange={(e) => onProjectContextChange(e.target.value)}
        sx={{ mb: 2 }}
        placeholder="e.g. Production React 18 app using Redux Toolkit and React Query"
      />

      <Button
        variant="contained"
        size="large"
        startIcon={<RateReviewIcon />}
        onClick={onReview}
        disabled={loading}
      >
        {loading ? "Reviewing…" : "Review Code"}
      </Button>
    </Box>
  );
}
