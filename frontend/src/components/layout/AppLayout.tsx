import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import { Link as RouterLink, Outlet, useLocation } from "react-router-dom";

import { DEFAULT_USER_ID } from "../../api/client";
import { getErrorMessage } from "../../api/errors";
import { useExportTickets } from "../../hooks/useExportTickets";
import { useUsers } from "../../hooks/useUsers";
import { ErrorAlert } from "../common/ErrorAlert";

const DRAWER_WIDTH = 220;

const NAV_ITEMS = [
  {
    label: "Dashboard",
    to: "/",
    icon: <DashboardOutlinedIcon />,
    match: (pathname: string) => pathname === "/",
  },
  {
    label: "Tickets",
    to: "/tickets",
    icon: <ListAltOutlinedIcon />,
    match: (pathname: string) =>
      pathname === "/tickets" ||
      (pathname.startsWith("/tickets/") &&
        !pathname.endsWith("/new") &&
        !pathname.includes("/edit")),
  },
  {
    label: "Create Ticket",
    to: "/tickets/new",
    icon: <AddIcon />,
    match: (pathname: string) => pathname === "/tickets/new",
  },
] as const;

export function AppLayout() {
  const location = useLocation();
  const { data: users = [] } = useUsers();
  const exportMutation = useExportTickets();

  const activeUser = users.find((user) => user.id === DEFAULT_USER_ID);
  const activeUserLabel = activeUser
    ? `${activeUser.name} (demo)`
    : `User #${DEFAULT_USER_ID} (demo)`;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar sx={{ gap: 1, flexWrap: "wrap", py: { xs: 1, sm: 0 } }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              color: "inherit",
              textDecoration: "none",
              minWidth: 180,
            }}
          >
            Support Tickets
          </Typography>
          <Typography
            variant="body2"
            sx={{
              opacity: 0.9,
              mr: { sm: 1 },
              display: { xs: "none", md: "block" },
            }}
          >
            Logged in as: {activeUserLabel}
          </Typography>
          <Button
            color="inherit"
            startIcon={<FileDownloadOutlinedIcon />}
            onClick={() => exportMutation.mutate({})}
            disabled={exportMutation.isPending}
          >
            {exportMutation.isPending ? "Exporting…" : "Export My Tickets"}
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            borderRight: 1,
            borderColor: "divider",
          },
          display: { xs: "none", md: "block" },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto", py: 1 }}>
          <List component="nav" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <ListItemButton
                key={item.to}
                component={RouterLink}
                to={item.to}
                selected={item.match(location.pathname)}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
          <Divider sx={{ my: 1 }} />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ px: 2, display: "block" }}
          >
            Click a status count on the dashboard to open filtered tickets.
          </Typography>
        </Box>
      </Drawer>

      {/* Compact top nav for small screens */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          position: "fixed",
          top: 56,
          left: 0,
          right: 0,
          zIndex: (theme) => theme.zIndex.appBar - 1,
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
          px: 1,
          gap: 0.5,
          overflowX: "auto",
        }}
      >
        {NAV_ITEMS.map((item) => (
          <Button
            key={item.to}
            size="small"
            component={RouterLink}
            to={item.to}
            variant={item.match(location.pathname) ? "contained" : "text"}
            sx={{ whiteSpace: "nowrap", my: 1 }}
          >
            {item.label}
          </Button>
        ))}
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          px: { xs: 2, md: 3 },
          py: 3,
          pt: { xs: 14, md: 3 },
        }}
      >
        <Toolbar />
        {exportMutation.isError ? (
          <ErrorAlert message={getErrorMessage(exportMutation.error)} />
        ) : null}
        <Outlet />
      </Box>
    </Box>
  );
}
