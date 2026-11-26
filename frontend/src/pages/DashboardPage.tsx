import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { useMemo, useState } from "react";
import { createSearchParams, useNavigate } from "react-router-dom";

import { getErrorMessage } from "../api/errors";
import { ErrorAlert } from "../components/common/ErrorAlert";
import { PageHeader } from "../components/common/PageHeader";
import { StatusCountsPanel } from "../components/tickets/StatusCountsPanel";
import { TicketCharts } from "../components/tickets/TicketCharts";
import { useTicketStatusCounts } from "../hooks/useTicketStatusCounts";
import { useTicketStats } from "../hooks/useTicketStats";
import type { TicketStatus } from "../types";
import {
  DEFAULT_DATE_RANGE,
  createdAfterFromPreset,
  type DateRangePreset,
} from "../utils/constants";

export function DashboardPage() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRangePreset>(DEFAULT_DATE_RANGE);

  const createdAfter = useMemo(() => createdAfterFromPreset(dateRange), [dateRange]);

  const statsParams = useMemo(
    () => (createdAfter ? { created_after: createdAfter } : {}),
    [createdAfter],
  );

  const statusCountsQuery = useTicketStatusCounts(createdAfter);
  const statsQuery = useTicketStats(statsParams);

  const openListing = (status: TicketStatus | "") => {
    const params: Record<string, string> = { dateRange };
    if (status) {
      params.status = status;
    }
    void navigate({
      pathname: "/tickets",
      search: `?${createSearchParams(params).toString()}`,
    });
  };

  return (
    <Box>
      <PageHeader
        title="Dashboard"
        subtitle="Status overview and trends for the selected timeframe"
      />

      <Stack spacing={3}>
        {statusCountsQuery.isError ? (
          <ErrorAlert
            message={getErrorMessage(statusCountsQuery.error)}
            onRetry={() => void statusCountsQuery.refetch()}
          />
        ) : null}

        <StatusCountsPanel
          variant="dashboard"
          counts={statusCountsQuery.data}
          loading={statusCountsQuery.isLoading}
          onSelectStatus={openListing}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />

        {statsQuery.isError ? (
          <ErrorAlert
            message={getErrorMessage(statsQuery.error)}
            onRetry={() => void statsQuery.refetch()}
          />
        ) : null}

        <TicketCharts stats={statsQuery.data} loading={statsQuery.isLoading} />
      </Stack>
    </Box>
  );
}
