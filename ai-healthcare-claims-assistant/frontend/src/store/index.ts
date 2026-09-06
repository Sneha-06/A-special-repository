import { configureStore } from "@reduxjs/toolkit";
import assistantReducer from "./slices/assistantSlice";
import authReducer from "./slices/authSlice";
import claimsReducer from "./slices/claimsSlice";
import rulesReducer from "./slices/rulesSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    claims: claimsReducer,
    rules: rulesReducer,
    assistant: assistantReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
