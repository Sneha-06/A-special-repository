import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import { Box, Typography } from "@mui/material";

interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <Box sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
      <InboxOutlinedIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
      <Typography variant="h6" color="text.primary">{title}</Typography>
      {description && <Typography variant="body2" sx={{ mt: 1 }}>{description}</Typography>}
    </Box>
  );
}
