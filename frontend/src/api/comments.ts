import { apiClient } from "./client";
import type { Comment, CommentCreatePayload } from "../types";

export async function createComment(
  ticketId: number,
  payload: CommentCreatePayload,
): Promise<Comment> {
  const response = await apiClient.post<Comment>(
    `/tickets/${ticketId}/comments`,
    payload,
  );
  return response.data;
}
