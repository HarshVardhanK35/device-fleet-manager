import { useRef } from "react";
import { Pencil, Trash2, ListVideo, Repeat } from "lucide-react";

import ActionMenu from "./ActionMenu.jsx";
import SelectCheckbox from "./SelectCheckbox.jsx";
import SelectableRow from "./SelectableRow.jsx";
import { formatDuration } from "../utils/formatDuration.js";
import { pluralizeCount } from "../utils/pluralize.js";

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
  selectionMode = false,
  onLongPress,
}) {
  // Long press (touch only) ticks the row — touch screens have no hover to
  // reveal the checkbox. The press cancels if the finger moves (scrolling),
  // and the click that follows a long press is swallowed.
  const pressTimer = useRef(null);
  const pressStart = useRef(null);
  const longPressed = useRef(false);

  function clearPress() {
    clearTimeout(pressTimer.current);
    pressTimer.current = null;
  }

  function handlePointerDown(e) {
    if (!onLongPress || e.pointerType === "mouse") return;
    longPressed.current = false;
    pressStart.current = { x: e.clientX, y: e.clientY };
    clearPress();
    pressTimer.current = setTimeout(() => {
      longPressed.current = true;
      navigator.vibrate?.(15);
      onLongPress();
    }, 500);
  }

  function handlePointerMove(e) {
    if (!pressTimer.current || !pressStart.current) return;
    if (Math.hypot(e.clientX - pressStart.current.x, e.clientY - pressStart.current.y) > 10) {
      clearPress();
    }
  }

  function handleClick() {
    if (longPressed.current) {
      longPressed.current = false;
      return;
    }
    onSelect();
  }

  return (
    <SelectableRow
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={clearPress}
      onPointerCancel={clearPress}
      onPointerLeave={clearPress}
      onContextMenu={(e) => {
        if (onLongPress) e.preventDefault();
      }}
      className={`group relative overflow-hidden select-none [-webkit-touch-callout:none] flex flex-col gap-2.5 p-3 pl-4 rounded-[10px] border ${
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
          alwaysVisible={selectionMode}
          onClick={(e) => {
            e.stopPropagation();
            onToggleCheck();
          }}
        />
        <span className="w-8 h-8 flex-none rounded-lg bg-accent-blue/15 border border-accent-blue/30 text-accent-blue flex items-center justify-center">
          <ListVideo size={16} />
        </span>
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="min-w-0 text-sm font-semibold text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">
              {playlist.name}
            </span>
            {playlist.contentItems.length > 0 && (
              <span className="flex-none inline-flex items-center gap-1 text-xs text-text-muted">
                loop
                <Repeat size={11} />
              </span>
            )}
          </div>
          {/* Each part is its own nowrap item, so a narrow row breaks between
              parts ("6 items" stays together) instead of inside one. */}
          <span className="text-xs text-text-muted tabular-nums flex flex-wrap items-center gap-x-1">
            <span className="whitespace-nowrap">
              {pluralizeCount(playlist.contentItems.length, "item")}
            </span>
            {playlist.contentItems.length > 0 && (
              <>
                <span>·</span>
                <span className="whitespace-nowrap">
                  {formatDuration(getPlaylistRuntimeMs(playlist))}
                </span>
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
    </SelectableRow>
  );
}

export default PlaylistRow;

// A single playlist row for the Playlists page's left pane: hover-reveal
// select checkbox (for bulk delete, paired with a SelectAllBar above the
// list) — hidden at rest, shows on hover or once checked (e.g. via Select
// all), rather than cluttering every row with an empty box by default.
// Long press (touch) ticks the row via `onLongPress`; `selectionMode` keeps
// every checkbox visible while any row is ticked.
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
