import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Link as RouterLink, Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Support Ticket Management
          </Typography>
          <Button color="inherit" component={RouterLink} to="/tickets">
            Tickets
          </Button>
          <Button color="inherit" component={RouterLink} to="/tickets/new">
            Create Ticket
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
