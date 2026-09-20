import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import { Box, CircularProgress, List, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { fetchFiles } from "../../services/githubService";
import type { GitHubFileItem } from "../../types/github";
import { isSourceFile } from "../../types/github";

interface FileTreeProps {
  owner: string;
  repo: string;
  branch: string;
  selectedPath: string | null;
  onSelectFile: (path: string) => void;
}

export function FileTree({ owner, repo, branch, selectedPath, onSelectFile }: FileTreeProps) {
  const [rootItems, setRootItems] = useState<GitHubFileItem[]>([]);
  const [childrenMap, setChildrenMap] = useState<Record<string, GitHubFileItem[]>>({});
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loadingPaths, setLoadingPaths] = useState<Set<string>>(new Set());
  const [rootLoading, setRootLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPath = useCallback(async (path: string) => {
    setLoadingPaths((prev) => new Set(prev).add(path));
    try {
      const files = await fetchFiles(owner, repo, path, branch);
      if (path === "") {
        setRootItems(files);
      } else {
        setChildrenMap((prev) => ({ ...prev, [path]: files }));
      }
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load files");
    } finally {
      setLoadingPaths((prev) => {
        const next = new Set(prev);
        next.delete(path);
        return next;
      });
      if (path === "") setRootLoading(false);
    }
  }, [owner, repo, branch]);

  useEffect(() => {
    setRootItems([]);
    setChildrenMap({});
    setExpanded(new Set());
    setRootLoading(true);
    loadPath("");
  }, [loadPath]);

  const toggleDir = async (path: string) => {
    const next = new Set(expanded);
    if (next.has(path)) {
      next.delete(path);
    } else {
      next.add(path);
      if (!childrenMap[path]) await loadPath(path);
    }
    setExpanded(next);
  };

  const renderItem = (item: GitHubFileItem, depth = 0) => {
    const isDir = item.type === "dir";
    const isExpanded = expanded.has(item.path);
    const isLoading = loadingPaths.has(item.path);
    const selectable = !isDir && isSourceFile(item.path);

    return (
      <Box key={item.path}>
        <ListItemButton
          sx={{ pl: 2 + depth * 2 }}
          selected={selectedPath === item.path}
          disabled={!isDir && !selectable}
          onClick={() => (isDir ? toggleDir(item.path) : selectable ? onSelectFile(item.path) : undefined)}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            {isDir ? (isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />) : (
              <InsertDriveFileOutlinedIcon fontSize="small" color={selectable ? "primary" : "disabled"} />
            )}
          </ListItemIcon>
          <ListItemText primary={item.name} primaryTypographyProps={{ variant: "body2", noWrap: true }} />
          {isDir && <FolderOutlinedIcon fontSize="small" color="action" />}
        </ListItemButton>
        {isDir && isExpanded && (
          <Box>
            {isLoading ? (
              <Box sx={{ pl: 4 + depth * 2, py: 1 }}><CircularProgress size={16} /></Box>
            ) : (
              (childrenMap[item.path] ?? []).map((child) => renderItem(child, depth + 1))
            )}
          </Box>
        )}
      </Box>
    );
  };

  if (rootLoading) return <Box sx={{ p: 2, textAlign: "center" }}><CircularProgress size={24} /></Box>;
  if (error) return <Typography color="error" variant="body2" sx={{ p: 2 }}>{error}</Typography>;

  return (
    <List dense disablePadding sx={{ maxHeight: 480, overflow: "auto" }}>
      {rootItems.map((item) => renderItem(item))}
    </List>
  );
}
