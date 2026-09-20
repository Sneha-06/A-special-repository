import { ThemeProvider } from "@mui/material";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { theme } from "../theme";

export function renderWithTheme(ui: ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}
