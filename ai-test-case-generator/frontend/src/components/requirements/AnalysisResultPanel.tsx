import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import { Alert, Box, Button, Grid, Paper, Stack, Typography } from "@mui/material";
import { AnalysisSection } from "./AnalysisSection";
import type { AnalysisResult } from "../../types/requirement";
import { exportAnalysisPdf } from "../../utils/export";

interface AnalysisResultPanelProps {
  analysis: AnalysisResult;
  analyzedAt?: string;
  requirementTitle?: string;
  projectName?: string;
  showExport?: boolean;
}

export function AnalysisResultPanel({
  analysis,
  analyzedAt,
  requirementTitle,
  projectName,
  showExport = false,
}: AnalysisResultPanelProps) {
  const handleExportPdf = () => {
    if (!requirementTitle) return;
    exportAnalysisPdf(
      analysis,
      { requirementTitle, projectName, analyzedAt },
      `${requirementTitle.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-analysis.pdf`,
    );
  };

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        sx={{ mb: 2 }}
        spacing={1}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>Analysis Results</Typography>
          {analyzedAt ? (
            <Typography variant="caption" color="text.secondary">
              Last analyzed {new Date(analyzedAt).toLocaleString()}
            </Typography>
          ) : null}
        </Box>
        {showExport && requirementTitle ? (
          <Button
            variant="outlined"
            startIcon={<PictureAsPdfOutlinedIcon />}
            onClick={handleExportPdf}
          >
            Export PDF
          </Button>
        ) : null}
      </Stack>

      <Paper sx={{ p: 2.5, mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={700} gutterBottom>Summary</Typography>
        <Typography variant="body2" color="text.secondary">{analysis.summary}</Typography>
      </Paper>

      {(analysis.ambiguities.length > 0 || analysis.missingInformation.length > 0) && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Review ambiguities and missing information before generating test cases. The analyzer
          does not invent requirements that were not present in your input.
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <AnalysisSection title="Actors" items={analysis.actors} />
        </Grid>
        <Grid item xs={12} md={6}>
          <AnalysisSection title="Preconditions" items={analysis.preconditions} />
        </Grid>
        <Grid item xs={12} md={6}>
          <AnalysisSection title="Business Rules" items={analysis.businessRules} />
        </Grid>
        <Grid item xs={12} md={6}>
          <AnalysisSection title="Functional Requirements" items={analysis.functionalRequirements} />
        </Grid>
        <Grid item xs={12} md={6}>
          <AnalysisSection
            title="Non-functional Requirements"
            items={analysis.nonFunctionalRequirements}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <AnalysisSection title="Assumptions" items={analysis.assumptions} />
        </Grid>
        <Grid item xs={12} md={6}>
          <AnalysisSection
            title="Ambiguities"
            items={analysis.ambiguities}
            highlight="warning"
            emptyMessage="No ambiguities detected"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <AnalysisSection
            title="Missing Information"
            items={analysis.missingInformation}
            highlight="error"
            emptyMessage="No missing information flagged"
          />
        </Grid>
        <Grid item xs={12}>
          <AnalysisSection title="Risk Areas" items={analysis.riskAreas} />
        </Grid>
      </Grid>
    </Box>
  );
}
