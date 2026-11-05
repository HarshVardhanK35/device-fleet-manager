import { STATUS_LABEL, STATUS_STYLE } from "../../utils/feedbackMeta.js";

// A status pill: coloured dot and label. `large` is the bigger one in the
// user's message details.
function StatusBadge({ status, large = false }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.sent;
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium whitespace-nowrap leading-none ${s.bg} ${s.fg} ${
        large ? "h-7 px-3 gap-2 text-sm" : "h-[22px] px-[9px] gap-1.5 text-xs"
      }`}
    >
      <span className={`rounded-full ${s.dot} ${large ? "w-2 h-2" : "w-1.5 h-1.5"}`} />
      {STATUS_LABEL[status] || status}
    </span>
  );
}

export default StatusBadge;

// Used by: pages/Feedback.jsx, pages/AdminInbox.jsx, components/feedback/*.
