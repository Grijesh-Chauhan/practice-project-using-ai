import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { TicketStats } from "../../types";
import { PRIORITIES, TICKET_STATUSES } from "../../utils/constants";
import { STATUS_STYLE } from "../../utils/statusStyles";

const PRIORITY_COLORS: Record<string, string> = {
  low: "#78909c",
  medium: "#0288d1",
  high: "#d32f2f",
};

interface TicketChartsProps {
  stats?: TicketStats;
  loading?: boolean;
}

function toQuarter(month: string): string {
  const [year, monthPart] = month.split("-");
  const quarter = Math.ceil(Number(monthPart) / 3);
  return `${year}-Q${quarter}`;
}

export function TicketCharts({ stats, loading = false }: TicketChartsProps) {
  const priorityVsStatus = useMemo(() => {
    if (!stats) {
      return [];
    }
    return PRIORITIES.map((priority) => {
      const row: Record<string, string | number> = { priority };
      for (const status of TICKET_STATUSES) {
        const match = stats.by_status_priority.find(
          (cell) => cell.priority === priority && cell.status === status,
        );
        row[status] = match?.count ?? 0;
      }
      return row;
    });
  }, [stats]);

  const statusOverTime = useMemo(() => {
    if (!stats) {
      return [];
    }
    const useQuarter = stats.status_by_month.length > 24;
    const bucket = new Map<string, Record<string, string | number>>();

    for (const row of stats.status_by_month) {
      const key = useQuarter ? toQuarter(row.month) : row.month;
      const current = bucket.get(key) ?? { period: key };
      current[row.status] = Number(current[row.status] ?? 0) + row.count;
      bucket.set(key, current);
    }

    return Array.from(bucket.values()).map((row) => {
      const next = { ...row };
      for (const status of TICKET_STATUSES) {
        if (next[status] === undefined) {
          next[status] = 0;
        }
      }
      return next;
    });
  }, [stats]);

  const createdOverTime = useMemo(() => {
    if (!stats) {
      return [];
    }
    const useQuarter = stats.created_by_month.length > 24;
    if (!useQuarter) {
      return stats.created_by_month.map((row) => ({
        period: row.month,
        created: row.count,
      }));
    }

    const bucket = new Map<string, number>();
    for (const row of stats.created_by_month) {
      const key = toQuarter(row.month);
      bucket.set(key, (bucket.get(key) ?? 0) + row.count);
    }
    return Array.from(bucket.entries()).map(([period, created]) => ({
      period,
      created,
    }));
  }, [stats]);

  if (loading) {
    return (
      <Paper variant="outlined" sx={{ p: 2, mt: 3 }} aria-label="Ticket charts loading">
        <Skeleton variant="rectangular" height={280} />
      </Paper>
    );
  }

  if (!stats) {
    return null;
  }

  const empty =
    Object.values(stats.by_status).reduce((sum, value) => sum + (value ?? 0), 0) === 0;

  if (empty) {
    return (
      <Paper variant="outlined" sx={{ p: 3, mt: 3, textAlign: "center" }}>
        <Typography color="text.secondary">
          No chart data for the selected date range.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ mt: 3 }} aria-label="Ticket analytics charts">
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        Analytics
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Priority vs status
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              How priorities break down across ticket statuses in this timeframe.
            </Typography>
            <Box sx={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <BarChart
                  data={priorityVsStatus}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="priority" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  {TICKET_STATUSES.map((status) => (
                    <Bar
                      key={status}
                      dataKey={status}
                      stackId="status"
                      fill={STATUS_STYLE[status].accent}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Status mix over time
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Tickets created in each period, shown by their current status (Closed /
              Open / etc.).
            </Typography>
            <Box sx={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <BarChart
                  data={statusOverTime}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" interval="preserveStartEnd" minTickGap={28} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  {TICKET_STATUSES.map((status) => (
                    <Bar
                      key={status}
                      dataKey={status}
                      stackId="timeline"
                      fill={STATUS_STYLE[status].accent}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Tickets created over time
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Volume of new tickets opened during the selected timeframe.
            </Typography>
            <Box sx={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <LineChart
                  data={createdOverTime}
                  margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" interval="preserveStartEnd" minTickGap={28} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="created"
                    name="Created"
                    stroke={PRIORITY_COLORS.medium}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
