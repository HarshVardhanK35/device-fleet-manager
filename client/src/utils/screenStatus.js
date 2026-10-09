export const PILL = {
  online: "bg-accent-green/15 text-accent-green",
  offline: "bg-bg-hover text-text-muted",
  taken: "bg-accent-amber/15 text-accent-amber",
  pending: "bg-accent-amber/10 text-accent-amber border border-dashed border-accent-amber/45",
};

export function pillLabel(screen) {
  if (screen.pending) return "Awaiting pairing";
  if (screen.status === "taken") return "Taken over";
  if (screen.status === "online") return "Online";
  return "Offline";
}

// Shared status logic for a Player-tab screen (online/offline/taken/
// awaiting-pairing). `PILL` maps a status/variant to its badge classes;
// `pillLabel` derives the human-readable label. Used by
// components/StatusPill.jsx and pages/PlayerSlots.jsx (slot rail's
// plain-text status line, which skips the pill background).
