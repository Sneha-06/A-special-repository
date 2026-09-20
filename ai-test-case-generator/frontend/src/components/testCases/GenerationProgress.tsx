import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { Box, LinearProgress, Stack, Typography } from "@mui/material";
import type { GenerationStage } from "../../types/testCase";

const STAGES: Array<{ stage: GenerationStage; label: string }> = [
  { stage: "analyzing_requirement", label: "Analyzing requirement..." },
  { stage: "identifying_scenarios", label: "Identifying scenarios..." },
  { stage: "generating_test_cases", label: "Generating test cases..." },
  { stage: "finalizing", label: "Finalizing test suite..." },
];

interface GenerationProgressProps {
  activeStage: GenerationStage | null;
  currentMessage?: string;
}

function stageIndex(stage: GenerationStage | null) {
  if (!stage) return -1;
  return STAGES.findIndex((item) => item.stage === stage);
}

export function GenerationProgress({ activeStage, currentMessage }: GenerationProgressProps) {
  const activeIndex = stageIndex(activeStage);
  const progress = activeIndex < 0 ? 0 : ((activeIndex + 1) / STAGES.length) * 100;

  return (
    <Box sx={{ py: 1 }}>
      <LinearProgress variant="determinate" value={progress} sx={{ mb: 2, borderRadius: 1 }} />
      <Stack spacing={1}>
        {STAGES.map((item, index) => {
          const completed = activeIndex > index;
          const active = activeIndex === index;
          return (
            <Stack key={item.stage} direction="row" spacing={1} alignItems="center">
              {completed ? (
                <CheckCircleOutlineIcon color="success" fontSize="small" />
              ) : (
                <RadioButtonUncheckedIcon
                  fontSize="small"
                  color={active ? "primary" : "disabled"}
                />
              )}
              <Typography
                variant="body2"
                color={active ? "primary" : completed ? "text.primary" : "text.secondary"}
                fontWeight={active ? 600 : 400}
              >
                {active && currentMessage ? currentMessage : item.label}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
}
