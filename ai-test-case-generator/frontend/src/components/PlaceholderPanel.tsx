import { Box, Paper, Typography } from "@mui/material";

export function PlaceholderPanel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <Typography color="text.secondary">{description}</Typography>
      <Box
        sx={{
          mt: 3,
          p: 3,
          borderRadius: 2,
          border: "1px dashed",
          borderColor: "divider",
          bgcolor: "#F8FAFC",
          textAlign: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Module scaffold — functionality will be implemented in the next phase.
        </Typography>
      </Box>
    </Paper>
  );
}
