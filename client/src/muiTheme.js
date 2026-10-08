import { createTheme } from "@mui/material/styles";

// Dark theme matching index.css's design tokens, scoped to MUI X components
// (currently just the DateTimePicker) so they don't clash with the
// hand-matched Tailwind theme used everywhere else.
const muiDarkTheme = createTheme({
  palette: {
    mode: "dark",
    background: { paper: "#161b22", default: "#0d1117" },
    primary: { main: "#2f81f7" },
    text: { primary: "#e6edf3", secondary: "#8b949e" },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#0d1117",
          color: "#e6edf3",
          "& fieldset": { borderColor: "#30363d" },
          "&:hover fieldset": { borderColor: "#484f58" },
          "&.Mui-focused fieldset": { borderColor: "#2f81f7" },
        },
        input: { padding: "10px 12px" },
      },
    },
    MuiSvgIcon: { styleOverrides: { root: { color: "#8b949e" } } },
    MuiPaper: { styleOverrides: { root: { backgroundColor: "#161b22" } } },
  },
});

export default muiDarkTheme;
