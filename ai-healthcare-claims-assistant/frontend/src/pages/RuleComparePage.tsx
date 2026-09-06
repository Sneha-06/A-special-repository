import { Alert, Button, Grid, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AiResponseCard } from "../components/AiResponseCard";
import { PageHeader } from "../components/PageHeader";
import { fetchRules, compareRules } from "../services/ruleService";
import { getErrorMessage } from "../services/api";
import type { AiResponse, Rule } from "../types";
import { useToast } from "../components/ToastProvider";

export function RuleComparePage() {
  const [params] = useSearchParams();
  const toast = useToast();
  const [options, setOptions] = useState<Rule[]>([]);
  const [left, setLeft] = useState(params.get("left") ?? "MR-204");
  const [right, setRight] = useState(params.get("right") ?? "MR-305");
  const [result, setResult] = useState<{
    left: Rule;
    right: Rule;
    differences: Array<{ field: string; left: string; right: string; differs: boolean }>;
    aiSummary: AiResponse;
    provider: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchRules({ pageSize: 50 }).then((data) => setOptions(data.items));
  }, []);

  const run = () => {
    setError(null);
    compareRules(left, right)
      .then(setResult)
      .catch((err) => {
        const message = getErrorMessage(err);
        setError(message);
        toast.notify(message, "error");
      });
  };

  useEffect(() => {
    if (left && right) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <PageHeader
        title="Rule comparison"
        subtitle="Side-by-side mandate review with an AI summary"
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Rules", to: "/rules" },
          { label: "Compare" },
        ]}
      />
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField select label="Left rule" value={left} onChange={(event) => setLeft(event.target.value)} fullWidth>
            {options.map((rule) => (
              <MenuItem key={rule.ruleId} value={rule.ruleId}>
                {rule.ruleId} — {rule.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="Right rule" value={right} onChange={(event) => setRight(event.target.value)} fullWidth>
            {options.map((rule) => (
              <MenuItem key={rule.ruleId} value={rule.ruleId}>
                {rule.ruleId} — {rule.name}
              </MenuItem>
            ))}
          </TextField>
          <Button variant="contained" onClick={run}>
            Compare
          </Button>
        </Stack>
      </Paper>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {result ? (
        <>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {[result.left, result.right].map((rule) => (
              <Grid key={rule.ruleId} item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6">
                    {rule.ruleId} · {rule.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Effective {new Date(rule.effectiveDate).toLocaleDateString()}
                  </Typography>
                </Paper>
              </Grid>
            ))}
            {result.differences.map((row) => (
              <Grid key={row.field} item xs={12}>
                <Paper sx={{ p: 2, bgcolor: row.differs ? "#F8F1E7" : "background.paper" }}>
                  <Typography variant="subtitle2">{row.field}</Typography>
                  <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2">{row.left}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2">{row.right}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}
          </Grid>
          <AiResponseCard response={result.aiSummary} provider={result.provider} />
        </>
      ) : null}
    </>
  );
}
