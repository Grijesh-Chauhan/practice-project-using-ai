import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createTicket } from "../api/tickets";
import type { TicketCreatePayload } from "../types";
import { ticketKeys } from "./useTickets";

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TicketCreatePayload) => createTicket(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
    },
  });
}
