import { Box, List, ListItem, ListItemText, Paper, Typography } from "@mui/material";

interface AnalysisSectionProps {
  title: string;
  items: string[];
  highlight?: "warning" | "error" | "default";
  emptyMessage?: string;
}

const HIGHLIGHT_STYLES = {
  warning: {
    borderColor: "warning.light",
    bgcolor: "rgba(245, 158, 11, 0.08)",
    titleColor: "warning.dark",
  },
  error: {
    borderColor: "error.light",
    bgcolor: "rgba(239, 68, 68, 0.08)",
    titleColor: "error.dark",
  },
  default: {
    borderColor: "divider",
    bgcolor: "background.paper",
    titleColor: "text.primary",
  },
};

export function AnalysisSection({
  title,
  items,
  highlight = "default",
  emptyMessage = "None identified",
}: AnalysisSectionProps) {
  const styles = HIGHLIGHT_STYLES[highlight];

  return (
    <Paper
      sx={{
        p: 2,
        height: "100%",
        border: "1px solid",
        borderColor: styles.borderColor,
        bgcolor: styles.bgcolor,
      }}
    >
      <Typography variant="subtitle2" fontWeight={700} color={styles.titleColor} gutterBottom>
        {title}
      </Typography>
      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">{emptyMessage}</Typography>
      ) : (
        <List dense disablePadding>
          {items.map((item, index) => (
            <ListItem key={`${title}-${index}`} disableGutters sx={{ alignItems: "flex-start" }}>
              <Box
                component="span"
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: highlight === "default" ? "primary.main" : styles.titleColor,
                  mt: 1,
                  mr: 1.5,
                  flexShrink: 0,
                }}
              />
              <ListItemText
                primary={item}
                primaryTypographyProps={{ variant: "body2", color: "text.primary" }}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}
