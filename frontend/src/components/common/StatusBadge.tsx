import Chip from "@mui/material/Chip";

import type { TicketStatus } from "../../types";

const STATUS_COLOR: Record<
  TicketStatus,
  "default" | "info" | "warning" | "success" | "error"
> = {
  Open: "info",
  "In Progress": "warning",
  Resolved: "success",
  Closed: "default",
  Cancelled: "error",
};

interface StatusBadgeProps {
  status: TicketStatus;
  size?: "small" | "medium";
}

export function StatusBadge({ status, size = "small" }: StatusBadgeProps) {
  return (
    <Chip
      label={status}
      color={STATUS_COLOR[status]}
      size={size}
      variant="filled"
      aria-label={`Status: ${status}`}
    />
  );
}
