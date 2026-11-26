import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import type { StatusCounts } from "../../hooks/useTicketStatusCounts";
import type { TicketStatus } from "../../types";
import { TICKET_STATUSES } from "../../utils/constants";
import { ALL_COUNT_STYLE, STATUS_STYLE } from "../../utils/statusStyles";

export type StatusTabValue = TicketStatus | "";

interface StatusFilterTabsProps {
  value: StatusTabValue;
  onChange: (next: StatusTabValue) => void;
  counts?: StatusCounts;
  loading?: boolean;
}

interface TabDef {
  value: StatusTabValue;
  label: string;
  accent: string;
  gradient: string;
  count: number;
}

/**
 * Status filter tabs for the listing page (All + each status).
 * Uses the same color language as dashboard count boxes, as compact buttons.
 */
export function StatusFilterTabs({
  value,
  onChange,
  counts,
  loading = false,
}: StatusFilterTabsProps) {
  const total = counts
    ? TICKET_STATUSES.reduce((sum, status) => sum + counts[status], 0)
    : 0;

  const tabs: TabDef[] = [
    {
      value: "",
      label: "All",
      accent: ALL_COUNT_STYLE.accent,
      gradient: ALL_COUNT_STYLE.gradient,
      count: total,
    },
    ...TICKET_STATUSES.map((status) => ({
      value: status as StatusTabValue,
      label: status,
      accent: STATUS_STYLE[status].accent,
      gradient: STATUS_STYLE[status].gradient,
      count: counts?.[status] ?? 0,
    })),
  ];

  return (
    <Stack spacing={1} sx={{ mb: 2 }} component="nav" aria-label="Filter by status">
      <Typography variant="subtitle2" color="text.secondary">
        Status
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {tabs.map((tab) => {
          const selected = value === tab.value;
          return (
            <Button
              key={tab.label}
              type="button"
              size="small"
              variant={selected ? "contained" : "outlined"}
              aria-pressed={selected}
              aria-label={
                loading
                  ? `${tab.label} status filter`
                  : `${tab.label}: ${tab.count} tickets`
              }
              onClick={() => onChange(tab.value)}
              sx={{
                textTransform: "none",
                fontWeight: selected ? 700 : 600,
                borderColor: tab.accent,
                color: selected ? "#fff" : tab.accent,
                backgroundImage: selected ? tab.gradient : "none",
                backgroundColor: selected ? tab.accent : "transparent",
                boxShadow: selected ? "0 2px 8px rgba(0,0,0,0.18)" : "none",
                "&:hover": {
                  borderColor: tab.accent,
                  backgroundImage: selected ? tab.gradient : "none",
                  backgroundColor: selected ? tab.accent : `${tab.accent}14`,
                  color: selected ? "#fff" : tab.accent,
                },
                minWidth: 96,
              }}
            >
              <Stack direction="row" spacing={0.75} alignItems="center">
                <span>{tab.label}</span>
                {loading ? (
                  <Skeleton
                    width={18}
                    height={16}
                    sx={{
                      bgcolor: selected ? "rgba(255,255,255,0.35)" : undefined,
                    }}
                  />
                ) : (
                  <Box
                    component="span"
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      opacity: 0.9,
                      px: 0.75,
                      py: 0.1,
                      borderRadius: 1,
                      bgcolor: selected ? "rgba(255,255,255,0.22)" : `${tab.accent}18`,
                    }}
                  >
                    {tab.count}
                  </Box>
                )}
              </Stack>
            </Button>
          );
        })}
      </Box>
    </Stack>
  );
}
