import Typography from "@mui/material/Typography";

import { PlaceholderPanel } from "../components/common/PlaceholderPanel";

export function TicketListPage() {
  return (
    <>
      <Typography variant="h4" gutterBottom>
        Tickets
      </Typography>
      <PlaceholderPanel
        title="Ticket list placeholder"
        description="Search, filters, and ticket table will be implemented in a later phase."
      />
    </>
  );
}
