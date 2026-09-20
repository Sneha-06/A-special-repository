import AutoFixHighOutlinedIcon from "@mui/icons-material/AutoFixHighOutlined";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import Grid from "@mui/material/Grid2";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { CoverageSectionList, RecommendedTestCasesList } from "../components/coverage/CoverageSectionList";
import { CoverageSummaryCard } from "../components/coverage/CoverageSummaryCard";
import { TraceabilityMatrix } from "../components/coverage/TraceabilityMatrix";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorState } from "../components/common/ErrorState";
import { getErrorMessage } from "../services/api";
import { analyzeCoverage } from "../services/coverageService";
import { fetchProjects } from "../services/projectService";
import type { CoverageAnalysisResult } from "../types/coverage";
import type { ProjectSummary } from "../types/requirement";

export function CoveragePage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CoverageAnalysisResult | null>(null);
  const [selectedRequirementId, setSelectedRequirementId] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    setLoadingProjects(true);
    setError(null);
    try {
      const data = await fetchProjects();
      setProjects(data);
      setSelectedProjectId((current) => current || data[0]?.id || "");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProjects();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadProjects]);

  const handleAnalyze = async () => {
    if (!selectedProjectId) return;
    setAnalyzing(true);
    setError(null);
    setSelectedRequirementId(null);
    try {
      const analysis = await analyzeCoverage(selectedProjectId);
      setResult(analysis);
    } catch (err) {
      setResult(null);
      setError(getErrorMessage(err));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRequirementSelect = (requirementId: string | null) => {
    setSelectedRequirementId(requirementId);
  };

  const selectedRequirementTestCases = result?.traceability.filter(
    (row) => row.requirementId === selectedRequirementId && row.testCaseId,
  );

  return (
    <>
      <PageHeader
        title="Coverage"
        subtitle="AI-powered test coverage analysis with requirement traceability."
        crumbs={[{ label: "Home", to: "/" }, { label: "Coverage" }]}
        actions={
          <Button
            variant="contained"
            startIcon={analyzing ? <CircularProgress size={18} color="inherit" /> : <AutoFixHighOutlinedIcon />}
            disabled={analyzing || !selectedProjectId || loadingProjects}
            onClick={handleAnalyze}
          >
            {analyzing ? "Analyzing..." : "Analyze Coverage"}
          </Button>
        }
      />

      <Stack spacing={3}>
        <Box sx={{ maxWidth: 360 }}>
          <FormControl fullWidth disabled={loadingProjects || analyzing}>
            <InputLabel id="project-select">Project</InputLabel>
            <Select
              labelId="project-select"
              label="Project"
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setResult(null);
                setSelectedRequirementId(null);
              }}
            >
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>{project.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {error ? <ErrorState message={error} onRetry={result ? handleAnalyze : loadProjects} /> : null}

        {analyzing ? (
          <Alert severity="info" icon={<CircularProgress size={18} />}>
            Analyzing requirements, acceptance criteria, and test cases via OpenAI...
          </Alert>
        ) : null}

        {!result && !analyzing && !error ? (
          <EmptyState
            title="No coverage analysis yet"
            description="Select a project and run Analyze Coverage to see gaps, recommendations, and the traceability matrix."
            action={
              <Button variant="contained" onClick={handleAnalyze} disabled={!selectedProjectId}>
                Analyze Coverage
              </Button>
            }
          />
        ) : null}

        {result ? (
          <>
            <CoverageSummaryCard
              coverageScore={result.coverageScore}
              summary={result.summary}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <CoverageSectionList
                  title="Covered Requirements"
                  items={result.coveredRequirements.map(
                    (req) =>
                      `${req.title} (${req.testCaseCount} tests, ${req.acceptanceCriteriaCount} ACs)`,
                  )}
                  emptyMessage="No fully covered requirements."
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CoverageSectionList
                  title="Missing Coverage"
                  items={result.missingCoverage.map((item) => `${item.title}: ${item.reason}`)}
                  emptyMessage="All requirements are adequately covered."
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CoverageSectionList
                  title="Covered Areas"
                  items={result.coveredAreas}
                  emptyMessage="No covered areas identified."
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CoverageSectionList
                  title="Missing Areas"
                  items={result.missingAreas}
                  emptyMessage="No missing areas identified."
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <RecommendedTestCasesList
                  title="Recommended Test Cases"
                  items={result.recommendedTestCases}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <CoverageSectionList title="Security Gaps" items={result.securityGaps} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <CoverageSectionList title="Edge Case Gaps" items={result.edgeCaseGaps} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <CoverageSectionList title="Regression Gaps" items={result.regressionGaps} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <CoverageSectionList
                  title="Recommendations"
                  items={result.recommendations}
                  emptyMessage="No additional recommendations."
                />
              </Grid>
            </Grid>

            <TraceabilityMatrix
              rows={result.traceability}
              selectedRequirementId={selectedRequirementId}
              onSelectRequirement={handleRequirementSelect}
            />

            {selectedRequirementId && selectedRequirementTestCases && selectedRequirementTestCases.length > 0 ? (
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Associated Test Cases
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {selectedRequirementTestCases.map((row) => (
                    <Button
                      key={row.testCaseId}
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/test-cases?requirementId=${row.requirementId}`)}
                    >
                      {row.testCaseId}: {row.testCaseTitle}
                    </Button>
                  ))}
                </Stack>
              </Box>
            ) : null}
          </>
        ) : null}
      </Stack>
    </>
  );
}
