import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchConversation, fetchConversations, sendChat } from "../../services/aiService";
import type { AiResponse } from "../../types";

export interface ChatTurn {
  id?: string;
  role: "user" | "assistant";
  content: string;
  structured?: AiResponse | null;
}

interface AssistantState {
  conversations: Array<{ id: string; title: string; updatedAt: string }>;
  activeId: string | null;
  messages: ChatTurn[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  lastProvider: string | null;
}

const initialState: AssistantState = {
  conversations: [],
  activeId: null,
  messages: [],
  status: "idle",
  error: null,
  lastProvider: null,
};

export const loadConversations = createAsyncThunk("assistant/list", async () =>
  fetchConversations(),
);

export const loadConversation = createAsyncThunk("assistant/one", async (id: string) =>
  fetchConversation(id),
);

export const askAssistant = createAsyncThunk(
  "assistant/ask",
  async (payload: { question: string; conversationId?: string }) => sendChat(payload.question, payload.conversationId),
);

const assistantSlice = createSlice({
  name: "assistant",
  initialState,
  reducers: {
    startNewThread(state) {
      state.activeId = null;
      state.messages = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadConversations.fulfilled, (state, action) => {
        state.conversations = action.payload.map((item) => ({
          id: item.id,
          title: item.title,
          updatedAt: item.updatedAt,
        }));
      })
      .addCase(loadConversation.fulfilled, (state, action) => {
        state.activeId = action.payload.id;
        state.messages = action.payload.messages.map((message) => ({
          id: message.id,
          role: message.role as "user" | "assistant",
          content: message.content,
          structured: message.structured,
        }));
      })
      .addCase(askAssistant.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.messages.push({ role: "user", content: action.meta.arg.question });
      })
      .addCase(askAssistant.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.activeId = action.payload.conversationId;
        state.lastProvider = action.payload.provider;
        state.messages.push({
          role: "assistant",
          content: action.payload.response.answer,
          structured: action.payload.response,
        });
      })
      .addCase(askAssistant.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "The assistant could not complete that request";
      });
  },
});

export const { startNewThread } = assistantSlice.actions;
export default assistantSlice.reducer;
