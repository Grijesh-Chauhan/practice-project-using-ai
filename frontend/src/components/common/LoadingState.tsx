import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";

interface LoadingStateProps {
  variant?: "spinner" | "table" | "detail";
  label?: string;
}

export function LoadingState({
  variant = "spinner",
  label = "Loading…",
}: LoadingStateProps) {
  if (variant === "table") {
    return (
      <Stack spacing={1} aria-label={label}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} variant="rounded" height={44} />
        ))}
      </Stack>
    );
  }

  if (variant === "detail") {
    return (
      <Stack spacing={2} aria-label={label}>
        <Skeleton variant="text" width="60%" height={40} />
        <Skeleton variant="rounded" height={120} />
        <Skeleton variant="rounded" height={80} />
      </Stack>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        py: 6,
      }}
      role="status"
      aria-label={label}
    >
      <CircularProgress />
    </Box>
  );
}
