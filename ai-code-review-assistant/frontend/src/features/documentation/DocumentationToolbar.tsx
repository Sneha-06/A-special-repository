import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { Box, Button, Chip, InputLabel, Stack } from "@mui/material";
import { DOC_FORMATS, type DocFormat } from "../../types/documentation";

interface DocumentationToolbarProps {
  format: DocFormat;
  loading: boolean;
  onFormatChange: (format: DocFormat) => void;
  onGenerate: () => void;
}

export function DocumentationToolbar({ format, loading, onFormatChange, onGenerate }: DocumentationToolbarProps) {
  return (
    <Box sx={{ mb: 2 }}>
      <InputLabel shrink sx={{ mb: 0.5 }}>Documentation format</InputLabel>
      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
        {DOC_FORMATS.map((f) => (
          <Chip
            key={f.value}
            label={f.label}
            clickable
            color={format === f.value ? "primary" : "default"}
            variant={format === f.value ? "filled" : "outlined"}
            onClick={() => onFormatChange(f.value)}
          />
        ))}
      </Stack>
      <Button
        variant="outlined"
        startIcon={<DescriptionOutlinedIcon />}
        onClick={onGenerate}
        disabled={loading}
      >
        {loading ? "Generating…" : "Generate Documentation"}
      </Button>
    </Box>
  );
}
