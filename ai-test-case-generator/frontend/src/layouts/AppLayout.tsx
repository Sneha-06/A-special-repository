import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Avatar,
  Box,
  Chip,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { useState, type ReactNode } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { DEMO_USER } from "../utils/constants";

const drawerWidth = 260;

const nav: Array<{ to: string; label: string; icon: ReactNode }> = [
  { to: "/", label: "Dashboard", icon: <DashboardOutlinedIcon fontSize="small" /> },
  { to: "/projects", label: "Projects", icon: <FolderOpenOutlinedIcon fontSize="small" /> },
  { to: "/requirements", label: "Requirements", icon: <DescriptionOutlinedIcon fontSize="small" /> },
  { to: "/test-cases", label: "Test Cases", icon: <AutoAwesomeOutlinedIcon fontSize="small" /> },
  { to: "/coverage", label: "Coverage", icon: <AssessmentOutlinedIcon fontSize="small" /> },
  { to: "/history", label: "Generation History", icon: <HistoryOutlinedIcon fontSize="small" /> },
];

function isActive(pathname: string, to: string) {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function AppLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const drawer = (
    <Box sx={{ height: "100%", bgcolor: "#0F172A", color: "#E2E8F0", display: "flex", flexDirection: "column" }}>
      <Box sx={{ px: 2.5, py: 2.5 }}>
        <Typography sx={{ color: "white", fontWeight: 700 }}>ATCG</Typography>
        <Typography variant="caption" sx={{ color: "rgba(226,232,240,0.7)" }}>
          AI Test Case Generator
        </Typography>
      </Box>
      <List sx={{ px: 1.5, flex: 1 }}>
        {nav.map((item) => {
          const selected = isActive(location.pathname, item.to);
          return (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              selected={selected}
              onClick={() => setMobileOpen(false)}
              sx={{
                mb: 0.5,
                borderRadius: 2,
                color: selected ? "white" : "rgba(226,232,240,0.85)",
                "&.Mui-selected": { bgcolor: "rgba(37, 99, 235, 0.25)" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: selected ? 700 : 500 }} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Box component="aside" sx={{ width: { md: drawerWidth }, flexShrink: 0 }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": { width: drawerWidth, border: "none" } }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": { width: drawerWidth, border: "none" },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <AppBar
          position="sticky"
          color="inherit"
          elevation={0}
          sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "rgba(255,255,255,0.9)" }}
        >
          <Toolbar>
            <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1, display: { md: "none" } }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
              Enterprise QA Workspace
            </Typography>
            <Chip size="small" label="Foundation" variant="outlined" color="primary" sx={{ mr: 2 }} />
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar sx={{ width: 34, height: 34, bgcolor: "primary.main", fontSize: 14 }}>
                {DEMO_USER.name.slice(0, 1)}
              </Avatar>
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <Typography variant="body2" fontWeight={600}>{DEMO_USER.name}</Typography>
                <Typography variant="caption" color="text.secondary">{DEMO_USER.role}</Typography>
              </Box>
            </Stack>
          </Toolbar>
        </AppBar>
        <Box component="main" sx={{ p: { xs: 2, md: 3 }, maxWidth: 1280, mx: "auto" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
