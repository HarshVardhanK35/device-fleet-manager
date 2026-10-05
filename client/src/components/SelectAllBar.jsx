import { Trash2 } from "lucide-react";

import SelectCheckbox from "./SelectCheckbox.jsx";

function SelectAllBar({ checkedCount, totalCount, onToggleAll, onDelete }) {
  return (
    <div className="flex items-center gap-3">
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
      <button
        onClick={onDelete}
        disabled={checkedCount === 0}
        aria-label="Delete selected"
        className="inline-flex items-center justify-center gap-1.5 h-9 w-9 md:w-auto px-0 md:px-3 rounded-lg border border-accent-red/40 text-accent-red text-sm font-medium hover:bg-accent-red/10 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
      >
        <Trash2 size={16} className="md:hidden" />
        <span className="hidden md:inline">Delete</span>
      </button>
    </div>
  );
}

export default SelectAllBar;

// Bulk-selection control row: select-all checkbox (checked/indeterminate),
// a "Select all" / "Selected X of Y" label, and a Delete button that
// collapses to icon-only below `md`.
// Used by: pages/Content.jsx.
