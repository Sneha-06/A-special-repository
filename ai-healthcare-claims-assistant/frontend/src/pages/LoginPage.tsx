import { Alert, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import { login } from "../store/slices/authSlice";

export function LoginPage() {
  const dispatch = useAppDispatch();
  const { token, status, error } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState("analyst@demo.health");
  const [password, setPassword] = useState("DemoPass123!");

  if (token) return <Navigate to="/" replace />;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1.05fr 0.95fr" },
      }}
    >
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          p: 6,
          bgcolor: "#0F3A45",
          color: "#E7F2F4",
        }}
      >
        <Typography sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}>Northstar PBM</Typography>
        <Box>
          <Typography variant="h4" sx={{ color: "white", mb: 2, maxWidth: 440 }}>
            Understand every claim decision with clear rules and AI context.
          </Typography>
          <Typography sx={{ color: "rgba(231,242,244,0.75)", maxWidth: 420 }}>
            Search synthetic claims, compare mandates, and ask the copilot why a claim was approved or
            rejected — without exposing real patient data.
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: "rgba(231,242,244,0.55)" }}>
          Demo environment · synthetic data only
        </Typography>
      </Box>
      <Box sx={{ display: "grid", placeItems: "center", p: 3, bgcolor: "background.default" }}>
        <Paper sx={{ p: { xs: 3, sm: 4.5 }, width: "100%", maxWidth: 440, borderRadius: 3 }}>
          <Typography variant="overline" color="primary" sx={{ fontWeight: 700 }}>
            Analyst access
          </Typography>
          <Typography variant="h5" gutterBottom sx={{ mt: 0.5 }}>
            Sign in
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Use the demo analyst account to explore the claims workspace.
          </Typography>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void dispatch(login({ email, password }));
            }}
          >
            <Stack spacing={2}>
              {error ? <Alert severity="error">{error}</Alert> : null}
              <TextField
                label="Work email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="username"
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
                fullWidth
              />
              <Button type="submit" variant="contained" size="large" disabled={status === "loading"}>
                {status === "loading" ? "Signing in…" : "Continue"}
              </Button>
              <Typography variant="caption" color="text.secondary">
                Demo user: analyst@demo.health / DemoPass123!
              </Typography>
            </Stack>
          </form>
        </Paper>
      </Box>
    </Box>
  );
}
