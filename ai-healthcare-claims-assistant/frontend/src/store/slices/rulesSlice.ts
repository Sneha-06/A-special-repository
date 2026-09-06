import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchRule, fetchRules } from "../../services/ruleService";
import type { Paginated, Rule } from "../../types";

interface RulesState {
  list: Paginated<Rule> | null;
  selected: Rule | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  filters: {
    search: string;
    category: string;
    status: string;
    sort: string;
    order: string;
    page: number;
  };
}

const initialState: RulesState = {
  list: null,
  selected: null,
  status: "idle",
  error: null,
  filters: {
    search: "",
    category: "ALL",
    status: "ALL",
    sort: "ruleId",
    order: "asc",
    page: 1,
  },
};

export const loadRules = createAsyncThunk("rules/list", async (_, { getState }) => {
  const state = getState() as { rules: RulesState };
  return fetchRules({ ...state.rules.filters, pageSize: 12 });
});

export const loadRule = createAsyncThunk("rules/one", async (id: string) => fetchRule(id));

const rulesSlice = createSlice({
  name: "rules",
  initialState,
  reducers: {
    setRuleFilters(state, action: { payload: Partial<RulesState["filters"]> }) {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadRules.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loadRules.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(loadRules.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Unable to load rules";
      })
      .addCase(loadRule.fulfilled, (state, action) => {
        state.selected = action.payload;
      });
  },
});

export const { setRuleFilters } = rulesSlice.actions;
export default rulesSlice.reducer;
