import type { severityColors } from "./index";

declare module "@mui/material/styles" {
  interface Palette {
    severity: typeof severityColors;
  }
  interface PaletteOptions {
    severity?: typeof severityColors;
  }
}
