import { RotateCcw } from "lucide-react";

function ReleaseScreenButton({ onClick, size = "md" }) {
  const sizing = size === "sm" ? "h-8 px-3 text-xs" : "h-9 px-3 text-xs";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-accent-amber/50 text-accent-amber font-semibold transition-colors hover:bg-accent-amber/10 ${sizing}`}
    >
      <RotateCcw size={13} />
      Release to screen
    </button>
  );
}

export default ReleaseScreenButton;

// Releases a taken-over screen back to the physical device — same
// action/label wherever a taken-over screen can be released from.
// Used by: pages/PlayerSlots.jsx (danger-zone section, size="md") and
// components/PlayerStandinModal.jsx (modal footer, size="sm").
