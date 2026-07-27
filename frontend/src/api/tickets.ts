import { apiClient } from "./client";
import type {
  Ticket,
  TicketCreatePayload,
  TicketDetail,
  TicketListParams,
  TicketListResponse,
  TicketStatusUpdatePayload,
  TicketUpdatePayload,
} from "../types";

export async function listTickets(
  params: TicketListParams = {},
): Promise<TicketListResponse> {
  const response = await apiClient.get<TicketListResponse>("/tickets", {
    params,
  });
  return response.data;
}

export async function getTicket(id: number): Promise<TicketDetail> {
  const response = await apiClient.get<TicketDetail>(`/tickets/${id}`);
  return response.data;
}

export async function createTicket(payload: TicketCreatePayload): Promise<Ticket> {
  const response = await apiClient.post<Ticket>("/tickets", payload);
  return response.data;
}

export async function updateTicket(
  id: number,
  payload: TicketUpdatePayload,
): Promise<Ticket> {
  const response = await apiClient.patch<Ticket>(`/tickets/${id}`, payload);
  return response.data;
}

export async function updateTicketStatus(
  id: number,
  payload: TicketStatusUpdatePayload,
): Promise<Ticket> {
  const response = await apiClient.patch<Ticket>(`/tickets/${id}/status`, payload);
  return response.data;
}

export async function exportTickets(
  params: Omit<TicketListParams, "created_by"> = {},
): Promise<Blob> {
  const response = await apiClient.get<Blob>("/tickets/export", {
    params,
    responseType: "blob",
  });
  return response.data;
}
