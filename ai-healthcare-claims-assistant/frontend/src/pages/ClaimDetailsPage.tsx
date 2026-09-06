import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Drawer,
  Grid,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Link as RouterLink, useParams, useSearchParams } from "react-router-dom";
import { AiResponseCard } from "../components/AiResponseCard";
import { ErrorState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { StatusChip } from "../components/StatusChip";
import { useAppDispatch, useAppSelector } from "../hooks";
import { loadClaim, runClaimAnalysis } from "../store/slices/claimsSlice";
import { useToast } from "../components/ToastProvider";

export function ClaimDetailsPage() {
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const claim = useAppSelector((state) => state.claims.selected);
  const analysis = useAppSelector((state) => state.claims.analysis);
  const [simple, setSimple] = useState(false);
  const [openAsk, setOpenAsk] = useState(false);

  useEffect(() => {
    void dispatch(loadClaim(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (params.get("analyze") === "1" && id) {
      void dispatch(runClaimAnalysis(id));
    }
  }, [dispatch, id, params]);

  if (!claim) {
    return <ErrorState message="Loading claim…" />;
  }

  return (
    <>
      <PageHeader
        title={claim.claimId}
        subtitle={`${claim.serviceName} · ${claim.member.name}`}
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Claims", to: "/claims" },
          { label: claim.claimId },
        ]}
        actions={
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              variant="contained"
              onClick={() => {
                void dispatch(runClaimAnalysis(id))
                  .unwrap()
                  .then(() => toast.notify("AI analysis complete", "success"))
                  .catch(() => toast.notify("Analysis failed", "error"));
              }}
            >
              Analyze with AI
            </Button>
            <Button variant="outlined" onClick={() => setOpenAsk(true)}>
              Ask AI
            </Button>
            {claim.applicableRule ? (
              <Button component={RouterLink} to={`/rules/compare?left=${claim.applicableRule.ruleId}&right=MR-305`}>
                Compare with another rule
              </Button>
            ) : null}
          </Stack>
        }
      />
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            {[
              {
                title: "Claim information",
                rows: [
                  ["Claim ID", claim.claimId],
                  ["Status", claim.status],
                  ["Submitted amount", `$${claim.submittedAmount.toFixed(2)}`],
                  ["Approved amount", `$${claim.approvedAmount.toFixed(2)}`],
                  ["Rejection reason", claim.rejectionReason ?? "—"],
                ],
              },
              {
                title: "Member information",
                rows: [
                  ["Member ID", claim.member.memberId],
                  ["Name", claim.member.name],
                  ["Plan", claim.member.planName],
                  ["Eligibility", claim.member.eligibilityStatus],
                  ["Group", claim.member.groupNumber],
                ],
              },
              {
                title: "Provider information",
                rows: [
                  ["Provider", claim.provider.name],
                  ["Provider ID", claim.provider.providerId],
                  ["NPI", claim.provider.npi],
                  ["Specialty", claim.provider.specialty],
                  ["Network", claim.provider.networkStatus],
                ],
              },
              {
                title: "Service information",
                rows: [
                  ["Service", claim.serviceName],
                  ["Code", claim.serviceCode],
                  ["Date of service", new Date(claim.serviceDate).toLocaleDateString()],
                  ["Applicable rule", claim.applicableRule?.ruleId ?? "—"],
                ],
              },
            ].map((section) => (
              <Grid key={section.title} item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      {section.title}
                    </Typography>
                    {section.rows.map(([label, value]) => (
                      <Typography key={label} variant="body2" sx={{ mb: 0.5 }}>
                        <strong>{label}:</strong> {value}
                      </Typography>
                    ))}
                    {section.title === "Claim information" ? <StatusChip status={claim.status} /> : null}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Processing timeline
              </Typography>
              <Stepper alternativeLabel>
                {(claim.timeline ?? []).map((event) => (
                  <Step key={event.label} completed={event.state === "complete"} active={event.state === "current"}>
                    <StepLabel>
                      {event.label}
                      <Typography variant="caption" display="block">
                        {event.at ? new Date(event.at).toLocaleDateString() : "—"}
                      </Typography>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          {analysis ? (
            <Stack spacing={1}>
              <AiResponseCard response={analysis} simple={simple} />
              <Button onClick={() => setSimple((value) => !value)}>
                {simple ? "Show analyst explanation" : "Explain simply"}
              </Button>
            </Stack>
          ) : (
            <Card>
              <CardContent>
                <Typography variant="subtitle1">AI claim analysis</Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  Run Analyze with AI to see why this claim was approved or rejected, the triggered rule, and next
                  actions.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
      <Drawer anchor="right" open={openAsk} onClose={() => setOpenAsk(false)}>
        <Box sx={{ width: 360, p: 3 }} role="dialog" aria-label="Ask AI">
          <Typography variant="h6">Ask AI about this claim</Typography>
          <Typography color="text.secondary" sx={{ my: 2 }}>
            Continue in the copilot with this claim already in context.
          </Typography>
          <Button
            component={RouterLink}
            to={`/assistant?q=${encodeURIComponent(`Why was claim ${claim.claimId} ${claim.status.toLowerCase()}?`)}`}
            variant="contained"
          >
            Open copilot
          </Button>
          {claim.applicableRule ? (
            <Chip sx={{ mt: 2 }} label={`Rule ${claim.applicableRule.ruleId}`} />
          ) : null}
        </Box>
      </Drawer>
    </>
  );
}
