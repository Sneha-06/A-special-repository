import SendIcon from "@mui/icons-material/Send";
import {
  Box,
  Button,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AiResponseCard } from "../components/AiResponseCard";
import { PageHeader } from "../components/PageHeader";
import { useAppDispatch, useAppSelector } from "../hooks";
import { askAssistant, loadConversation, loadConversations, startNewThread } from "../store/slices/assistantSlice";

const prompts = [
  "Why was claim CLM-1024 rejected?",
  "What rule applies to this claim?",
  "What are the eligibility requirements?",
  "Compare Rule MR-204 and MR-305.",
  "Which claims were rejected because of eligibility?",
  "Explain this rejection in simple terms.",
  "What should be reviewed before resubmitting this claim?",
];

export function AssistantPage() {
  const dispatch = useAppDispatch();
  const [params] = useSearchParams();
  const { conversations, messages, activeId, status, lastProvider, error } = useAppSelector(
    (state) => state.assistant,
  );
  const [question, setQuestion] = useState(params.get("q") ?? "");

  useEffect(() => {
    void dispatch(loadConversations());
  }, [dispatch]);

  const submit = (text: string) => {
    if (!text.trim()) return;
    void dispatch(askAssistant({ question: text, conversationId: activeId ?? undefined }));
    setQuestion("");
  };

  return (
    <>
      <PageHeader
        title="Claims copilot"
        subtitle="Ask about a claim, mandate, or document. Answers include sources, confidence, and a recommended next step."
        crumbs={[{ label: "Home", to: "/" }, { label: "AI Copilot" }]}
        actions={
          <Button variant="outlined" onClick={() => dispatch(startNewThread())}>
            New thread
          </Button>
        }
      />
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="stretch">
        <Paper sx={{ width: { md: 280 }, p: 1.5, borderRadius: 3 }}>
          <Typography variant="subtitle2" sx={{ px: 1, py: 1 }} color="text.secondary">
            Recent threads
          </Typography>
          <List dense>
            {conversations.map((item) => (
              <ListItemButton
                key={item.id}
                selected={item.id === activeId}
                onClick={() => void dispatch(loadConversation(item.id))}
                sx={{ borderRadius: 2, mb: 0.5 }}
              >
                <ListItemText
                  primary={item.title}
                  secondary={new Date(item.updatedAt).toLocaleString()}
                  primaryTypographyProps={{ noWrap: true, fontSize: 13, fontWeight: 600 }}
                />
              </ListItemButton>
            ))}
          </List>
        </Paper>
        <Paper sx={{ flex: 1, p: 2.5, display: "flex", flexDirection: "column", minHeight: 560, borderRadius: 3 }}>
          <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 2 }}>
            {prompts.map((prompt) => (
              <Button key={prompt} size="small" variant="outlined" onClick={() => submit(prompt)} sx={{ borderRadius: 5 }}>
                {prompt}
              </Button>
            ))}
          </Stack>
          <Box sx={{ flex: 1, overflow: "auto", pr: 1 }}>
            {messages.length === 0 ? (
              <Box sx={{ py: 10, textAlign: "center", px: 2 }}>
                <Typography variant="h6">Start with a claim ID or a rule</Typography>
                <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 480, mx: "auto" }}>
                  Try “Why was claim CLM-1024 rejected?” The copilot retrieves claims, rules, and documents before it
                  answers.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {messages.map((message, index) =>
                  message.role === "user" ? (
                    <Paper
                      key={message.id ?? `u-${index}`}
                      sx={{
                        p: 1.75,
                        bgcolor: "#146072",
                        color: "white",
                        alignSelf: "flex-end",
                        maxWidth: "80%",
                        border: "none",
                      }}
                    >
                      <Typography>{message.content}</Typography>
                    </Paper>
                  ) : message.structured ? (
                    <AiResponseCard
                      key={message.id ?? `a-${index}`}
                      response={message.structured}
                      provider={lastProvider}
                    />
                  ) : (
                    <Paper key={message.id ?? `a-${index}`} sx={{ p: 1.75, maxWidth: "90%" }}>
                      <Typography>{message.content}</Typography>
                    </Paper>
                  ),
                )}
                {status === "loading" ? <Typography color="text.secondary">Retrieving context…</Typography> : null}
                {error ? <Typography color="error">{error}</Typography> : null}
              </Stack>
            )}
          </Box>
          <Box
            component="form"
            onSubmit={(event) => {
              event.preventDefault();
              submit(question);
            }}
            sx={{
              mt: 2,
              p: 1,
              borderRadius: 3,
              bgcolor: "#F7FAFB",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                fullWidth
                variant="standard"
                placeholder="Ask about a claim ID, mandate, or rejection pattern"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                inputProps={{ "aria-label": "Copilot question" }}
                InputProps={{ disableUnderline: true }}
                sx={{ px: 1 }}
              />
              <Button type="submit" variant="contained" endIcon={<SendIcon />} disabled={status === "loading"}>
                Send
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Stack>
    </>
  );
}
