import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import { MonacoSeverityStyles } from "./components/common/MonacoSeverityStyles";
import { AppRoutes } from "./routes/AppRoutes";
import { theme } from "./theme";

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MonacoSeverityStyles />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}
