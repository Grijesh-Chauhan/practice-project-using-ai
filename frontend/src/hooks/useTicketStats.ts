import { useQuery } from "@tanstack/react-query";

import { getTicketStats } from "../api/tickets";
import type { TicketListParams } from "../types";
import { ticketKeys } from "./useTickets";

export type TicketStatsParams = Omit<TicketListParams, "skip" | "limit">;

export function useTicketStats(params: TicketStatsParams = {}) {
  return useQuery({
    queryKey: ticketKeys.stats(params),
    queryFn: () => getTicketStats(params),
  });
}
