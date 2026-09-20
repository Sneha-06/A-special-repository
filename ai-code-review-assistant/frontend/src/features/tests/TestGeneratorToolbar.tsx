import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import { Box, Button, Chip, FormControl, InputLabel, MenuItem, Select, Stack } from "@mui/material";
import { TESTING_FRAMEWORKS, type TestingFramework } from "../../types/testGenerator";

interface TestGeneratorToolbarProps {
  testingFramework: TestingFramework;
  loading: boolean;
  onFrameworkChange: (fw: TestingFramework) => void;
  onGenerate: () => void;
}

export function TestGeneratorToolbar({
  testingFramework, loading, onFrameworkChange, onGenerate,
}: TestGeneratorToolbarProps) {
  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Testing framework</InputLabel>
          <Select
            value={testingFramework}
            label="Testing framework"
            onChange={(e) => onFrameworkChange(e.target.value as TestingFramework)}
          >
            {TESTING_FRAMEWORKS.map((f) => (
              <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Stack direction="row" flexWrap="wrap" gap={0.5}>
          {["Happy path", "Edge cases", "Errors", "Async"].map((label) => (
            <Chip key={label} size="small" label={label} variant="outlined" />
          ))}
        </Stack>

        <Button
          variant="outlined"
          color="success"
          startIcon={<ScienceOutlinedIcon />}
          onClick={onGenerate}
          disabled={loading}
        >
          {loading ? "Generating…" : "Generate Tests"}
        </Button>
      </Stack>
    </Box>
  );
}
