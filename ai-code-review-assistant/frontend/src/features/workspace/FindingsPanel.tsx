import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion, AccordionDetails, AccordionSummary, Box, Chip, Stack, Typography,
} from "@mui/material";
import { SeverityChip } from "../../components/common/SeverityChip";
import type { Finding } from "../../types/analysis";

interface FindingsPanelProps {
  findings: Finding[];
  summary?: string | null;
  explanation?: string | null;
}

export function FindingsPanel({ findings, summary, explanation }: FindingsPanelProps) {
  if (!summary && findings.length === 0 && !explanation) {
    return null;
  }

  return (
    <Box>
      {summary && (
        <Box sx={{ mb: 2, p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Summary</Typography>
          <Typography variant="body2" color="text.secondary">{summary}</Typography>
        </Box>
      )}
      {explanation && (
        <Box sx={{ mb: 2, p: 2, bgcolor: "info.50", borderRadius: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Explanation</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap" }}>{explanation}</Typography>
        </Box>
      )}
      {findings.map((f, i) => (
        <Accordion key={f.id ?? i} disableGutters sx={{ mb: 1, "&:before": { display: "none" } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap", gap: 0.5 }}>
              <SeverityChip severity={f.severity} />
              <Chip size="small" label={f.category} variant="outlined" />
              {f.lineStart && (
                <Chip size="small" label={`L${f.lineStart}${f.lineEnd ? `–${f.lineEnd}` : ""}`} />
              )}
              <Typography variant="body2" fontWeight={600}>{f.title}</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{f.description}</Typography>
            {f.suggestion && (
              <Typography variant="body2" sx={{ bgcolor: "success.50", p: 1.5, borderRadius: 1 }}>
                <strong>Suggestion:</strong> {f.suggestion}
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
