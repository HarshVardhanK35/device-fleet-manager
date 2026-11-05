// Labels, wording and badge colours for Feedback (the admin inbox and the
// user's own page). Values follow the Direction A design spec.
export const FEEDBACK_LIMIT = 5; // messages per account in total (the server enforces it)
export const FEEDBACK_MESSAGE_MAX = 500;
export const FEEDBACK_REPLY_MAX = 300;
export const FEEDBACK_EMAIL = "hello@castwise.site";

export const TYPE_LABEL = { issue: "Issue", suggestion: "Suggestion", other: "Other" };

export const STATUS_LABEL = {
  sent: "Sent",
  seen: "Seen",
  "in-progress": "In progress",
  done: "Done",
  "not-planned": "Not planned",
};

// Filter chips in the admin inbox ("New" is the Sent status).
export const INBOX_CHIPS = [
  ["all", "All"],
  ["sent", "New"],
  ["seen", "Seen"],
  ["in-progress", "In progress"],
  ["done", "Done"],
  ["not-planned", "Not planned"],
];

// What a user is told about each status.
export const STATUS_EXPLAIN = {
  sent: "Waiting for the admin to read it.",
  seen: "The admin has read your message.",
  "in-progress": "The admin is working on it.",
  done: "This has been handled.",
  "not-planned": "This isn't planned for now. The reason is below.",
};

// Badge colours (dark theme): fill, text and dot.
export const STATUS_STYLE = {
  sent: { bg: "bg-[rgba(139,148,158,.14)]", fg: "text-[#c9d1d9]", dot: "bg-[#8b949e]" },
  seen: { bg: "bg-[rgba(31,111,235,.16)]", fg: "text-[#4493f8]", dot: "bg-[#4493f8]" },
  "in-progress": { bg: "bg-[rgba(227,179,65,.14)]", fg: "text-[#e3b341]", dot: "bg-[#e3b341]" },
  done: { bg: "bg-[rgba(63,185,80,.14)]", fg: "text-[#3fb950]", dot: "bg-[#3fb950]" },
  "not-planned": { bg: "bg-[rgba(139,148,158,.12)]", fg: "text-[#a9b1ba]", dot: "bg-[rgba(248,81,73,.65)]" },
};

// A message needs the admin's attention while it is Sent or Seen.
export const needsAttention = (status) => status === "sent" || status === "seen";

export const formatFeedbackDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export const formatFeedbackDateTime = (iso) => {
  const d = new Date(iso);
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${formatFeedbackDate(iso)} · ${time}`;
};
