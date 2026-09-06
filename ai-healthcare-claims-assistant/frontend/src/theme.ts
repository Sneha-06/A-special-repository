import { createTheme } from "@mui/material/styles";

const ink = "#16323B";
const teal = "#146072";
const sage = "#3E7A63";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: teal, dark: "#0E4452", light: "#3A8494", contrastText: "#ffffff" },
    secondary: { main: sage, dark: "#2C5A48", light: "#6A9A86", contrastText: "#ffffff" },
    background: { default: "#F3F6F7", paper: "#FFFFFF" },
    error: { main: "#B54A4A" },
    warning: { main: "#C4892A" },
    success: { main: "#2F7A55" },
    info: { main: "#3D6E8C" },
    divider: "rgba(20, 50, 58, 0.08)",
    text: { primary: ink, secondary: "#5A7178" },
  },
  shape: { borderRadius: 12 },
  spacing: 8,
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif',
    h4: { fontWeight: 700, letterSpacing: "-0.02em" },
    h5: { fontWeight: 700, letterSpacing: "-0.02em" },
    h6: { fontWeight: 600, letterSpacing: "-0.01em" },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600, letterSpacing: 0 },
    body1: { lineHeight: 1.6 },
    body2: { lineHeight: 1.55 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: "#F3F6F7" },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid rgba(20, 50, 58, 0.08)",
          boxShadow: "0 1px 2px rgba(22, 50, 59, 0.04)",
        },
        outlined: {
          border: "1px solid rgba(20, 50, 58, 0.10)",
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: "1px solid rgba(20, 50, 58, 0.08)",
          boxShadow: "0 1px 2px rgba(22, 50, 59, 0.04)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, paddingInline: 16 },
        contained: { boxShadow: "none", "&:hover": { boxShadow: "none" } },
        outlined: { borderColor: "rgba(20, 96, 114, 0.28)" },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-head": {
            backgroundColor: "#F7FAFB",
            color: "#5A7178",
            fontWeight: 600,
            fontSize: 12,
            letterSpacing: "0.02em",
            textTransform: "uppercase",
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": { backgroundColor: "rgba(20, 96, 114, 0.03)" },
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: "small" },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { fontSize: 12, borderRadius: 8 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
  },
});
