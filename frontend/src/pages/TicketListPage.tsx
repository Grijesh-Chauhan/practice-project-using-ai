import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useEffect, useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { useNavigate, useSearchParams } from "react-router-dom";

import { getErrorMessage } from "../api/errors";
import { ErrorAlert } from "../components/common/ErrorAlert";
import { LoadingState } from "../components/common/LoadingState";
import { PageHeader } from "../components/common/PageHeader";
import {
  SearchFilters,
  type SearchFiltersValue,
} from "../components/tickets/SearchFilters";
import { StatusFilterTabs } from "../components/tickets/StatusFilterTabs";
import { TicketTable } from "../components/tickets/TicketTable";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useExportTickets } from "../hooks/useExportTickets";
import { useTicketStatusCounts } from "../hooks/useTicketStatusCounts";
import { useTickets } from "../hooks/useTickets";
import { useUsers } from "../hooks/useUsers";
import type { Priority, TicketListParams, TicketStatus } from "../types";
import {
  DATE_RANGE_OPTIONS,
  DEFAULT_DATE_RANGE,
  DEFAULT_PAGE_SIZE,
  PRIORITIES,
  SEARCH_DEBOUNCE_MS,
  TICKET_STATUSES,
  createdAfterFromPreset,
  type DateRangePreset,
} from "../utils/constants";

function parseDateRange(value: string | null): DateRangePreset {
  if (DATE_RANGE_OPTIONS.some((option) => option.value === value)) {
    return value as DateRangePreset;
  }
  return DEFAULT_DATE_RANGE;
}

function parseStatus(value: string | null): TicketStatus | "" {
  if (value && TICKET_STATUSES.includes(value as TicketStatus)) {
    return value as TicketStatus;
  }
  return "";
}

function parsePriority(value: string | null): Priority | "" {
  if (value && PRIORITIES.includes(value as Priority)) {
    return value as Priority;
  }
  return "";
}

function filtersFromSearchParams(searchParams: URLSearchParams): SearchFiltersValue {
  const assignedRaw = searchParams.get("assigned_to");
  return {
    q: searchParams.get("q") ?? "",
    status: parseStatus(searchParams.get("status")),
    priority: parsePriority(searchParams.get("priority")),
    assigned_to:
      assignedRaw && !Number.isNaN(Number(assignedRaw)) ? Number(assignedRaw) : "",
    dateRange: parseDateRange(searchParams.get("dateRange")),
  };
}

export function TicketListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<SearchFiltersValue>(() =>
    filtersFromSearchParams(searchParams),
  );
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const debouncedQuery = useDebouncedValue(filters.q, SEARCH_DEBOUNCE_MS);

  const searchKey = searchParams.toString();

  // Keep local filters in sync when navigating from the dashboard with new params.
  useEffect(() => {
    setFilters(filtersFromSearchParams(searchParams));
    setPage(0);
  }, [searchKey, searchParams]);

  const createdAfter = useMemo(
    () => createdAfterFromPreset(filters.dateRange),
    [filters.dateRange],
  );

  const listParams = useMemo<TicketListParams>(() => {
    const params: TicketListParams = {
      skip: page * pageSize,
      limit: pageSize,
    };
    if (debouncedQuery.trim()) {
      params.q = debouncedQuery.trim();
    }
    if (filters.status) {
      params.status = filters.status;
    }
    if (filters.priority) {
      params.priority = filters.priority;
    }
    if (filters.assigned_to !== "") {
      params.assigned_to = filters.assigned_to;
    }
    if (createdAfter) {
      params.created_after = createdAfter;
    }
    return params;
  }, [debouncedQuery, filters, page, pageSize, createdAfter]);

  const ticketsQuery = useTickets(listParams);
  const statusCountsQuery = useTicketStatusCounts(createdAfter);
  const usersQuery = useUsers();
  const exportMutation = useExportTickets();

  const usersById = useMemo(() => {
    const map = new Map(
      (usersQuery.data ?? []).map((user) => [user.id, user] as const),
    );
    return map;
  }, [usersQuery.data]);

  const syncUrl = (next: SearchFiltersValue) => {
    const params: Record<string, string> = {
      dateRange: next.dateRange,
    };
    if (next.q.trim()) {
      params.q = next.q.trim();
    }
    if (next.status) {
      params.status = next.status;
    }
    if (next.priority) {
      params.priority = next.priority;
    }
    if (next.assigned_to !== "") {
      params.assigned_to = String(next.assigned_to);
    }
    setSearchParams(params, { replace: true });
  };

  const handleFiltersChange = (next: SearchFiltersValue) => {
    setFilters(next);
    setPage(0);
    syncUrl(next);
  };

  const handleStatusTabChange = (status: TicketStatus | "") => {
    handleFiltersChange({ ...filters, status });
  };

  const exportParams = useMemo(() => {
    const params: Omit<TicketListParams, "created_by"> = {};
    if (debouncedQuery.trim()) {
      params.q = debouncedQuery.trim();
    }
    if (filters.status) {
      params.status = filters.status;
    }
    if (filters.priority) {
      params.priority = filters.priority;
    }
    if (filters.assigned_to !== "") {
      params.assigned_to = filters.assigned_to;
    }
    if (createdAfter) {
      params.created_after = createdAfter;
    }
    return params;
  }, [debouncedQuery, filters, createdAfter]);

  return (
    <Box>
      <PageHeader
        title="Tickets"
        subtitle="Browse, search, and manage support tickets"
        actions={
          <>
            <Button
              variant="outlined"
              startIcon={<FileDownloadOutlinedIcon />}
              onClick={() => exportMutation.mutate(exportParams)}
              disabled={exportMutation.isPending}
            >
              {exportMutation.isPending ? "Exporting…" : "Export My Tickets"}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/tickets/new")}
            >
              Create Ticket
            </Button>
          </>
        }
      />

      <StatusFilterTabs
        value={filters.status}
        onChange={handleStatusTabChange}
        counts={statusCountsQuery.data}
        loading={statusCountsQuery.isLoading}
      />

      <SearchFilters
        value={filters}
        users={usersQuery.data ?? []}
        onChange={handleFiltersChange}
      />

      {exportMutation.isError ? (
        <ErrorAlert message={getErrorMessage(exportMutation.error)} />
      ) : null}
      {exportMutation.isSuccess ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          CSV download started.
        </Alert>
      ) : null}

      {ticketsQuery.isLoading ? <LoadingState variant="table" /> : null}

      {ticketsQuery.isError ? (
        <ErrorAlert
          message={getErrorMessage(ticketsQuery.error)}
          onRetry={() => void ticketsQuery.refetch()}
        />
      ) : null}

      {ticketsQuery.data ? (
        <TicketTable
          tickets={ticketsQuery.data.items}
          usersById={usersById}
          total={ticketsQuery.data.total}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onRowClick={(id) => navigate(`/tickets/${id}`)}
        />
      ) : null}
    </Box>
  );
}
