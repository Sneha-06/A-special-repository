import { alpha, createTheme } from "@mui/material/styles";

export const severityColors = {
  critical: { main: "#B91C1C", light: alpha("#B91C1C", 0.18) },
  high: { main: "#DC2626", light: alpha("#DC2626", 0.16) },
  medium: { main: "#D97706", light: alpha("#D97706", 0.16) },
  low: { main: "#2563EB", light: alpha("#2563EB", 0.14) },
  info: { main: "#64748B", light: alpha("#64748B", 0.12) },
};

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#2563EB" },
    secondary: { main: "#0F172A" },
    background: { default: "#F8FAFC", paper: "#FFFFFF" },
    severity: severityColors,
  },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: "0 1px 3px rgba(15,23,42,0.08)" },
      },
    },
  },
});
