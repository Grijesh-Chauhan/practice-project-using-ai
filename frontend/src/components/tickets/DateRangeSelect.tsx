import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";

import { DATE_RANGE_OPTIONS, type DateRangePreset } from "../../utils/constants";

interface DateRangeSelectProps {
  value: DateRangePreset;
  onChange: (next: DateRangePreset) => void;
  /** Unique suffix so counts + list dropdowns don't clash on label ids. */
  idPrefix?: string;
  fullWidth?: boolean;
  size?: "small" | "medium";
  sx?: object;
}

export function DateRangeSelect({
  value,
  onChange,
  idPrefix = "date-range",
  fullWidth = true,
  size = "small",
  sx,
}: DateRangeSelectProps) {
  const labelId = `${idPrefix}-label`;

  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value as DateRangePreset);
  };

  return (
    <FormControl size={size} fullWidth={fullWidth} sx={sx}>
      <InputLabel id={labelId}>Date range</InputLabel>
      <Select
        labelId={labelId}
        label="Date range"
        value={value}
        onChange={handleChange}
        inputProps={{ "aria-label": "Filter by date range" }}
      >
        {DATE_RANGE_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
