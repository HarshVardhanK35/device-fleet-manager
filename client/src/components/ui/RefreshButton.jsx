import { RefreshCw } from "lucide-react";

import { clearApiCache } from "../../api/apiClient.js";
import { useAsyncAction } from "../../hooks/useAsyncAction.js";

// "Refresh" for a page's data, so nobody has to hard-refresh the browser when
// something looks stuck. Icon only (36px square) at every screen size; the label
// is only the tooltip and the screen-reader name. The icon spins while
// `onRefresh` (async) runs. Blue outline on every page (`tone="neutral"` is the grey alternative).
function RefreshButton({ onRefresh, label = "Refresh", tone = "accent", className = "" }) {
  // Refresh always asks the server, never the short-lived list cache.
  const [refresh, busy] = useAsyncAction(async () => {
    clearApiCache();
    await onRefresh?.();
  });

  return (
    <button
      type="button"
      onClick={refresh}
      disabled={busy}
      title={label}
      aria-label={label}
      className={`inline-flex flex-none items-center justify-center gap-2 h-9 w-9 rounded-lg border text-sm font-semibold whitespace-nowrap transition-colors disabled:opacity-60 disabled:pointer-events-none ${
        tone === "accent"
          ? "border-accent-blue text-accent-blue hover:bg-accent-blue/10"
          : "border-border-muted text-text-muted hover:border-border-hover hover:bg-bg-hover hover:text-text-primary"
      } ${className}`}
    >
      <RefreshCw size={15} className={busy ? "animate-spin" : ""} />
    </button>
  );
}

export default RefreshButton;

// Used by: pages/Dashboard.jsx, pages/Content.jsx, pages/Playlists.jsx,
// pages/PlayerSlots.jsx, pages/Assignments.jsx (via DetailPane's `refresh`
// slot on the detail panes).
