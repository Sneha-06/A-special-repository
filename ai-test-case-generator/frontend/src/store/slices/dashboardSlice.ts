import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getErrorMessage } from "../../services/api";
import { fetchDashboard } from "../../services/dashboardService";
import type { DashboardResponse } from "../../types/dashboard";

interface DashboardState {
  data: DashboardResponse | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: DashboardState = {
  data: null,
  status: "idle",
  error: null,
};

export const loadDashboard = createAsyncThunk(
  "dashboard/load",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchDashboard();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadDashboard.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loadDashboard.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(loadDashboard.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Failed to load dashboard";
      });
  },
});

export const { clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
