import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import CompareArrowsOutlinedIcon from "@mui/icons-material/CompareArrowsOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MenuIcon from "@mui/icons-material/Menu";
import PolicyOutlinedIcon from "@mui/icons-material/PolicyOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState, type ReactNode } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { logout } from "../store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "../hooks";

const drawerWidth = 268;

const nav: Array<{ to: string; label: string; icon: ReactNode; group: string }> = [
  { to: "/", label: "Dashboard", icon: <DashboardOutlinedIcon fontSize="small" />, group: "Overview" },
  { to: "/claims", label: "Claims explorer", icon: <AssignmentOutlinedIcon fontSize="small" />, group: "Operations" },
  { to: "/assistant", label: "Claims copilot", icon: <PsychologyOutlinedIcon fontSize="small" />, group: "Operations" },
  { to: "/rules", label: "Mandate rules", icon: <PolicyOutlinedIcon fontSize="small" />, group: "Policy" },
  { to: "/rules/compare", label: "Compare rules", icon: <CompareArrowsOutlinedIcon fontSize="small" />, group: "Policy" },
  { to: "/documents", label: "Document analyzer", icon: <DescriptionOutlinedIcon fontSize="small" />, group: "Policy" },
  { to: "/insights", label: "AI insights", icon: <InsightsOutlinedIcon fontSize="small" />, group: "Overview" },
];

function isSelected(pathname: string, to: string) {
  if (to === "/") return pathname === "/";
  if (to === "/rules") return pathname === "/rules" || (pathname.startsWith("/rules/") && !pathname.startsWith("/rules/compare"));
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function AppLayout() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [mobileOpen, setMobileOpen] = useState(false);

  const groups = ["Overview", "Operations", "Policy"];

  const drawer = (
    <Box
      component="nav"
      aria-label="Primary"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#0F3A45",
        color: "#E7F2F4",
      }}
    >
      <Box sx={{ px: 2.5, py: 2.5, display: "flex", gap: 1.5, alignItems: "center" }}>
        <Box
          aria-hidden
          sx={{
            width: 36,
            height: 36,
            borderRadius: "10px",
            bgcolor: "#1C7A8C",
            display: "grid",
            placeItems: "center",
            fontWeight: 800,
            fontSize: 14,
            color: "white",
          }}
        >
          NS
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, lineHeight: 1.2, color: "white" }}>Northstar PBM</Typography>
          <Typography variant="caption" sx={{ color: "rgba(231,242,244,0.7)" }}>
            Claims workspace
          </Typography>
        </Box>
      </Box>
      <Box sx={{ px: 1.5, pb: 2, flex: 1, overflow: "auto" }}>
        {groups.map((group) => (
          <Box key={group} sx={{ mb: 1.5 }}>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                px: 1.5,
                py: 0.75,
                color: "rgba(231,242,244,0.45)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              {group}
            </Typography>
            <List disablePadding>
              {nav
                .filter((item) => item.group === group)
                .map((item) => {
                  const selected = isSelected(location.pathname, item.to);
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
                        color: selected ? "white" : "rgba(231,242,244,0.82)",
                        "&.Mui-selected": {
                          bgcolor: "rgba(255,255,255,0.12)",
                          "&:hover": { bgcolor: "rgba(255,255,255,0.16)" },
                        },
                        "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: selected ? 700 : 500 }} />
                    </ListItemButton>
                  );
                })}
            </List>
          </Box>
        ))}
      </Box>
      <Box sx={{ px: 2, py: 2, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <Typography variant="caption" sx={{ color: "rgba(231,242,244,0.55)" }}>
          Synthetic demo data only — not PHI
        </Typography>
      </Box>
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
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { width: drawerWidth, border: "none", bgcolor: "#0F3A45" },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              border: "none",
              bgcolor: "#0F3A45",
            },
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
          sx={{
            bgcolor: "rgba(255,255,255,0.86)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid",
            borderColor: "divider",
            color: "text.primary",
          }}
        >
          <Toolbar sx={{ gap: 1.5 }}>
            <IconButton
              edge="start"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
              sx={{ display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1">AI Healthcare Claims Assistant</Typography>
              <Typography variant="caption" color="text.secondary">
                Analyst workspace
              </Typography>
            </Box>
            <Chip size="small" label="Demo" color="primary" variant="outlined" />
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar sx={{ width: 34, height: 34, bgcolor: "primary.main", fontSize: 14 }}>
                {user?.name?.slice(0, 1) ?? "A"}
              </Avatar>
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <Typography variant="body2" fontWeight={600}>
                  {user?.name ?? "Analyst"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.role ?? "analyst"}
                </Typography>
              </Box>
              <Tooltip title="Sign out">
                <Button
                  color="inherit"
                  size="small"
                  startIcon={<LogoutRoundedIcon />}
                  onClick={() => dispatch(logout())}
                >
                  Sign out
                </Button>
              </Tooltip>
            </Stack>
          </Toolbar>
        </AppBar>
        <Box component="main" sx={{ p: { xs: 2, md: 3.5 }, maxWidth: 1400, mx: "auto" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
