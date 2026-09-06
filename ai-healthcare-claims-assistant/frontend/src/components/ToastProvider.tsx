import { Snackbar, Alert } from "@mui/material";
import { createContext, useContext, useMemo, useState } from "react";

interface ToastContextValue {
  notify: (message: string, severity?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextValue>({ notify: () => undefined });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<"success" | "error" | "info">("info");

  const value = useMemo(
    () => ({
      notify: (next: string, nextSeverity: "success" | "error" | "info" = "info") => {
        setMessage(next);
        setSeverity(nextSeverity);
        setOpen(true);
      },
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar open={open} autoHideDuration={4000} onClose={() => setOpen(false)}>
        <Alert severity={severity} onClose={() => setOpen(false)} variant="filled">
          {message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
