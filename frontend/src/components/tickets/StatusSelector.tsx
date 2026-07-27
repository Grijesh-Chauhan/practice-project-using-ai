import Alert from "@mui/material/Alert";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { SelectChangeEvent } from "@mui/material/Select";

import type { TicketStatus } from "../../types";
import { getAllowedNextStatuses } from "../../utils/statusTransitions";

interface StatusSelectorProps {
  currentStatus: TicketStatus;
  onChange: (status: TicketStatus) => void;
  isUpdating?: boolean;
  errorMessage?: string | null;
}

export function StatusSelector({
  currentStatus,
  onChange,
  isUpdating = false,
  errorMessage,
}: StatusSelectorProps) {
  const options = getAllowedNextStatuses(currentStatus);
  const isTerminal = options.length === 0;

  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value as TicketStatus);
  };

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle1" component="h2">
        Status
      </Typography>
      {isTerminal ? (
        <Alert severity="info">
          This ticket is {currentStatus}. No further status changes are allowed.
        </Alert>
      ) : (
        <FormControl size="small" sx={{ maxWidth: 280 }} disabled={isUpdating}>
          <InputLabel id="status-transition-label">Change status to</InputLabel>
          <Select
            labelId="status-transition-label"
            label="Change status to"
            value=""
            onChange={handleChange}
            displayEmpty
          >
            <MenuItem value="" disabled>
              Select next status…
            </MenuItem>
            {options.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
    </Stack>
  );
}
