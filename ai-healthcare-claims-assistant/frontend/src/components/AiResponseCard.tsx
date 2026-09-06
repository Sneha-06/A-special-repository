import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import type { AiResponse } from "../types";
import { AiGeneratedBadge, ConfidenceMeter } from "./ConfidenceMeter";
import { SourceReferences } from "./SourceReferences";

export function AiResponseCard({
  response,
  provider,
  simple,
}: {
  response: AiResponse;
  provider?: string | null;
  simple?: boolean;
}) {
  return (
    <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: "#F8FBFC" }} variant="outlined">
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="subtitle1">AI claim analysis</Typography>
          <AiGeneratedBadge />
        </Stack>
        <ConfidenceMeter value={response.confidence} />
      </Stack>
      {provider ? (
        <Typography variant="caption" color="text.secondary">
          Provider: {provider}
        </Typography>
      ) : null}
      <Typography sx={{ mt: 1.5, whiteSpace: "pre-wrap" }}>
        {simple && response.simpleExplanation ? response.simpleExplanation : response.answer}
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Stack spacing={1.5}>
        {response.claimId ? (
          <Typography variant="body2">
            Relevant claim:{" "}
            <Chip
              size="small"
              component={RouterLink}
              to={`/claims/${response.claimId}`}
              clickable
              label={response.claimId}
            />
          </Typography>
        ) : null}
        {response.ruleId ? (
          <Typography variant="body2">
            Applicable rule:{" "}
            <Chip
              size="small"
              component={RouterLink}
              to={`/rules/${response.ruleId}`}
              clickable
              label={response.ruleId}
            />
          </Typography>
        ) : null}
        {response.triggeredCondition ? (
          <Typography variant="body2">Reason: {response.triggeredCondition}</Typography>
        ) : null}
        <Box>
          <Typography variant="caption" color="text.secondary">
            Source references
          </Typography>
          <SourceReferences sources={response.sources} />
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Recommended action
          </Typography>
          <Stack component="ul" sx={{ m: 0, pl: 2 }}>
            {(response.recommendations.length
              ? response.recommendations
              : [response.recommendedAction].filter(Boolean)
            ).map((item) => (
              <Typography key={item} component="li" variant="body2">
                {item}
              </Typography>
            ))}
          </Stack>
        </Box>
        <Alert severity="info">
          This explanation is generated from synthetic demo data and is not a coverage determination.
        </Alert>
        {response.ruleId ? (
          <Button
            component={RouterLink}
            to={`/rules/${response.ruleId}`}
            size="small"
            variant="text"
          >
            View supporting rule
          </Button>
        ) : null}
      </Stack>
    </Paper>
  );
}
