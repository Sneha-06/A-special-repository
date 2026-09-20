import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import RateReviewIcon from "@mui/icons-material/RateReview";
import {
  Alert, Box, Button, Card, CardContent, CircularProgress, FormControl,
  Grid, InputLabel, MenuItem, Select, Stack, Tab, Tabs, Typography,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { PageHeader } from "../components/common/PageHeader";
import { FileTree } from "../features/github/FileTree";
import { PrReviewPanel } from "../features/github/PrReviewPanel";
import { ReviewResultsPanel } from "../features/review/ReviewResultsPanel";
import { CodeEditor } from "../features/workspace/CodeEditor";
import {
  fetchBranches, fetchFile, fetchPullRequests, reviewFile, reviewPullRequest,
} from "../services/githubService";
import type { GitHubBranch, GitHubPullRequest, PrReviewResponse } from "../types/github";
import { languageFromPath } from "../types/github";
import type { CodeReviewResult } from "../types/review";

export function RepoExplorerPage() {
  const { owner, repo } = useParams<{ owner: string; repo: string }>();
  const fullName = `${owner}/${repo}`;

  const [tab, setTab] = useState(0);
  const [branches, setBranches] = useState<GitHubBranch[]>([]);
  const [branch, setBranch] = useState("");
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [fileLoading, setFileLoading] = useState(false);
  const [reviewResult, setReviewResult] = useState<CodeReviewResult | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [pulls, setPulls] = useState<GitHubPullRequest[]>([]);
  const [prReview, setPrReview] = useState<PrReviewResponse | null>(null);
  const [reviewingPr, setReviewingPr] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  useEffect(() => {
    if (!owner || !repo) return;
    fetchBranches(owner, repo)
      .then((b) => {
        setBranches(b);
        if (b.length > 0) setBranch(b[0].name);
      })
      .catch((e) => setError(e.message));
  }, [owner, repo]);

  useEffect(() => {
    if (!owner || !repo || tab !== 1) return;
    fetchPullRequests(owner, repo)
      .then(setPulls)
      .catch((e) => setError(e.message));
  }, [owner, repo, tab]);

  const handleSelectFile = async (path: string) => {
    if (!owner || !repo) return;
    setSelectedPath(path);
    setReviewResult(null);
    setFileLoading(true);
    setError(null);
    try {
      const file = await fetchFile(owner, repo, path, branch);
      setFileContent(file.content);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load file");
      setFileContent("");
    } finally {
      setFileLoading(false);
    }
  };

  const handleReviewFile = async () => {
    if (!owner || !repo || !selectedPath) return;
    setReviewLoading(true);
    setError(null);
    try {
      const { review } = await reviewFile(owner, repo, selectedPath, branch);
      setReviewResult(review);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Review failed");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleReviewPr = async (number: number) => {
    if (!owner || !repo) return;
    setReviewingPr(number);
    setError(null);
    try {
      const result = await reviewPullRequest(owner, repo, number);
      setPrReview(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "PR review failed");
    } finally {
      setReviewingPr(null);
    }
  };

  const prColumns: GridColDef<GitHubPullRequest>[] = [
    { field: "number", headerName: "#", width: 70 },
    { field: "title", headerName: "Title", flex: 1, minWidth: 200 },
    { field: "user", headerName: "Author", width: 120, valueGetter: (_, row) => row.user.login },
    { field: "additions", headerName: "+", width: 60 },
    { field: "deletions", headerName: "-", width: 60 },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <Button
          size="small"
          variant="contained"
          startIcon={reviewingPr === params.row.number ? <CircularProgress size={14} color="inherit" /> : <AutoFixHighIcon />}
          disabled={reviewingPr !== null}
          onClick={() => handleReviewPr(params.row.number)}
        >
          AI Review PR
        </Button>
      ),
    },
  ];

  return (
    <>
      <Button component={RouterLink} to="/github" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
        Back to repositories
      </Button>

      <PageHeader title={fullName} subtitle="Browse files and review code from GitHub" />

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Files" />
        <Tab label="Pull Requests" />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Branch</InputLabel>
                  <Select value={branch} label="Branch" onChange={(e) => { setBranch(e.target.value); setSelectedPath(null); setFileContent(""); }}>
                    {branches.map((b) => <MenuItem key={b.name} value={b.name}>{b.name}</MenuItem>)}
                  </Select>
                </FormControl>
                <Typography variant="subtitle2" gutterBottom>File tree</Typography>
                {branch && owner && repo && (
                  <FileTree
                    owner={owner}
                    repo={repo}
                    branch={branch}
                    selectedPath={selectedPath}
                    onSelectFile={handleSelectFile}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">
                    {selectedPath ?? "Select a source file (.ts, .tsx, .js, .jsx, .py, .java, .go)"}
                  </Typography>
                  {selectedPath && (
                    <Button
                      variant="contained"
                      startIcon={reviewLoading ? <CircularProgress size={16} color="inherit" /> : <RateReviewIcon />}
                      onClick={handleReviewFile}
                      disabled={reviewLoading || fileLoading}
                    >
                      Review This File
                    </Button>
                  )}
                </Stack>

                {fileLoading ? (
                  <Box sx={{ textAlign: "center", py: 8 }}><CircularProgress /></Box>
                ) : selectedPath ? (
                  <CodeEditor
                    value={fileContent}
                    language={languageFromPath(selectedPath)}
                    onChange={() => {}}
                    readOnly
                    height={400}
                  />
                ) : (
                  <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
                    Select a file from the tree to load it into the editor
                  </Typography>
                )}
              </CardContent>
            </Card>

            {reviewResult && (
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <ReviewResultsPanel
                    review={reviewResult}
                    selectedIssueId={selectedIssueId}
                    onSelectIssue={(issue) => setSelectedIssueId(issue.id)}
                    onApplyFix={() => {}}
                  />
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      )}

      {tab === 1 && (
        <>
          <Card sx={{ mb: 2 }}>
            <DataGrid
              rows={pulls}
              columns={prColumns}
              getRowId={(r) => r.id}
              autoHeight
              disableRowSelectionOnClick
              pageSizeOptions={[10]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            />
          </Card>

          {prReview && (
            <PrReviewPanel
              pullRequest={prReview.pullRequest}
              files={prReview.files}
              review={prReview.review}
            />
          )}
        </>
      )}
    </>
  );
}
