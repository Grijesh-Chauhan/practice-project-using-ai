import { useMutation } from "@tanstack/react-query";

import { exportTickets } from "../api/tickets";
import type { TicketListParams } from "../types";
import { downloadBlob } from "../utils/downloadBlob";

export function useExportTickets() {
  return useMutation({
    mutationFn: async (params: Omit<TicketListParams, "created_by"> = {}) => {
      const blob = await exportTickets(params);
      downloadBlob(blob, "my-tickets.csv");
      return blob;
    },
  });
}
