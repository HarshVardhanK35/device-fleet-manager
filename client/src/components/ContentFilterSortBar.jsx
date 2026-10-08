import { useState } from "react";
import { Filter, ArrowUpDown } from "lucide-react";

import StyledSelect from "./StyledSelect.jsx";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "image", label: "Images" },
  { value: "video", label: "Videos" },
  { value: "app", label: "Apps" },
];

const SORTS = [
  { value: "recent", label: "Recently added" },
  { value: "name", label: "Name A-Z" },
];

function ContentFilterSortBar({
  counts,
  filterValue,
  onFilterChange,
  sortValue,
  onSortChange,
  showSort = true,
}) {
  const [openMenu, setOpenMenu] = useState(null); // "filter" | "sort" | null

  return (
    <div className="flex items-center">
      <StyledSelect
        value={filterValue}
        onChange={onFilterChange}
        options={FILTERS}
        labelFor={(f) => `${f.label} (${counts[f.value] ?? 0})`}
        icon={Filter}
        label="Filter content"
        open={openMenu === "filter"}
        onOpenChange={(open) => setOpenMenu(open ? "filter" : null)}
        roundedSide={showSort ? "left" : "full"}
      />
      {showSort && (
        <StyledSelect
          value={sortValue}
          onChange={onSortChange}
          options={SORTS}
          icon={ArrowUpDown}
          label="Sort content"
          open={openMenu === "sort"}
          onOpenChange={(open) => setOpenMenu(open ? "sort" : null)}
          roundedSide="right"
        />
      )}
    </div>
  );
}

export default ContentFilterSortBar;

// Filter-by-type + sort controls for the Content library (Radix Select —
// NOT native <select>, since a native select's expanded option list can't
// be restyled across browsers and looked inconsistent with the rest of the
// dark theme). Replaces the mock's left sidebar filter list, which doesn't
// scale to small screens — see daily discussion 2026-10-05.
// `counts` is { all, image, video, app }. Below `md`, each trigger collapses
// to an icon-only 36px square (Filter / ArrowUpDown) — the dropdown content
// itself is unaffected, still showing full option labels. `showSort=false`
// hides the Sort control entirely — used for the Playlist content grid,
// where real play order matters and a "sort" would conflict with
// drag-reorder; only Filter (which doesn't touch order) applies there.
// When both are shown, they're merged into one segmented control (shared
// border, no gap) via StyledSelect's `roundedSide` prop, instead of reading
// as two separate disconnected boxes.
// Used by: pages/Content.jsx, components/ContentPickerModal.jsx,
// components/ContentToolbar.jsx (pages/Playlists.jsx, showSort={false}).
// The underlying dropdown is components/StyledSelect.jsx, shared with
// components/DashboardAttentionPanel.jsx.
