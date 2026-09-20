import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#2563EB", dark: "#1D4ED8", light: "#3B82F6" },
    secondary: { main: "#0F766E" },
    background: { default: "#F4F7FB", paper: "#FFFFFF" },
    text: { primary: "#0F172A", secondary: "#475569" },
    divider: "rgba(15, 23, 42, 0.08)",
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: "1px solid rgba(15, 23, 42, 0.08)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: { boxShadow: "none" },
      },
    },
  },
});
