import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";

import { PlaceholderPanel } from "../components/common/PlaceholderPanel";

export function NotFoundPage() {
  return (
    <>
      <Typography variant="h4" gutterBottom>
        Page not found
      </Typography>
      <PlaceholderPanel
        title="404"
        description="The requested route does not exist."
        action={
          <Button component={RouterLink} to="/tickets" variant="contained">
            Back to tickets
          </Button>
        }
      />
    </>
  );
}
