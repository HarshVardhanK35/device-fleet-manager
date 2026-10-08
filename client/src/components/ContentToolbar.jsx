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
  divider = true,
  className = "",
  children,
}) {
  return (
    <div
      className={`flex items-center justify-between ${
        divider ? "py-2 pb-4 mb-2 border-b border-bg-hover" : "py-1"
      } ${className}`}
    >
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
// `divider` (default true) controls the bottom border/spacing — Playlists'
// right pane passes `divider={false}` since DetailPane's own section-label
// row already draws a divider right above this toolbar; keeping both was a
// redundant double border line. `className` (optional) extends the outer
// row — Playlists passes `pr-4` there to match the grid's own `pr-4`
// scrollbar-clearance inset, so the filter button lines up with the tiles
// below it instead of sitting further right (past the scrollbar gutter).
// Used by: pages/Content.jsx (full toolbar, showSort default true),
// pages/Playlists.jsx (right pane, showSort={false} — play order matters
// there and Sort would conflict with drag-reorder; only Filter applies).
