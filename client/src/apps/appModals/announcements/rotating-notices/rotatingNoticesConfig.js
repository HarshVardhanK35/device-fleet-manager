// Non-component pieces shared with announcements-modal.jsx's template
// registry — split out of RotatingNoticesSettings.jsx because a file mixing
// component + non-component exports breaks React Fast Refresh (eslint
// react-refresh/only-export-components).

// Blank board — used for every "Add board" click (board 2, 3, ...). Only
// the very first board (see ROTATING_NOTICES_INITIAL_FORM below) starts
// prefilled with sample copy; boards added afterward start empty like any
// other new item.
export function newBoard() {
  return {
    id: crypto.randomUUID(),
    tierWithTwo: "None",
    urgent: [""],
    warning: [""],
    info: [""],
    duration: 10,
  };
}

// The one and only prefilled board — real sample copy instead of blank
// fields, so a brand-new Announcements tile shows something sensible right
// away, and matches the Announcements app's own DEFAULT_CONFIG when opened
// standalone. Only used for board 1 on initial form load, never for
// "Add board" (see newBoard() above).
function firstBoard() {
  return {
    ...newBoard(),
    urgent: ["Fire alarm test at 2:00 PM — no evacuation needed"],
    warning: ["Wet floors in the east corridor until 11:00 AM"],
    info: ["Guest Wi-Fi: LobbyGuest · password at the front desk"],
  };
}

export const ROTATING_NOTICES_INITIAL_FORM = {
  template: "rotating-notices",
  theme: "dark",
  font: "Inter",
  boards: [firstBoard()],
  staggeredEntrance: true,
  urgentGlowPulse: true,
  newTagDuration: "10 min",
  urgentRealertInterval: "2 min",
  criticalMode: false,
  reduceMotion: false,
  audio: "None",
};

// Total on-screen time = every board's own duration added up (the widget
// rotates through all boards once per cycle) — same idea as rss-modal.jsx's
// item-count-based computeDuration.
export function computeRotatingNoticesDuration(form) {
  return form.boards.reduce((sum, b) => sum + b.duration, 0) * 1000;
}
