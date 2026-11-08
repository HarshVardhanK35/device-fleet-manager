import { Plus, Hourglass } from "lucide-react";

import ScreenThumb from "../ScreenThumb.jsx";
import SelectableRow from "../../ui/SelectableRow.jsx";
import SkeletonPlayerSlots from "../../loading/SkeletonPlayerSlots.jsx";
import RefreshButton from "../../ui/RefreshButton.jsx";
import PaneToggle from "../../layout/PaneToggle.jsx";
import { COLLAPSED_PANE_CLASS } from "../../../hooks/usePaneCollapse.js";
import { MAX_SCREENS } from "../../../utils/limits.js";
import { pillLabel } from "../../../utils/screenStatus.js";

// The left column of the Player page: the title with its Refresh button, "n of 3", and
// the three slots (a screen, a screen waiting to be paired, or an empty
// "Add a screen" slot).
function SlotRail({ screens, loading, selectedId, used, full, mobileView, collapsed, onToggleCollapse, onSelect, onAdd, onRefresh }) {
  return (
    <div
      className={`relative w-full lg:w-72 lg:flex-shrink-0 lg:pr-4 lg:border-r lg:border-border-muted flex flex-col gap-2 ${
        mobileView === "detail" ? "hidden lg:flex" : "flex"
      } ${collapsed ? COLLAPSED_PANE_CLASS : ""}`}
    >
      <PaneToggle collapsed={collapsed} onToggle={onToggleCollapse} />
      <div className="mb-1 pb-3 border-b border-bg-hover">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-text-primary text-xl font-bold m-0">Player</h1>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border-muted bg-bg-panel text-xs text-text-muted">
            <span className={`font-semibold ${full ? "text-accent-amber" : "text-text-primary"}`}>
              {used} of {MAX_SCREENS}
            </span>
          </span>
          <RefreshButton className="ml-auto" onRefresh={onRefresh} />
        </div>
        <p className="text-text-muted text-xs mt-1">Three slots per account. Pick one to manage it.</p>
      </div>

      {loading ? (
        <SkeletonPlayerSlots />
      ) : (
        [0, 1, 2].map((i) => {
          const s = screens[i];
          if (!s) {
            return (
              <button
                key={`empty-${i}`}
                type="button"
                onClick={onAdd}
                disabled={full}
                className="flex items-center gap-2.5 p-3 rounded-lg border border-dashed border-border-muted hover:border-accent-blue text-text-muted hover:text-text-primary transition-colors text-left disabled:opacity-40 disabled:hover:border-border-muted disabled:hover:text-text-muted"
              >
                <span className="w-7 h-7 rounded-md bg-bg-hover flex items-center justify-center flex-none">
                  <Plus size={14} />
                </span>
                <span className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[10px] font-semibold uppercase tracking-wide">Slot {i + 1}</span>
                  <span className="text-sm">Add a screen</span>
                </span>
              </button>
            );
          }
          return (
            <SelectableRow
              as="button"
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={`flex items-center gap-2.5 p-3 rounded-lg border hover:bg-bg-hover ${
                selectedId === s.id
                  ? s.pending
                    ? "border-accent-amber bg-bg-hover"
                    : "border-accent-blue bg-bg-hover"
                  : "border-border-muted"
              }`}
            >
              <span className="w-14 aspect-video rounded overflow-hidden border border-border-muted flex-none bg-bg-primary">
                {s.pending ? (
                  <span className="w-full h-full flex items-center justify-center">
                    <Hourglass size={14} className="text-accent-amber" />
                  </span>
                ) : (
                  <ScreenThumb playing={s.playing} mini />
                )}
              </span>
              <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                  Slot {i + 1}
                </span>
                <span className="text-sm font-semibold text-text-primary truncate">{s.name}</span>
                <span className="flex items-center gap-1.5 text-xs text-text-muted">
                  <span
                    className={`w-1.5 h-1.5 rounded-full flex-none ${
                      s.pending
                        ? "bg-accent-amber"
                        : s.status === "online"
                          ? "bg-accent-green"
                          : s.status === "taken"
                            ? "bg-accent-amber"
                            : "bg-text-muted"
                    }`}
                  />
                  {pillLabel(s)}
                </span>
              </span>
            </SelectableRow>
          );
        })
      )}
    </div>
  );
}

export default SlotRail;

// Used by: pages/PlayerSlots.jsx.
