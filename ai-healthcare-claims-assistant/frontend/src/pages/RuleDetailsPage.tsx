import { Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { useEffect } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { StatusChip } from "../components/StatusChip";
import { useAppDispatch, useAppSelector } from "../hooks";
import { loadRule } from "../store/slices/rulesSlice";

export function RuleDetailsPage() {
  const { id = "" } = useParams();
  const dispatch = useAppDispatch();
  const rule = useAppSelector((state) => state.rules.selected);

  useEffect(() => {
    void dispatch(loadRule(id));
  }, [dispatch, id]);

  if (!rule) return null;

  return (
    <>
      <PageHeader
        title={`${rule.ruleId} · ${rule.name}`}
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Rules", to: "/rules" },
          { label: rule.ruleId },
        ]}
        actions={
          <Stack direction="row" spacing={1}>
            <Button component={RouterLink} to={`/rules/compare?left=${rule.ruleId}&right=MR-204`} variant="outlined">
              Compare
            </Button>
            <Button
              component={RouterLink}
              to={`/assistant?q=${encodeURIComponent(`What are the eligibility requirements for ${rule.ruleId}?`)}`}
              variant="contained"
            >
              Ask AI about rule
            </Button>
          </Stack>
        }
      />
      <Card>
        <CardContent>
          <StatusChip status={rule.status} />
          <Typography sx={{ mt: 2 }}>{rule.description}</Typography>
          <Typography variant="subtitle2" sx={{ mt: 2 }}>
            Eligibility conditions
          </Typography>
          <Typography>{rule.eligibilityConditions}</Typography>
          <Typography variant="subtitle2" sx={{ mt: 2 }}>
            Authorization requirements
          </Typography>
          <Typography>{rule.authorizationRequirements}</Typography>
          <Typography variant="subtitle2" sx={{ mt: 2 }}>
            Service restrictions
          </Typography>
          <Typography>{rule.serviceRestrictions}</Typography>
          <Typography variant="subtitle2" sx={{ mt: 2 }}>
            Coverage conditions
          </Typography>
          <Typography>{rule.coverageConditions}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Effective {new Date(rule.effectiveDate).toLocaleDateString()} · {rule.category}
          </Typography>
        </CardContent>
      </Card>
    </>
  );
}
