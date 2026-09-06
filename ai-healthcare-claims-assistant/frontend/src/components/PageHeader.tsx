import { Box, Breadcrumbs, Link, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export function PageHeader({
  title,
  subtitle,
  crumbs,
  actions,
}: {
  title: string;
  subtitle?: string;
  crumbs?: Array<{ label: string; to?: string }>;
  actions?: React.ReactNode;
}) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", md: "center" }}
      spacing={2}
      sx={{ mb: 3 }}
    >
      <Box>
        {crumbs ? (
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 0.75 }}>
            {crumbs.map((crumb) =>
              crumb.to ? (
                <Link key={crumb.label} component={RouterLink} to={crumb.to} underline="hover" color="text.secondary">
                  {crumb.label}
                </Link>
              ) : (
                <Typography key={crumb.label} color="text.secondary" variant="body2">
                  {crumb.label}
                </Typography>
              ),
            )}
          </Breadcrumbs>
        ) : null}
        <Typography variant="h5">{title}</Typography>
        {subtitle ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 640 }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {actions}
    </Stack>
  );
}
