import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0f4c5c",
    },
    secondary: {
      main: "#e36414",
    },
    background: {
      default: "#f5f7f8",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"IBM Plex Sans", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
});
