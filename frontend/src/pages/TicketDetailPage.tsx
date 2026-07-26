import Typography from "@mui/material/Typography";
import { useParams } from "react-router-dom";

import { PlaceholderPanel } from "../components/common/PlaceholderPanel";

export function TicketDetailPage() {
  const { id } = useParams();

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Ticket Detail
      </Typography>
      <PlaceholderPanel
        title={`Ticket #${id ?? "unknown"} placeholder`}
        description="Status changes, comments, and edit flows will be implemented later."
      />
    </>
  );
}
