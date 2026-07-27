import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { Link as RouterLink, Outlet } from "react-router-dom";

import { DEFAULT_USER_ID } from "../../api/client";
import { getErrorMessage } from "../../api/errors";
import { useExportTickets } from "../../hooks/useExportTickets";
import { useUsers } from "../../hooks/useUsers";
import { ErrorAlert } from "../common/ErrorAlert";

export function AppLayout() {
  const { data: users = [] } = useUsers();
  const exportMutation = useExportTickets();

  const activeUser = users.find((user) => user.id === DEFAULT_USER_ID);
  const activeUserLabel = activeUser
    ? `${activeUser.name} (demo)`
    : `User #${DEFAULT_USER_ID} (demo)`;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ gap: 1, flexWrap: "wrap", py: { xs: 1, sm: 0 } }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/tickets"
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
            sx={{ opacity: 0.9, mr: { sm: 1 }, display: { xs: "none", md: "block" } }}
          >
            Logged in as: {activeUserLabel}
          </Typography>
          <Button color="inherit" component={RouterLink} to="/tickets">
            Tickets
          </Button>
          <Button color="inherit" component={RouterLink} to="/tickets/new">
            Create Ticket
          </Button>
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {exportMutation.isError ? (
          <ErrorAlert message={getErrorMessage(exportMutation.error)} />
        ) : null}
        <Outlet />
      </Container>
    </Box>
  );
}
