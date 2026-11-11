import { useState } from "react";
import { ArrowUpDown, Filter, Trash2 } from "lucide-react";

import SelectCheckbox from "../ui/SelectCheckbox.jsx";
import StyledSelect from "../ui/StyledSelect.jsx";

const TYPES = [
  { value: "all", label: "All" },
  { value: "image", label: "Images" },
  { value: "video", label: "Videos" },
  { value: "app", label: "Apps" },
];

const SORTS = [
  { value: "recent", label: "Recently updated" },
  { value: "name", label: "Name A-Z" },
];

const plural = (n) => (n === 1 ? "item" : "items");

// Same red as the trash button in the details panel (accent-red); stays
// readable when disabled so users can see the action exists before selecting.
const DELETE_CLASS =
  "inline-flex items-center justify-center gap-2 flex-none h-11 w-11 md:w-auto md:h-9 md:px-3.5 rounded-md border border-accent-red/40 text-accent-red text-sm font-semibold whitespace-nowrap transition-colors hover:bg-accent-red/10 hover:border-accent-red/60 active:bg-accent-red/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-accent-red/40";

function TypeChips({ counts, value, disabled, onChange }) {
  return (
    <div
      role="radiogroup"
      aria-label="Filter by type"
      className="flex-1 lg:hidden flex gap-1.5 min-w-0 overflow-x-auto scrollbar-hidden"
    >
      {TYPES.map((t) => {
        const off = disabled && t.value !== "all";
        const count = counts[t.value] ?? 0;
        return (
          <label
            key={t.value}
            title={`Show ${t.label.toLowerCase()} (${count})`}
            className={`flex-none ${off ? "cursor-not-allowed" : "cursor-pointer"}`}
          >
            <input
              type="radio"
              name="content-type"
              value={t.value}
              checked={value === t.value}
              disabled={off}
              onChange={() => onChange(t.value)}
              className="peer sr-only"
            />
            <span
              className={`inline-flex items-center gap-1.5 h-11 md:h-9 px-3 rounded-md border text-sm font-medium whitespace-nowrap transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#58a6ff] ${
                off
                  ? "border-border-muted text-text-muted/60"
                  : "border-border-muted text-text-primary hover:bg-bg-hover hover:border-border-hover peer-checked:bg-[#102a4c] peer-checked:border-accent-blue peer-checked:hover:bg-[#102a4c]"
              }`}
            >
              {t.label}
              <span className="text-text-muted tabular-nums peer-checked:text-text-primary">
                {count}
              </span>
            </span>
          </label>
        );
      })}
    </div>
  );
}

// The Content page's toolbar: selection on the left, type chips + sort in the
// middle (type chips; on desktop a single Filter dropdown), actions
// (`children`, Upload / Create) on the right. Desktop: one
// row. Tablet (md): two rows — selection + actions, then the chips + sort.
// Phone: ONE row — Select all, the trash (only while something is selected), filter and sort
// dropdowns and a search icon that opens a full-row field; the + button holds the actions.
// `counts` is { all, image, video, app }. Playlists keeps the shared
// ContentToolbar — this one is Content-only.
function ContentPageToolbar({
  counts,
  checkedCount,
  totalCount,
  onToggleAll,
  onDelete,
  filterValue,
  onFilterChange,
  sortValue,
  onSortChange,
  mobileSearch,
  compact = false,
  children,
}) {
  // "filter" | "sort" | null — opening one closes the other.
  const [openMenu, setOpenMenu] = useState(null);
  const empty = counts.all === 0;
  const allChecked = totalCount > 0 && checkedCount === totalCount;
  const selectTitle =
    totalCount === 0
      ? "No items to select"
      : allChecked
        ? "Clear selection"
        : `Select all ${totalCount} ${plural(totalCount)}`;

  return (
    <div
      role="group"
      aria-label="Content actions"
      className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] lg:flex lg:flex-wrap lg:items-center gap-x-4 gap-y-3 pt-0 pb-3 mb-1 md:py-2 md:pb-4 md:mb-2 border-b border-bg-hover"
    >
      <div className="group/row flex items-center gap-2 min-w-0 md:col-start-1 md:row-start-1 lg:mr-auto">
        <div
          title={selectTitle}
          className={`flex items-center gap-2.5 h-11 md:h-9 pr-2 group-has-[input]/row:hidden ${empty ? "opacity-50 pointer-events-none" : ""}`}
        >
          <SelectCheckbox
            checked={allChecked}
            indeterminate={checkedCount > 0 && !allChecked}
            onClick={onToggleAll}
            alwaysVisible
          />
          <button
            type="button"
            onClick={onToggleAll}
            disabled={empty}
            className="text-sm text-text-primary whitespace-nowrap"
          >
            Select all
          </button>
        </div>
        <button
          type="button"
          onClick={onDelete}
          disabled={checkedCount === 0}
          title={checkedCount ? `Delete ${checkedCount} selected ${plural(checkedCount)}` : "Select items to delete"}
          aria-label="Delete"
          className={`${DELETE_CLASS} group-has-[input]/row:hidden ${checkedCount === 0 ? "max-md:hidden" : ""}`}
        >
          <Trash2 size={16} />
          {/* icon-only below md (the tooltip names it); text from md up */}
          <span className="hidden md:inline">
            {checkedCount ? `Delete (${checkedCount})` : "Delete"}
          </span>
        </button>
        {/* phone: filter and sort (dropdowns) and search close the same row; while the search
            field is open it takes the whole row */}
        <div className="md:hidden flex-1 min-w-0 flex items-center justify-end gap-2">
          <div className="flex items-center gap-2 group-has-[input]/row:hidden">
            <CompactFilterSort
              counts={counts}
              filterValue={filterValue}
              onFilterChange={onFilterChange}
              sortValue={sortValue}
              onSortChange={onSortChange}
            />
          </div>
          {mobileSearch}
        </div>
      </div>

      <div className={`hidden md:flex items-center gap-2 min-w-0 md:col-span-2 md:row-start-2 lg:col-auto lg:row-auto ${compact ? "md:hidden" : ""}`}>
        <TypeChips
          counts={counts}
          value={filterValue}
          disabled={empty}
          onChange={onFilterChange}
        />
        {/* Desktop: one Filter dropdown instead of the chips (tablet and phone
            keep the chips). */}
        <div className="hidden lg:block">
          <StyledSelect
            value={filterValue}
            onChange={onFilterChange}
            options={TYPES}
            labelFor={(t) => `${t.label} (${counts[t.value] ?? 0})`}
            icon={Filter}
            label="Filter content"
            bgClassName="bg-bg-primary"
            open={openMenu === "filter"}
            onOpenChange={(o) => setOpenMenu(o ? "filter" : null)}
            disabled={empty}
          />
        </div>
        <StyledSelect
          value={sortValue}
          onChange={onSortChange}
          options={SORTS}
          icon={ArrowUpDown}
          label="Sort content"
          bgClassName="bg-bg-primary"
          open={openMenu === "sort"}
          onOpenChange={(o) => setOpenMenu(o ? "sort" : null)}
          disabled={empty}
          touchSize
          align="end"
        />
      </div>

      {compact ? (
        <div className="contents md:flex md:items-center md:justify-end md:gap-2 md:col-start-2 md:row-start-1">
          <div className="hidden md:flex items-center gap-2">
            <CompactFilterSort
              counts={counts}
              filterValue={filterValue}
              onFilterChange={onFilterChange}
              sortValue={sortValue}
              onSortChange={onSortChange}
            />
          </div>
          {children}
        </div>
      ) : (
        <div className="contents md:block md:col-start-2 md:row-start-1">{children}</div>
      )}
    </div>
  );
}

// The same two controls as icon-only buttons (a narrow tablet): Filter by type
// and Sort, each opening its list. They sit just left of Upload / Create.
export function CompactFilterSort({ counts, filterValue, onFilterChange, sortValue, onSortChange }) {
  const [openMenu, setOpenMenu] = useState(null);
  const empty = counts.all === 0;
  return (
    <>
      <div className="relative">
        <StyledSelect
          value={filterValue}
          onChange={onFilterChange}
          options={TYPES}
          labelFor={(t) => `${t.label} (${counts[t.value] ?? 0})`}
          icon={Filter}
          label="Filter content"
          iconOnly
          bgClassName="bg-bg-primary"
          open={openMenu === "filter"}
          onOpenChange={(o) => setOpenMenu(o ? "filter" : null)}
          disabled={empty}
          align="end"
        />
        {/* a filter is on: a dot on the button (the chips that showed it are gone on a phone) */}
        {filterValue !== "all" && (
          <span aria-hidden="true" className="pointer-events-none absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-accent-blue ring-2 ring-bg-primary" />
        )}
      </div>
      <StyledSelect
        value={sortValue}
        onChange={onSortChange}
        options={SORTS}
        icon={ArrowUpDown}
        label="Sort content"
        iconOnly
        bgClassName="bg-bg-primary"
        open={openMenu === "sort"}
        onOpenChange={(o) => setOpenMenu(o ? "sort" : null)}
        disabled={empty}
        align="end"
      />
    </>
  );
}

export default ContentPageToolbar;

// Content-page toolbar (variant C of the Claude Design redesign: type chips
// with counts, readable Delete (n), sort as its own control). Used by:
// pages/Content.jsx. Pages/Playlists.jsx still uses the shared
// ContentToolbar.jsx.
