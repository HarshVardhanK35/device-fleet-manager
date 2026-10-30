// Non-component pieces shared with announcements-modal.jsx's template
// registry — split out of RotatingNoticesSettings.jsx because a file mixing
// component + non-component exports breaks React Fast Refresh (eslint
// react-refresh/only-export-components).

export const MAX_BOARDS = 3;
// Editor-only label so the user can tell boards apart — never shown on the
// signage screen.
export const BOARD_NAME_CAP = 30;
export const MESSAGE_CAPS = { urgent: 60, warning: 80, info: 100 };

// Blank board — used for every "Add board" click. One message per tier
// (Urgent / Warning / Info), no second "peer" message.
export function newBoard() {
  return {
    id: crypto.randomUUID(),
    name: "",
    urgent: "",
    warning: "",
    info: "",
    duration: 10,
  };
}

export const ROTATING_NOTICES_INITIAL_FORM = {
  template: "rotating-notices",
  theme: "dark",
  font: "Inter",
  boards: [],
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
// item-count-based computeDuration. An empty list falls back to one board's
// default so the saved content never has a zero duration.
export function computeRotatingNoticesDuration(form) {
  const total = form.boards.reduce((sum, b) => sum + b.duration, 0);
  return (total || 10) * 1000;
}
