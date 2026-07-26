import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import Typography from "@mui/material/Typography";

interface PlaceholderPanelProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function PlaceholderPanel({
  title,
  description,
  action,
}: PlaceholderPanelProps) {
  return (
    <Box
      sx={{
        border: "1px dashed",
        borderColor: "divider",
        borderRadius: 2,
        p: 3,
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography color="text.secondary" paragraph>
        {description}
      </Typography>
      {action}
    </Box>
  );
}
