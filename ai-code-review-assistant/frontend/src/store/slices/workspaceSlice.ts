import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AnalysisType, AnalyzeResponse } from "../../types/analysis";

interface WorkspaceState {
  sourceCode: string;
  language: string;
  filePath: string;
  title: string;
  analysisType: AnalysisType;
  context: string;
  loading: boolean;
  error: string | null;
  lastResult: AnalyzeResponse | null;
}

const initialState: WorkspaceState = {
  sourceCode: `import { useState, useEffect } from "react";

export function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then(setUsers);
  });

  return (
    <ul>
      {users.map((u) => <li key={u.id}>{u.name}</li>)}
    </ul>
  );
}`,
  language: "typescript",
  filePath: "src/components/UserList.tsx",
  title: "",
  analysisType: "CODE_REVIEW",
  context: "",
  loading: false,
  error: null,
  lastResult: null,
};

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    setSourceCode(state, action: PayloadAction<string>) {
      state.sourceCode = action.payload;
    },
    setLanguage(state, action: PayloadAction<string>) {
      state.language = action.payload;
    },
    setFilePath(state, action: PayloadAction<string>) {
      state.filePath = action.payload;
    },
    setTitle(state, action: PayloadAction<string>) {
      state.title = action.payload;
    },
    setAnalysisType(state, action: PayloadAction<AnalysisType>) {
      state.analysisType = action.payload;
    },
    setContext(state, action: PayloadAction<string>) {
      state.context = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setLastResult(state, action: PayloadAction<AnalyzeResponse | null>) {
      state.lastResult = action.payload;
    },
    loadFromSession(state, action: PayloadAction<{ sourceCode: string; language: string; filePath?: string; analysisType: AnalysisType }>) {
      state.sourceCode = action.payload.sourceCode;
      state.language = action.payload.language;
      state.filePath = action.payload.filePath ?? "";
      state.analysisType = action.payload.analysisType;
    },
  },
});

export const {
  setSourceCode, setLanguage, setFilePath, setTitle, setAnalysisType,
  setContext, setLoading, setError, setLastResult, loadFromSession,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;
