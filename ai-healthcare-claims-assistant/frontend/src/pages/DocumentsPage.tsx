import {
  Button,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { AiGeneratedBadge } from "../components/ConfidenceMeter";
import { fetchDocuments, uploadDocument } from "../services/documentService";
import { getErrorMessage } from "../services/api";
import { useToast } from "../components/ToastProvider";

interface AnalyzedDocument {
  id: string;
  originalName: string;
  summary: string;
  keyRules: string[];
  eligibilityConditions: string[];
  importantChanges: string[];
  insights: string[];
  chunkCount: number;
}

export function DocumentsPage() {
  const toast = useToast();
  const [items, setItems] = useState<Array<{ id: string; originalName: string; summary: string | null; _count: { chunks: number } }>>(
    [],
  );
  const [current, setCurrent] = useState<AnalyzedDocument | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void fetchDocuments().then(setItems);
  }, []);

  return (
    <>
      <PageHeader
        title="Document analyzer"
        subtitle="Upload synthetic mandate PDFs or text files. Content is chunked and indexed for RAG."
        crumbs={[{ label: "Home", to: "/" }, { label: "Documents" }]}
      />
      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography gutterBottom>Upload a .txt or .pdf mandate (demo only)</Typography>
        <Button variant="contained" component="label" disabled={busy}>
          {busy ? "Analyzing…" : "Select file"}
          <input
            hidden
            type="file"
            accept=".txt,.pdf,.md,text/plain,application/pdf"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setBusy(true);
              try {
                const result = await uploadDocument(file);
                setCurrent(result.document);
                const docs = await fetchDocuments();
                setItems(docs);
                toast.notify("Document indexed for search", "success");
              } catch (error) {
                toast.notify(getErrorMessage(error), "error");
              } finally {
                setBusy(false);
              }
            }}
          />
        </Button>
      </Paper>
      {current ? (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="h6">Document summary</Typography>
                  <AiGeneratedBadge />
                </Stack>
                <Typography sx={{ mt: 1 }}>{current.summary}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {current.chunkCount} searchable chunks
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          {[
            ["Key rules", current.keyRules],
            ["Eligibility conditions", current.eligibilityConditions],
            ["Important changes", current.importantChanges],
            ["AI insights", current.insights],
          ].map(([title, values]) => (
            <Grid key={String(title)} item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{String(title)}</Typography>
                  <List dense>
                    {(values as string[]).map((item) => (
                      <ListItem key={item}>
                        <ListItemText primary={item} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : null}
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1">Indexed documents</Typography>
        <List>
          {items.map((item) => (
            <ListItem key={item.id}>
              <ListItemText
                primary={item.originalName}
                secondary={`${item._count.chunks} chunks · ${item.summary ?? "No summary"}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </>
  );
}
