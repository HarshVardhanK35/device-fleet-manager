import { Trash2 } from "lucide-react";

import SelectCheckbox from "./SelectCheckbox.jsx";

function SelectAllBar({
  checkedCount,
  totalCount,
  onToggleAll,
  onClear,
  actionLabel = "Delete",
  actionIcon: ActionIcon = Trash2,
  onAction,
  endSlot,
  boxed = false,
  className = "",
}) {
  const hasSelection = checkedCount > 0;

  return (
    <div
      className={`flex items-center gap-3 transition-colors ${
        boxed
          ? `rounded-xl border px-3 py-2.5 ${
              hasSelection
                ? "border-accent-blue/40 bg-accent-blue/10"
                : "border-border-muted bg-bg-panel"
            }`
          : ""
      } ${className}`}
    >
      <SelectCheckbox
        checked={checkedCount > 0 && checkedCount === totalCount}
        indeterminate={checkedCount > 0 && checkedCount < totalCount}
        onClick={onToggleAll}
        alwaysVisible
      />
      {checkedCount === 0 ? (
        <span className="text-text-muted text-sm">Select all</span>
      ) : (
        <span className="text-text-muted text-sm">
          Selected {checkedCount} of {totalCount}
        </span>
      )}
      {onClear && checkedCount > 0 && (
        <button
          onClick={onClear}
          className="text-accent-blue hover:bg-accent-blue/10 text-sm font-semibold h-7 px-2 rounded-md transition-colors"
        >
          Clear
        </button>
      )}

      <div className="flex-1" />
      {endSlot}

      <button
        onClick={onAction}
        disabled={checkedCount === 0}
        aria-label={actionLabel}
        className="inline-flex items-center justify-center gap-1.5 h-9 w-9 md:w-auto px-0 md:px-3 rounded-lg border border-accent-red/40 text-accent-red text-sm font-medium hover:bg-accent-red/10 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
      >
        <ActionIcon size={16} />
        <span className="hidden md:inline">{actionLabel}</span>
      </button>
    </div>
  );
}

export default SelectAllBar;

// Bulk-selection control row: select-all checkbox (checked/indeterminate),
// a "Select all" / "Selected X of Y" label, an optional "Clear" link
// (shown when `onClear` is passed and something's checked), an optional
// `endSlot` node (e.g. a hint), and a destructive action button (icon +
// label, customizable via `actionLabel`/`actionIcon`/`onAction`) whose
// label collapses away below `md` (icon always stays). `boxed` wraps the
// whole row in a bordered/padded pill that tints blue once something's
// checked — used by Playlists, left off (plain inline row) for Content.
// Used by: pages/Content.jsx (Delete), pages/Playlists.jsx (Remove).
