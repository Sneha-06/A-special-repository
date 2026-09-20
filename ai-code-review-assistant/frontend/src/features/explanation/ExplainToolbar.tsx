import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import { Button } from "@mui/material";

interface ExplainToolbarProps {
  loading: boolean;
  onExplain: () => void;
}

export function ExplainToolbar({ loading, onExplain }: ExplainToolbarProps) {
  return (
    <Button
      variant="outlined"
      color="info"
      startIcon={<PsychologyOutlinedIcon />}
      onClick={onExplain}
      disabled={loading}
      sx={{ mr: 1 }}
    >
      {loading ? "Explaining…" : "Explain Code"}
    </Button>
  );
}
