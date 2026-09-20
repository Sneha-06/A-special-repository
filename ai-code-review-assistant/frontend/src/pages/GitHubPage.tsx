import GitHubIcon from "@mui/icons-material/GitHub";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box, Card, Chip, CircularProgress, InputAdornment, List, ListItem,
  ListItemButton, ListItemText, Stack, TextField, Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorState } from "../components/common/ErrorState";
import { PageHeader } from "../components/common/PageHeader";
import { GitHubAccountCard } from "../features/github/GitHubAccountCard";
import { fetchGitHubStatus, fetchRepositories } from "../services/githubService";
import type { GitHubConnectionStatus, GitHubRepo } from "../types/github";

export function GitHubPage() {
  const [status, setStatus] = useState<GitHubConnectionStatus | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([fetchGitHubStatus(), fetchRepositories()])
      .then(([s, r]) => { setStatus(s); setRepos(r); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return repos;
    return repos.filter((r) =>
      r.full_name.toLowerCase().includes(q) || (r.description?.toLowerCase().includes(q) ?? false),
    );
  }, [repos, search]);

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>;

  return (
    <>
      <PageHeader
        title="GitHub Integration"
        subtitle="Browse repositories, review source files, and analyze pull requests"
      />

      {status && <GitHubAccountCard status={status} />}

      {error && <ErrorState message={error} onRetry={() => window.location.reload()} />}

      {status?.connected && (
        <>
          <TextField
            size="small"
            fullWidth
            placeholder="Search repositories…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
            }}
          />

          {filtered.length === 0 ? (
            <EmptyState title="No repositories found" description="Try a different search or check token permissions." />
          ) : (
            <Card>
              <List>
                {filtered.map((repo) => (
                  <ListItem key={repo.id} disablePadding divider>
                    <ListItemButton onClick={() => navigate(`/github/${repo.full_name}`)}>
                      <GitHubIcon sx={{ mr: 2, color: "text.secondary" }} />
                      <ListItemText
                        primary={repo.full_name}
                        secondary={repo.description ?? "No description"}
                      />
                      <Stack direction="row" spacing={1}>
                        {repo.language && <Chip size="small" label={repo.language} />}
                        {repo.private && <Chip size="small" label="Private" variant="outlined" />}
                        <Chip size="small" label={`★ ${repo.stargazers_count}`} variant="outlined" />
                      </Stack>
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Card>
          )}

          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
            Showing {filtered.length} of {repos.length} repositories
          </Typography>
        </>
      )}
    </>
  );
}
