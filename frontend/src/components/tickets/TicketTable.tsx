import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import type { Ticket, User } from "../../types";
import { formatDate } from "../../utils/formatDate";
import { PriorityBadge } from "../common/PriorityBadge";
import { StatusBadge } from "../common/StatusBadge";

interface TicketTableProps {
  tickets: Ticket[];
  usersById: Map<number, User>;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onRowClick: (ticketId: number) => void;
}

function resolveUserName(userId: number | null, usersById: Map<number, User>): string {
  if (userId === null) {
    return "Unassigned";
  }
  return usersById.get(userId)?.name ?? `User #${userId}`;
}

export function TicketTable({
  tickets,
  usersById,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onRowClick,
}: TicketTableProps) {
  if (tickets.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary">No tickets found</Typography>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined">
      <TableContainer sx={{ overflowX: "auto" }}>
        <Table aria-label="Tickets table" size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Assignee</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Updated</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow
                key={ticket.id}
                hover
                sx={{ cursor: "pointer" }}
                onClick={() => onRowClick(ticket.id)}
              >
                <TableCell>{ticket.id}</TableCell>
                <TableCell>{ticket.title}</TableCell>
                <TableCell>
                  <StatusBadge status={ticket.status} />
                </TableCell>
                <TableCell>
                  <PriorityBadge priority={ticket.priority} />
                </TableCell>
                <TableCell>{resolveUserName(ticket.assigned_to, usersById)}</TableCell>
                <TableCell>{formatDate(ticket.created_at)}</TableCell>
                <TableCell>{formatDate(ticket.updated_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(_event, nextPage) => onPageChange(nextPage)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(event) => {
          onPageSizeChange(Number.parseInt(event.target.value, 10));
          onPageChange(0);
        }}
        rowsPerPageOptions={[10, 20, 50]}
      />
    </Paper>
  );
}
