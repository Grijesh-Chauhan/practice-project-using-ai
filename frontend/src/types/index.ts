/** Shared TypeScript types aligned with docs/api-contract.md. */

export type TicketStatus = "Open" | "In Progress" | "Resolved" | "Closed" | "Cancelled";

export type Priority = "low" | "medium" | "high";

export interface ApiErrorBody {
  detail: string | Array<{ loc?: unknown[]; msg: string; type?: string }>;
  code?: string;
  field?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Comment {
  id: number;
  ticket_id: number;
  message: string;
  created_by: number;
  created_at: string;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  status: TicketStatus;
  assigned_to: number | null;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface TicketDetail extends Ticket {
  comments: Comment[];
}

export interface TicketListResponse {
  items: Ticket[];
  total: number;
}

export interface TicketCreatePayload {
  title: string;
  description: string;
  priority: Priority;
  assigned_to?: number | null;
}

export interface TicketUpdatePayload {
  title?: string;
  description?: string;
  priority?: Priority;
  assigned_to?: number | null;
}

export interface TicketStatusUpdatePayload {
  status: TicketStatus;
}

export interface CommentCreatePayload {
  message: string;
}

export interface TicketListParams {
  q?: string;
  status?: TicketStatus;
  priority?: Priority;
  assigned_to?: number;
  created_by?: number;
  /** ISO datetime; tickets with created_at >= this value. */
  created_after?: string;
  skip?: number;
  limit?: number;
}

export interface StatusPriorityCount {
  status: TicketStatus;
  priority: Priority;
  count: number;
}

export interface MonthCount {
  month: string;
  count: number;
}

export interface MonthStatusCount {
  month: string;
  status: TicketStatus;
  count: number;
}

export interface TicketStats {
  by_status: Partial<Record<TicketStatus, number>>;
  by_priority: Partial<Record<Priority, number>>;
  by_status_priority: StatusPriorityCount[];
  created_by_month: MonthCount[];
  status_by_month: MonthStatusCount[];
}
