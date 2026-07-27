import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import { useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { useNavigate } from "react-router-dom";

import { getErrorMessage } from "../api/errors";
import { ErrorAlert } from "../components/common/ErrorAlert";
import { LoadingState } from "../components/common/LoadingState";
import { PageHeader } from "../components/common/PageHeader";
import {
  SearchFilters,
  type SearchFiltersValue,
} from "../components/tickets/SearchFilters";
import { TicketTable } from "../components/tickets/TicketTable";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useExportTickets } from "../hooks/useExportTickets";
import { useTickets } from "../hooks/useTickets";
import { useUsers } from "../hooks/useUsers";
import type { TicketListParams } from "../types";
import { DEFAULT_PAGE_SIZE, SEARCH_DEBOUNCE_MS } from "../utils/constants";

const initialFilters: SearchFiltersValue = {
  q: "",
  status: "",
  priority: "",
  assigned_to: "",
};

export function TicketListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<SearchFiltersValue>(initialFilters);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const debouncedQuery = useDebouncedValue(filters.q, SEARCH_DEBOUNCE_MS);

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
    return params;
  }, [debouncedQuery, filters, page, pageSize]);

  const ticketsQuery = useTickets(listParams);
  const usersQuery = useUsers();
  const exportMutation = useExportTickets();

  const usersById = useMemo(() => {
    const map = new Map(
      (usersQuery.data ?? []).map((user) => [user.id, user] as const),
    );
    return map;
  }, [usersQuery.data]);

  const handleFiltersChange = (next: SearchFiltersValue) => {
    setFilters(next);
    setPage(0);
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
    return params;
  }, [debouncedQuery, filters]);

  return (
    <>
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
    </>
  );
}
