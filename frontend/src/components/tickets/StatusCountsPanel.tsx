import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import type { StatusCounts } from "../../hooks/useTicketStatusCounts";
import type { TicketStatus } from "../../types";
import { TICKET_STATUSES, type DateRangePreset } from "../../utils/constants";
import { ALL_COUNT_STYLE, STATUS_STYLE } from "../../utils/statusStyles";
import { DateRangeSelect } from "./DateRangeSelect";

interface StatusCountsPanelProps {
  counts?: StatusCounts;
  loading?: boolean;
  selectedStatus?: TicketStatus | "" | null;
  /** Called with a status, or "" for the All box. */
  onSelectStatus?: (status: TicketStatus | "") => void;
  dateRange: DateRangePreset;
  onDateRangeChange: (next: DateRangePreset) => void;
  /** Dashboard = wide grid; sidebar = narrow column (legacy). */
  variant?: "dashboard" | "sidebar";
  showDateRange?: boolean;
}

interface CountBoxProps {
  label: string;
  count: number;
  loading: boolean;
  selected: boolean;
  accent: string;
  gradient: string;
  text: string;
  onClick?: () => void;
}

function CountBox({
  label,
  count,
  loading,
  selected,
  accent,
  gradient,
  text,
  onClick,
}: CountBoxProps) {
  return (
    <Box
      component={onClick ? "button" : "div"}
      type={onClick ? "button" : undefined}
      onClick={onClick}
      aria-pressed={onClick ? selected : undefined}
      aria-label={`${label}: ${count} tickets`}
      sx={{
        display: "block",
        width: "100%",
        textAlign: "left",
        border: selected ? "2px solid rgba(255,255,255,0.95)" : "1px solid transparent",
        outline: selected ? `2px solid ${accent}` : "none",
        outlineOffset: 1,
        borderRadius: 1.5,
        backgroundImage: gradient,
        backgroundColor: accent,
        color: text,
        px: 1.75,
        py: 1.5,
        cursor: onClick ? "pointer" : "default",
        font: "inherit",
        boxShadow: selected
          ? "0 4px 12px rgba(0, 0, 0, 0.22)"
          : "0 2px 6px rgba(0, 0, 0, 0.14)",
        transition:
          "transform 0.15s ease, box-shadow 0.15s ease, outline-color 0.15s ease",
        "&:hover": onClick
          ? {
              transform: "translateY(-1px)",
              boxShadow: "0 4px 14px rgba(0, 0, 0, 0.2)",
            }
          : undefined,
      }}
    >
      <Typography
        variant="caption"
        display="block"
        sx={{ color: "rgba(255, 255, 255, 0.9)", fontWeight: 600 }}
      >
        {label}
      </Typography>
      {loading ? (
        <Skeleton width={36} height={32} sx={{ bgcolor: "rgba(255,255,255,0.35)" }} />
      ) : (
        <Typography variant="h5" fontWeight={700} lineHeight={1.2} sx={{ color: text }}>
          {count}
        </Typography>
      )}
    </Box>
  );
}

export function StatusCountsPanel({
  counts,
  loading = false,
  selectedStatus = null,
  onSelectStatus,
  dateRange,
  onDateRangeChange,
  variant = "dashboard",
  showDateRange = true,
}: StatusCountsPanelProps) {
  const total = counts
    ? TICKET_STATUSES.reduce((sum, status) => sum + counts[status], 0)
    : 0;

  const isDashboard = variant === "dashboard";

  return (
    <Paper
      variant="outlined"
      component="section"
      aria-label="Ticket status counts"
      sx={{
        p: 2,
        width: "100%",
        bgcolor: "background.paper",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ sm: "center" }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          Counts
        </Typography>
        {showDateRange ? (
          <DateRangeSelect
            value={dateRange}
            onChange={onDateRangeChange}
            idPrefix="counts-date-range"
            fullWidth={false}
            sx={{ minWidth: 180 }}
          />
        ) : null}
      </Stack>

      <Box
        sx={
          isDashboard
            ? {
                display: "grid",
                gap: 1.5,
                gridTemplateColumns: {
                  xs: "repeat(2, 1fr)",
                  sm: "repeat(3, 1fr)",
                  md: "repeat(6, 1fr)",
                },
              }
            : undefined
        }
      >
        {isDashboard ? (
          <>
            <CountBox
              label="All"
              count={total}
              loading={loading}
              selected={selectedStatus === ""}
              accent={ALL_COUNT_STYLE.accent}
              gradient={ALL_COUNT_STYLE.gradient}
              text={ALL_COUNT_STYLE.text}
              onClick={onSelectStatus ? () => onSelectStatus("") : undefined}
            />
            {TICKET_STATUSES.map((status) => {
              const style = STATUS_STYLE[status];
              return (
                <CountBox
                  key={status}
                  label={status}
                  count={counts?.[status] ?? 0}
                  loading={loading}
                  selected={selectedStatus === status}
                  accent={style.accent}
                  gradient={style.gradient}
                  text={style.text}
                  onClick={onSelectStatus ? () => onSelectStatus(status) : undefined}
                />
              );
            })}
          </>
        ) : (
          <Stack spacing={1.25}>
            <CountBox
              label="All"
              count={total}
              loading={loading}
              selected={selectedStatus === ""}
              accent={ALL_COUNT_STYLE.accent}
              gradient={ALL_COUNT_STYLE.gradient}
              text={ALL_COUNT_STYLE.text}
              onClick={onSelectStatus ? () => onSelectStatus("") : undefined}
            />
            {TICKET_STATUSES.map((status) => {
              const style = STATUS_STYLE[status];
              return (
                <CountBox
                  key={status}
                  label={status}
                  count={counts?.[status] ?? 0}
                  loading={loading}
                  selected={selectedStatus === status}
                  accent={style.accent}
                  gradient={style.gradient}
                  text={style.text}
                  onClick={onSelectStatus ? () => onSelectStatus(status) : undefined}
                />
              );
            })}
          </Stack>
        )}
      </Box>
    </Paper>
  );
}
