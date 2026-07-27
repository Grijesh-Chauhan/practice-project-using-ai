import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateTicketStatus } from "../api/tickets";
import type { TicketStatus } from "../types";
import { ticketKeys } from "./useTickets";

export function useUpdateTicketStatus(ticketId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: TicketStatus) => updateTicketStatus(ticketId, { status }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: ticketKeys.detail(ticketId),
      });
    },
  });
}
