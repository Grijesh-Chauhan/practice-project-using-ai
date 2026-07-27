import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";

import { PageHeader } from "../components/common/PageHeader";

export function NotFoundPage() {
  return (
    <>
      <PageHeader title="Page not found" />
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography color="text.secondary" paragraph>
          The requested route does not exist.
        </Typography>
        <Button component={RouterLink} to="/tickets" variant="contained">
          Back to tickets
        </Button>
      </Paper>
    </>
  );
}
