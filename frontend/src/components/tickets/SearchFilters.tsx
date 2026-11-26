import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import type { SelectChangeEvent } from "@mui/material/Select";

import type { Priority, TicketStatus, User } from "../../types";
import { PRIORITIES, type DateRangePreset } from "../../utils/constants";
import { DateRangeSelect } from "./DateRangeSelect";

export interface SearchFiltersValue {
  q: string;
  status: TicketStatus | "";
  priority: Priority | "";
  assigned_to: number | "";
  dateRange: DateRangePreset;
}

interface SearchFiltersProps {
  value: SearchFiltersValue;
  users: User[];
  onChange: (next: SearchFiltersValue) => void;
}

/** Search + priority/assignee/date filters. Status is handled by StatusFilterTabs. */
export function SearchFilters({ value, users, onChange }: SearchFiltersProps) {
  const handlePriorityChange = (event: SelectChangeEvent) => {
    onChange({
      ...value,
      priority: event.target.value as Priority | "",
    });
  };

  const handleAssigneeChange = (event: SelectChangeEvent) => {
    const raw = event.target.value;
    onChange({
      ...value,
      assigned_to: raw === "" ? "" : Number(raw),
    });
  };

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={2}
      sx={{ mb: 2 }}
      useFlexGap
    >
      <TextField
        label="Search"
        placeholder="Search title or description…"
        value={value.q}
        onChange={(event) => onChange({ ...value, q: event.target.value })}
        fullWidth
        size="small"
        inputProps={{ "aria-label": "Search tickets" }}
      />
      <DateRangeSelect
        value={value.dateRange}
        onChange={(dateRange) => onChange({ ...value, dateRange })}
        idPrefix="list-date-range"
        fullWidth={false}
        sx={{ minWidth: 180 }}
      />
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel id="filter-priority-label">Priority</InputLabel>
        <Select
          labelId="filter-priority-label"
          label="Priority"
          value={value.priority}
          onChange={handlePriorityChange}
        >
          <MenuItem value="">All</MenuItem>
          {PRIORITIES.map((priority) => (
            <MenuItem key={priority} value={priority}>
              {priority}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel id="filter-assignee-label">Assignee</InputLabel>
        <Select
          labelId="filter-assignee-label"
          label="Assignee"
          value={value.assigned_to === "" ? "" : String(value.assigned_to)}
          onChange={handleAssigneeChange}
        >
          <MenuItem value="">All</MenuItem>
          {users.map((user) => (
            <MenuItem key={user.id} value={String(user.id)}>
              {user.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}
