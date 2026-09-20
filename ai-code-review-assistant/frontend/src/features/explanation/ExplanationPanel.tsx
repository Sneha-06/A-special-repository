import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import FunctionsOutlinedIcon from "@mui/icons-material/FunctionsOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Box, Card, CardContent,
  Chip, List, ListItem, ListItemText, Stack, Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { CodeExplanation } from "../../types/explanation";

export function ExplanationPanel({ explanation }: { explanation: CodeExplanation }) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>Code Explanation</Typography>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <InfoOutlinedIcon color="primary" fontSize="small" />
            <Typography variant="subtitle1" fontWeight={600}>Overview</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">{explanation.summary}</Typography>
        </CardContent>
      </Card>

      <Accordion defaultExpanded disableGutters sx={{ mb: 1, "&:before": { display: "none" } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>How it works</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary" paragraph>
            <strong>Purpose:</strong> {explanation.purpose}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Architecture:</strong> {explanation.architecture}
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion disableGutters sx={{ mb: 1, "&:before": { display: "none" } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <AccountTreeOutlinedIcon fontSize="small" />
            <Typography fontWeight={600}>Execution flow ({explanation.flow.length})</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <List dense disablePadding>
            {explanation.flow.map((step) => (
              <ListItem key={step.step} alignItems="flex-start" sx={{ px: 0 }}>
                <Chip size="small" label={step.step} sx={{ mr: 1.5, mt: 0.25 }} />
                <ListItemText
                  primary={step.title}
                  secondary={step.description}
                  primaryTypographyProps={{ fontWeight: 600, variant: "body2" }}
                  secondaryTypographyProps={{ variant: "body2" }}
                />
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

      <Accordion disableGutters sx={{ mb: 1, "&:before": { display: "none" } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <FunctionsOutlinedIcon fontSize="small" />
            <Typography fontWeight={600}>Important functions ({explanation.keyFunctions.length})</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          {explanation.keyFunctions.map((fn) => (
            <Box key={fn.name} sx={{ mb: 2, p: 1.5, bgcolor: "grey.50", borderRadius: 2 }}>
              <Typography variant="subtitle2" fontFamily="monospace">{fn.name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{fn.description}</Typography>
              {fn.parameters.length > 0 && (
                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                  Params: {fn.parameters.join(", ")}
                </Typography>
              )}
              {fn.returns && (
                <Typography variant="caption" display="block">Returns: {fn.returns}</Typography>
              )}
            </Box>
          ))}
        </AccordionDetails>
      </Accordion>

      <Accordion disableGutters sx={{ mb: 1, "&:before": { display: "none" } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <LinkOutlinedIcon fontSize="small" />
            <Typography fontWeight={600}>Dependencies ({explanation.dependencies.length})</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {explanation.dependencies.map((dep) => (
              <Chip key={dep} label={dep} size="small" variant="outlined" />
            ))}
          </Stack>
        </AccordionDetails>
      </Accordion>

      {explanation.potentialIssues.length > 0 && (
        <Accordion disableGutters sx={{ mb: 1, "&:before": { display: "none" } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" spacing={1} alignItems="center">
              <WarningAmberOutlinedIcon fontSize="small" color="warning" />
              <Typography fontWeight={600}>Potential concerns ({explanation.potentialIssues.length})</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            {explanation.potentialIssues.map((issue) => (
              <Alert
                key={issue.title}
                severity={issue.severity === "high" ? "error" : issue.severity === "medium" ? "warning" : "info"}
                sx={{ mb: 1 }}
              >
                <Typography variant="subtitle2">{issue.title}</Typography>
                <Typography variant="body2">{issue.description}</Typography>
              </Alert>
            ))}
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
}
