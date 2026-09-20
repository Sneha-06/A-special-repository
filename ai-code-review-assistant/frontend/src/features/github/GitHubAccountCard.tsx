import GitHubIcon from "@mui/icons-material/GitHub";
import { Alert, Avatar, Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import type { GitHubConnectionStatus } from "../../types/github";

export function GitHubAccountCard({ status }: { status: GitHubConnectionStatus }) {
  if (!status.connected || !status.user) {
    return (
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>GitHub not connected</Typography>
        <Typography variant="body2">
          Ask your administrator to configure <code>GITHUB_TOKEN</code> on the server.
          Tokens are never exposed to the browser.
        </Typography>
        {status.error && (
          <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
            {status.error}
          </Typography>
        )}
      </Alert>
    );
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar src={status.user.avatarUrl} alt={status.user.login}>
            <GitHubIcon />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {status.user.name ?? status.user.login}
            </Typography>
            <Typography variant="body2" color="text.secondary">@{status.user.login}</Typography>
          </Box>
          <Chip icon={<GitHubIcon />} label="Connected" color="success" size="small" />
        </Stack>
      </CardContent>
    </Card>
  );
}
