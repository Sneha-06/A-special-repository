import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { analyzeClaim, fetchClaim, fetchClaims } from "../../services/claimService";
import type { AiResponse, Claim, Paginated } from "../../types";

interface ClaimsState {
  list: Paginated<Claim> | null;
  selected: Claim | null;
  analysis: AiResponse | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  filters: {
    search: string;
    status: string;
    from: string;
    to: string;
    sort: string;
    order: string;
    page: number;
    pageSize: number;
  };
}

const initialState: ClaimsState = {
  list: null,
  selected: null,
  analysis: null,
  status: "idle",
  error: null,
  filters: {
    search: "",
    status: "ALL",
    from: "",
    to: "",
    sort: "serviceDate",
    order: "desc",
    page: 1,
    pageSize: 10,
  },
};

export const loadClaims = createAsyncThunk("claims/list", async (_, { getState }) => {
  const state = getState() as { claims: ClaimsState };
  return fetchClaims(state.claims.filters);
});

export const loadClaim = createAsyncThunk("claims/one", async (id: string) => fetchClaim(id));

export const runClaimAnalysis = createAsyncThunk("claims/analyze", async (id: string) =>
  analyzeClaim(id),
);

const claimsSlice = createSlice({
  name: "claims",
  initialState,
  reducers: {
    setClaimFilters(state, action: { payload: Partial<ClaimsState["filters"]> }) {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadClaims.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loadClaims.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(loadClaims.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Unable to load claims";
      })
      .addCase(loadClaim.fulfilled, (state, action) => {
        state.selected = action.payload;
      })
      .addCase(runClaimAnalysis.fulfilled, (state, action) => {
        state.analysis = action.payload.analysis;
        state.selected = action.payload.claim;
      });
  },
});

export const { setClaimFilters } = claimsSlice.actions;
export default claimsSlice.reducer;
