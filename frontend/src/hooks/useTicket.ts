import { useQuery } from "@tanstack/react-query";

import { getTicket } from "../api/tickets";
import { ticketKeys } from "./useTickets";

export function useTicket(id: number | undefined) {
  return useQuery({
    queryKey: ticketKeys.detail(id ?? 0),
    queryFn: () => getTicket(id as number),
    enabled: typeof id === "number" && Number.isFinite(id) && id > 0,
  });
}
