import { Plus } from "lucide-react";

import SelectableRow from "../../ui/SelectableRow.jsx";
import SkeletonPlayerSlots from "../../loading/SkeletonPlayerSlots.jsx";
import RefreshButton from "../../ui/RefreshButton.jsx";
import PaneToggle from "../../layout/PaneToggle.jsx";
import { COLLAPSED_PANE_CLASS } from "../../../hooks/usePaneCollapse.js";
import { MAX_SCREENS } from "../../../utils/validation/limits.js";
import { fitFont, statusFont } from "../../../utils/screens/fitText.js";
import { pillLabel } from "../../../utils/screens/screenStatus.js";

// The left column of the Player page: the title with its Refresh button, "n of 3", and
// the three slots (a screen, a screen waiting to be paired, or an empty
// "Add a screen" slot). A long name or type is shown whole on one line by shrinking its font, never cut. A screen shows two columns: its name over its type (or slot number),
// and its status over when it was last seen.
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
          const status = statusFont(s.name);
          return (
            <SelectableRow
              as="button"
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={`@container flex items-center gap-2.5 p-3 rounded-lg border hover:bg-bg-hover ${
                selectedId === s.id
                  ? s.pending
                    ? "border-accent-amber bg-bg-hover"
                    : "border-accent-blue bg-bg-hover"
                  : "border-border-muted"
              }`}
            >
              {/* two columns, two rows: name over type, status over last seen; each row is one grid row,
                  so name and status share a line, and type and last seen share the next */}
              <span className="flex-1 min-w-0 grid grid-cols-[minmax(0,1fr)_auto] grid-rows-[20px_16px] items-center gap-x-3 gap-y-1">
                <span
                  className="whitespace-nowrap overflow-hidden font-semibold leading-5 text-text-primary"
                  style={{ fontSize: fitFont(s.name, status, 0.6, 7, 14) }}
                >
                  {s.name}
                </span>
                <span className="flex items-center justify-end gap-1.5 leading-5 text-text-muted whitespace-nowrap" style={{ fontSize: `${status}px` }}>
                  <span
                    className={`w-1.5 h-1.5 rounded-full flex-none self-center ${
                      s.pending
                        ? "bg-accent-amber"
                        : s.status === "online"
                          ? "bg-accent-green"
                          : s.status === "taken"
                            ? "bg-accent-amber"
                            : "bg-text-muted"
                    }`}
                  />
                  <span>{pillLabel(s)}</span>
                </span>
                <span
                  className="whitespace-nowrap overflow-hidden font-semibold uppercase leading-4 tracking-wide text-text-muted"
                  style={{ fontSize: fitFont(s.pending || !s.type ? `Slot ${i + 1}` : s.type, status, 0.74, 7, 10) }}
                >
                  {s.pending || !s.type ? `Slot ${i + 1}` : s.type}
                </span>
                <span className="text-right leading-4 text-text-muted whitespace-nowrap" style={{ fontSize: `${status}px` }}>
                  {!s.pending && s.status !== "taken" ? s.seen : ""}
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
