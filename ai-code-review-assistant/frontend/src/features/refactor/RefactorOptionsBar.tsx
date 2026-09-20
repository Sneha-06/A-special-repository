import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import { Box, Button, Chip, InputLabel, Stack } from "@mui/material";
import { REFACTOR_OPTIONS, type RefactorOption } from "../../types/refactor";

interface RefactorOptionsBarProps {
  options: RefactorOption[];
  loading: boolean;
  onOptionsChange: (options: RefactorOption[]) => void;
  onImprove: () => void;
}

export function RefactorOptionsBar({ options, loading, onOptionsChange, onImprove }: RefactorOptionsBarProps) {
  return (
    <Box sx={{ mb: 2 }}>
      <InputLabel shrink sx={{ mb: 0.5 }}>Refactoring options</InputLabel>
      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
        {REFACTOR_OPTIONS.map((opt) => {
          const selected = options.includes(opt.value);
          return (
            <Chip
              key={opt.value}
              label={opt.label}
              clickable
              color={selected ? "secondary" : "default"}
              variant={selected ? "filled" : "outlined"}
              onClick={() => {
                const next = selected
                  ? options.filter((o) => o !== opt.value)
                  : [...options, opt.value];
                onOptionsChange(next.length > 0 ? next : ["readability"]);
              }}
            />
          );
        })}
      </Stack>

      <Button
        variant="outlined"
        color="secondary"
        size="large"
        startIcon={<AutoFixHighIcon />}
        onClick={onImprove}
        disabled={loading}
      >
        {loading ? "Improving…" : "Improve Code"}
      </Button>
    </Box>
  );
}
