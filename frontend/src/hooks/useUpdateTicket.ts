import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateTicket } from "../api/tickets";
import type { TicketUpdatePayload } from "../types";
import { ticketKeys } from "./useTickets";

export function useUpdateTicket(ticketId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TicketUpdatePayload) => updateTicket(ticketId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: ticketKeys.detail(ticketId),
      });
    },
  });
}
