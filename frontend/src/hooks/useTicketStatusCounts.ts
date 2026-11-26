import { useQuery } from "@tanstack/react-query";

import { listTickets } from "../api/tickets";
import type { TicketStatus } from "../types";
import { TICKET_STATUSES } from "../utils/constants";
import { ticketKeys } from "./useTickets";

export type StatusCounts = Record<TicketStatus, number>;

async function fetchStatusCounts(createdAfter?: string): Promise<StatusCounts> {
  const results = await Promise.all(
    TICKET_STATUSES.map(async (status) => {
      const response = await listTickets({
        status,
        skip: 0,
        limit: 1,
        ...(createdAfter ? { created_after: createdAfter } : {}),
      });
      return [status, response.total] as const;
    }),
  );

  return Object.fromEntries(results) as StatusCounts;
}

export function useTicketStatusCounts(createdAfter?: string) {
  return useQuery({
    queryKey: ticketKeys.statusCounts(createdAfter),
    queryFn: () => fetchStatusCounts(createdAfter),
  });
}
