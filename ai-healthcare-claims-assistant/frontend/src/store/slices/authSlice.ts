import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getErrorMessage } from "../../services/api";
import { fetchMe, login as loginRequest } from "../../services/authService";
import type { AuthUser } from "../../types";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const token = localStorage.getItem("ahca_token");

const initialState: AuthState = {
  token,
  user: null,
  status: "idle",
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const result = await loginRequest(payload.email, payload.password);
      localStorage.setItem("ahca_token", result.token);
      return result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const hydrateSession = createAsyncThunk("auth/hydrate", async () => fetchMe());

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem("ahca_token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? action.error.message ?? "Unable to sign in";
      })
      .addCase(hydrateSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "succeeded";
      })
      .addCase(hydrateSession.rejected, (state) => {
        state.token = null;
        state.user = null;
        localStorage.removeItem("ahca_token");
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
