import Chip from "@mui/material/Chip";

import type { TicketStatus } from "../../types";
import { STATUS_STYLE } from "../../utils/statusStyles";

interface StatusBadgeProps {
  status: TicketStatus;
  size?: "small" | "medium";
}

export function StatusBadge({ status, size = "small" }: StatusBadgeProps) {
  const style = STATUS_STYLE[status];

  return (
    <Chip
      label={status}
      size={size}
      variant="filled"
      aria-label={`Status: ${status}`}
      sx={{
        color: style.text,
        fontWeight: 600,
        backgroundImage: style.gradient,
        backgroundColor: style.accent,
        border: "none",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.12)",
        "& .MuiChip-label": {
          color: style.text,
        },
      }}
    />
  );
}
