import { PILL, pillLabel } from "../utils/screenStatus.js";

function StatusPill({ screen, dot = false, className = "" }) {
  const variant = screen.pending ? "pending" : screen.status;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${PILL[variant]} ${className}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {pillLabel(screen)}
    </span>
  );
}

export default StatusPill;

// Shared status badge for a Player-tab screen (online/offline/taken/
// awaiting-pairing) — `dot` adds a small solid-color dot before the label,
// for spots where the pill sits beside plain text that needs its own
// visual anchor. Status logic lives in utils/screenStatus.js (import
// `pillLabel` from there directly for a plain-text, no-pill label).
// Used by: pages/PlayerSlots.jsx.
