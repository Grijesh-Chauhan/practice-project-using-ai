import Chip from "@mui/material/Chip";

import type { Priority } from "../../types";

const PRIORITY_COLOR: Record<Priority, "default" | "info" | "warning" | "error"> = {
  low: "default",
  medium: "info",
  high: "error",
};

interface PriorityBadgeProps {
  priority: Priority;
  size?: "small" | "medium";
}

export function PriorityBadge({ priority, size = "small" }: PriorityBadgeProps) {
  return (
    <Chip
      label={priority}
      color={PRIORITY_COLOR[priority]}
      size={size}
      variant="outlined"
      aria-label={`Priority: ${priority}`}
      sx={{ textTransform: "capitalize" }}
    />
  );
}
