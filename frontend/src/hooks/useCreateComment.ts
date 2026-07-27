import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createComment } from "../api/comments";
import type { CommentCreatePayload } from "../types";
import { ticketKeys } from "./useTickets";

export function useCreateComment(ticketId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CommentCreatePayload) => createComment(ticketId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ticketKeys.detail(ticketId),
      });
    },
  });
}
