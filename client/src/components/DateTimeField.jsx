import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { ThemeProvider } from "@mui/material/styles";
import Popper from "@mui/material/Popper";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Paper from "@mui/material/Paper";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { TimeField } from "@mui/x-date-pickers/TimeField";
import { Calendar, Clock } from "lucide-react";
import muiDarkTheme from "../muiTheme.js";

function pad(n) {
  return String(n).padStart(2, "0");
}

function toLocalInputValue(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDisplay(date) {
  return date.toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// `value`/`onChange` keep the same "YYYY-MM-DDTHH:mm" local string shape the
// rest of PublishModal.jsx already uses — only the picker UI changed.
// Calendar grid is MUI's DateCalendar; time is a plain typeable text input
// (not MUI's clock/scroll view) matching the Claude Design mock.
function DateTimeField({
  value,
  onChange,
  minDate,
  maxDate,
  error,
  errorMessage,
  openDirection = "below",
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [shake, setShake] = useState(false);
  const prevValueRef = useRef(value);
  const date = value ? new Date(value) : null;
  const open = Boolean(anchorEl);
  const minTime =
    minDate && date && dayjs(date).isSame(dayjs(minDate), "day")
      ? dayjs(minDate)
      : undefined;
  const maxTime =
    maxDate && date && dayjs(date).isSame(dayjs(maxDate), "day")
      ? dayjs(maxDate)
      : undefined;

  useEffect(() => {
    if (error && value !== prevValueRef.current) {
      setShake(true);
    }
    prevValueRef.current = value;
  }, [value, error]);

  useEffect(() => {
    if (!open) return;
    // Popper uses strategy="fixed", so it stays pinned to the viewport
    // instead of tracking the trigger field as the modal's own content
    // scrolls underneath it — closing on scroll avoids it visually
    // drifting away from the field. Scroll events don't bubble, so this
    // has to listen in the capture phase to catch scrolling on any
    // ancestor scroll container (the modal's ScrollBox), not just window.
    function handleScroll() {
      setAnchorEl(null);
    }
    document.addEventListener("scroll", handleScroll, true);
    return () => document.removeEventListener("scroll", handleScroll, true);
  }, [open]);

  function handleDaySelect(newValue) {
    if (!newValue) return;
    const next = newValue.toDate();
    if (date) {
      next.setHours(date.getHours(), date.getMinutes(), 0, 0);
    } else {
      next.setHours(12, 0, 0, 0);
    }
    onChange(toLocalInputValue(next));
  }

  function handleTimeChange(newValue) {
    if (!newValue || !newValue.isValid()) return;
    const next = date ? new Date(date) : new Date();
    next.setHours(newValue.hour(), newValue.minute(), 0, 0);
    onChange(toLocalInputValue(next));
  }

  function handleMeridiemChange(meridiem) {
    const next = date ? new Date(date) : new Date();
    const isPM = next.getHours() >= 12;
    if (meridiem === "AM" && isPM) next.setHours(next.getHours() - 12);
    if (meridiem === "PM" && !isPM) next.setHours(next.getHours() + 12);
    onChange(toLocalInputValue(next));
  }

  return (
    <ThemeProvider theme={muiDarkTheme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <button
          type="button"
          onClick={(e) => setAnchorEl(open ? null : e.currentTarget)}
          className={`w-full flex items-center gap-2.5 bg-bg-primary border text-text-primary text-sm pl-3 pr-3 py-2.5 rounded-lg outline-none transition-colors focus-visible:border-accent-blue text-left ${
            open
              ? "border-accent-blue"
              : error
                ? "border-accent-red hover:border-accent-red"
                : "border-border-muted hover:border-border-hover"
          }`}
        >
          <Calendar size={16} className="text-text-primary flex-none" />
          <span className={date ? "" : "text-text-muted"}>
            {date ? formatDisplay(date) : "Select date & time"}
          </span>
        </button>
        <Popper
          open={open}
          anchorEl={anchorEl}
          placement={openDirection === "above" ? "top-start" : "bottom-start"}
          strategy="fixed"
          style={{ zIndex: 50 }}
          modifiers={[
            { name: "offset", options: { offset: [0, 6] } },
            {
              name: "preventOverflow",
              options: { padding: 8, boundary: "viewport", rootBoundary: "viewport", altAxis: true },
            },
            {
              // Forcing one fixed side (via `openDirection`) isn't always
              // safe on its own — e.g. "Ends at" forced "above" still runs
              // out of room when the field itself has scrolled near the
              // top of a short mobile viewport. Flip gives preventOverflow
              // a real fallback (the opposite side) before it resorts to
              // just clamping/overlapping the trigger in place.
              name: "flip",
              options: {
                fallbackPlacements: [
                  openDirection === "above" ? "bottom-start" : "top-start",
                ],
                boundary: "viewport",
                rootBoundary: "viewport",
                padding: 8,
              },
            },
          ]}
        >
          <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
            <Paper className="bg-bg-panel! border border-border-muted rounded-xl">
              <DateCalendar
                value={date ? dayjs(date) : null}
                onChange={handleDaySelect}
                minDate={minDate ? dayjs(minDate) : undefined}
                maxDate={maxDate ? dayjs(maxDate) : undefined}
                views={["day"]}
                sx={{
                  height: "auto",
                  // Grid columns are 1fr of this width, and nothing else
                  // constrains it otherwise — the day-grid would stretch to
                  // match whatever's widest in the Paper (the "<
                  // October 2026 >" header row), spacing the day columns
                  // out further than the cells themselves need.
                  width: 232,
                  paddingBottom: "12px",
                  // Real MUI class is "MuiPickerDay" (no "s") — its default
                  // size/shape come from a --PickerDay-size CSS var with
                  // borderRadius: calc(var(--PickerDay-size) / 2), which is
                  // always a circle regardless of size; both are overridden
                  // directly here to get a square instead.
                  "& .MuiPickerDay-root": {
                    "--PickerDay-size": "24px",
                    width: 24,
                    height: 24,
                    fontSize: "0.7rem",
                    borderRadius: "6px",
                  },
                  "& .MuiDayCalendar-weekDayLabel": { width: 24, height: 24 },
                  // MUI always reserves room for 6 week rows (so switching
                  // months doesn't jump the layout), but its default
                  // reservation is based on the stock 36px day size — with
                  // our 24px cells that left a large dead gap below a
                  // 5-row month. Reserving 6 × 24px instead keeps the
                  // no-jump behavior without the excess empty space.
                  "& .MuiDayCalendar-slideTransition": { minHeight: 144 },
                  // Grid (not MUI's default flex+margin) guarantees the
                  // weekday-label row and every day row share the exact
                  // same 7 column positions — flex+centering let them
                  // drift out of alignment with each other.
                  "& .MuiDayCalendar-header": {
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    justifyItems: "center",
                    marginBottom: 0,
                  },
                  "& .MuiDayCalendar-weekContainer": {
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    justifyItems: "center",
                    margin: 0,
                  },
                  "& .MuiPickersCalendarHeader-root": {
                    minHeight: 28,
                    maxHeight: "none",
                    marginTop: "2px",
                    marginBottom: "2px",
                    paddingLeft: "12px",
                    paddingRight: "8px",
                  },
                }}
              />
              <div
                className={`flex items-center gap-2.5 border-t border-border-muted px-4 py-2.5 -mt-2 ${shake ? "shake" : ""}`}
                onAnimationEnd={() => setShake(false)}
              >
                <span className="flex items-center gap-1.5 text-text-muted text-[11px] font-semibold uppercase tracking-wide flex-none">
                  <Clock size={13} />
                  Time
                </span>
                <TimeField
                  value={date ? dayjs(date) : null}
                  onChange={handleTimeChange}
                  format="hh:mm"
                  minTime={minTime}
                  maxTime={maxTime}
                  error={error}
                  size="small"
                  className="w-[78px] flex-none"
                  sx={{
                    "& .MuiOutlinedInput-root": { height: 38 },
                    "& .MuiPickersSectionList-root": {
                      justifyContent: "center",
                      width: "100%",
                    },
                  }}
                />
                <div className="flex gap-1 flex-none">
                  {["AM", "PM"].map((meridiem) => {
                    const active = date
                      ? (date.getHours() >= 12 ? "PM" : "AM") === meridiem
                      : false;
                    return (
                      <button
                        key={meridiem}
                        type="button"
                        onClick={() => handleMeridiemChange(meridiem)}
                        className={`px-2.5 h-[38px] rounded-md border text-xs font-semibold transition-colors ${
                          active
                            ? "bg-accent-blue border-accent-blue text-white"
                            : "border-border-muted hover:border-white text-text-muted"
                        }`}
                      >
                        {meridiem}
                      </button>
                    );
                  })}
                </div>
              </div>
              {error && errorMessage && (
                <p className="text-accent-red text-xs px-4 pb-2">{errorMessage}</p>
              )}
            </Paper>
          </ClickAwayListener>
        </Popper>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default DateTimeField;

// `openDirection` ("below" default | "above") forces which side the popup
// opens on, instead of letting Popper decide — used for fields positioned
// low in a form (e.g. "Ends at") where opening below would frequently run
// out of room.
// Used by: components/PublishModal.jsx.
