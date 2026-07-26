import Typography from "@mui/material/Typography";

import { PlaceholderPanel } from "../components/common/PlaceholderPanel";

export function CreateTicketPage() {
  return (
    <>
      <Typography variant="h4" gutterBottom>
        Create Ticket
      </Typography>
      <PlaceholderPanel
        title="Create ticket placeholder"
        description="Ticket form (React Hook Form + Zod) will be implemented in a later phase."
      />
    </>
  );
}
