import type { TicketStatus } from "../types";

/** Solid accent + filled gradient for status UI (counts + badges). */
export const STATUS_STYLE: Record<
  TicketStatus,
  { accent: string; gradient: string; text: string }
> = {
  Open: {
    accent: "#0288d1",
    gradient: "linear-gradient(135deg, #4fc3f7 0%, #0288d1 55%, #01579b 100%)",
    text: "#ffffff",
  },
  "In Progress": {
    accent: "#ed6c02",
    gradient: "linear-gradient(135deg, #ffb74d 0%, #ed6c02 55%, #e65100 100%)",
    text: "#ffffff",
  },
  Resolved: {
    accent: "#2e7d32",
    gradient: "linear-gradient(135deg, #81c784 0%, #43a047 55%, #1b5e20 100%)",
    text: "#ffffff",
  },
  Closed: {
    accent: "#616161",
    gradient: "linear-gradient(135deg, #9e9e9e 0%, #616161 55%, #424242 100%)",
    text: "#ffffff",
  },
  Cancelled: {
    accent: "#d32f2f",
    gradient: "linear-gradient(135deg, #ef9a9a 0%, #e53935 55%, #b71c1c 100%)",
    text: "#ffffff",
  },
};

/** Gradient for the aggregate "All" count box. */
export const ALL_COUNT_STYLE = {
  accent: "#0f4c5c",
  gradient: "linear-gradient(135deg, #4db6ac 0%, #0f4c5c 55%, #062c36 100%)",
  text: "#ffffff",
} as const;
