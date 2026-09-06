import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Box, Button, Paper, Typography } from "@mui/material";

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Paper sx={{ p: 5, textAlign: "center", borderRadius: 3 }}>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 3,
          bgcolor: "#E8F1F3",
          color: "primary.main",
          display: "grid",
          placeItems: "center",
          mx: "auto",
          mb: 2,
        }}
      >
        <InboxOutlinedIcon />
      </Box>
      <Typography variant="h6">{title}</Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 2, maxWidth: 420, mx: "auto" }}>
        {description}
      </Typography>
      {actionLabel && onAction ? (
        <Button variant="contained" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </Paper>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <Paper sx={{ p: 3, borderColor: "error.light", borderRadius: 3 }}>
      <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
        <ErrorOutlineIcon color="error" />
        <Box>
          <Typography color="error" fontWeight={600}>
            We could not complete that request
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {message}
          </Typography>
          {onRetry ? (
            <Button variant="outlined" onClick={onRetry} sx={{ mt: 2 }}>
              Retry
            </Button>
          ) : null}
        </Box>
      </Box>
    </Paper>
  );
}
