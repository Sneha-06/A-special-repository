import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getErrorMessage } from "../../services/api";
import { fetchHealth } from "../../services/healthService";
import type { HealthResponse } from "../../types";

interface AppState {
  health: HealthResponse | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AppState = {
  health: null,
  status: "idle",
  error: null,
};

export const loadHealth = createAsyncThunk("app/loadHealth", async (_, { rejectWithValue }) => {
  try {
    return await fetchHealth();
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadHealth.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loadHealth.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.health = action.payload;
      })
      .addCase(loadHealth.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Unable to reach API";
      });
  },
});

export default appSlice.reducer;
