import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Alert, Box, Button, Typography } from "@mui/material";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Box sx={{ textAlign: "center", py: 6 }}>
      <ErrorOutlineIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
      <Typography variant="h6" gutterBottom>Something went wrong</Typography>
      <Alert severity="error" sx={{ maxWidth: 480, mx: "auto", mb: 2 }}>{message}</Alert>
      {onRetry && <Button variant="outlined" onClick={onRetry}>Try again</Button>}
    </Box>
  );
}
