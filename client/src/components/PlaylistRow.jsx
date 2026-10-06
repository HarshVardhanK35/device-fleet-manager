import { Pencil, Trash2, ListVideo, Repeat } from "lucide-react";

import ActionMenu from "./ActionMenu.jsx";
import SelectCheckbox from "./SelectCheckbox.jsx";
import { formatDuration } from "../utils/formatDuration.js";

function getPlaylistRuntimeMs(playlist) {
  return playlist.contentItems.reduce(
    (sum, item) => sum + (item.durationInMillis || 0),
    0,
  );
}

function PlaylistRow({
  playlist,
  active,
  checked,
  onSelect,
  onToggleCheck,
  onEdit,
  onDelete,
  menuOpen,
  onMenuOpenChange,
}) {
  return (
    <div
      onClick={onSelect}
      className={`group relative overflow-hidden flex flex-col gap-2.5 p-3 pl-4 rounded-[10px] border cursor-pointer transition-colors transition-transform duration-100 active:scale-[0.99] ${
        active
          ? "border-accent-blue bg-bg-panel"
          : "border-border-muted bg-bg-panel hover:border-border-hover"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-accent-blue" />
      )}
      <div className="flex items-center gap-2.5 min-w-0">
        <SelectCheckbox
          checked={checked}
          onClick={(e) => {
            e.stopPropagation();
            onToggleCheck();
          }}
        />
        <span className="w-8 h-8 flex-none rounded-lg bg-accent-blue/15 border border-accent-blue/30 text-accent-blue flex items-center justify-center">
          <ListVideo size={16} />
        </span>
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">
            {playlist.name}
          </span>
          <span className="text-xs text-text-muted tabular-nums flex items-center gap-1">
            {playlist.contentItems.length} items
            {playlist.contentItems.length > 0 && (
              <>
                <span>·</span>
                {formatDuration(getPlaylistRuntimeMs(playlist))}
                <span>·</span>
                loop
                <Repeat size={11} />
              </>
            )}
          </span>
        </div>
        <ActionMenu
          label={`Actions for ${playlist.name}`}
          align="end"
          open={menuOpen}
          onOpenChange={onMenuOpenChange}
          items={[
            {
              label: "Edit",
              icon: Pencil,
              onClick: onEdit,
            },
            { type: "separator" },
            {
              label: "Delete",
              icon: Trash2,
              variant: "danger",
              onClick: onDelete,
            },
          ]}
        />
      </div>
    </div>
  );
}

export default PlaylistRow;

// A single playlist row for the Playlists page's left pane: hover-reveal
// select checkbox (for bulk delete, paired with a SelectAllBar above the
// list) — hidden at rest, shows on hover or once checked (e.g. via Select
// all), rather than cluttering every row with an empty box by default.
// Also: icon, name, item-count/runtime/loop meta line, blue left-edge
// accent strip + border while this is the active (selected) playlist, and
// a "⋮" ActionMenu (Edit / Delete) for single-item actions. The ActionMenu
// is controlled via `menuOpen`/`onMenuOpenChange` (parent tracks which
// row's menu, if any, is open) rather than left uncontrolled — needed so
// the parent can force it closed when a different row is selected; Radix's
// own outside-click dismissal alone wasn't reliable here since selecting a
// different row can also trigger a layout change (master-detail nav) in
// the same click. Extracted out of Playlists.jsx's render loop for the
// same reason SelectableContentTile was extracted from Content.jsx.
// Used by: pages/Playlists.jsx.
