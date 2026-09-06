import { Chip, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import type { AiSource } from "../types";

export function SourceReferences({ sources }: { sources: AiSource[] }) {
  if (!sources.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        No supporting sources returned.
      </Typography>
    );
  }
  return (
    <Stack direction="row" gap={1} flexWrap="wrap">
      {sources.map((source) => {
        const to =
          source.type === "claim"
            ? `/claims/${source.id}`
            : source.type === "rule"
              ? `/rules/${source.id}`
              : "/documents";
        return (
          <Chip
            key={`${source.type}-${source.id}`}
            component={RouterLink}
            to={to}
            clickable
            size="small"
            label={`${source.type}: ${source.title || source.id}`}
            variant="outlined"
          />
        );
      })}
    </Stack>
  );
}
