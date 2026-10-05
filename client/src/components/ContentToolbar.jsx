import SelectAllBar from "./SelectAllBar.jsx";
import ContentFilterSortBar from "./ContentFilterSortBar.jsx";

function ContentToolbar({
  checkedCount,
  totalCount,
  onToggleAll,
  onClear,
  actionLabel,
  actionIcon,
  onAction,
  boxed,
  endSlot,
  filterCounts,
  filterValue,
  onFilterChange,
  showSort = true,
  sortValue,
  onSortChange,
  children,
}) {
  return (
    <div className="flex items-center justify-between py-2 pb-4 mb-2 border-b border-bg-hover">
      <SelectAllBar
        checkedCount={checkedCount}
        totalCount={totalCount}
        onToggleAll={onToggleAll}
        onClear={onClear}
        actionLabel={actionLabel}
        actionIcon={actionIcon}
        onAction={onAction}
        boxed={boxed}
        endSlot={endSlot}
      />

      <div className="flex items-center gap-2">
        <ContentFilterSortBar
          counts={filterCounts}
          filterValue={filterValue}
          onFilterChange={onFilterChange}
          showSort={showSort}
          sortValue={sortValue}
          onSortChange={onSortChange}
        />
        {children}
      </div>
    </div>
  );
}

export default ContentToolbar;

// Shared "selection + filter/sort + right-side action" toolbar row — the
// bar above a content grid. Left side is a SelectAllBar (bulk-select +
// destructive action); middle is a ContentFilterSortBar (Filter always,
// Sort optional via `showSort`); `children` is the right-side action
// (e.g. UploadSplitButton on the Content page, a plain "Add content"
// Button on Playlists — these differ enough in shape that they're left as
// a slot rather than forced into one rigid prop API).
// Used by: pages/Content.jsx (full toolbar, showSort default true),
// pages/Playlists.jsx (right pane, showSort={false} — play order matters
// there and Sort would conflict with drag-reorder; only Filter applies).
