import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreVertical, Play, SkipForward, Trash2 } from "lucide-react";

import ContentTile from "../content/ContentTile.jsx";
import ActionMenu from "../ui/ActionMenu.jsx";
import SelectCheckbox from "../ui/SelectCheckbox.jsx";
import { useLongPress } from "../../hooks/useLongPress.js";
import { useMediaQuery } from "../../hooks/useCompactLayout.js";

function PlaylistSlotTile({
  item,
  index,
  checked,
  skipped = false,
  inspected = false,
  dimmed = false,
  selectionMode = false,
  onOpen,
  onToggleSelect,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging,
  isDragOver,
  onMoveEarlier,
  onMoveLater,
  showMoveButtons = false,
  touchProps,
  consumeTouchClick,
  armed = false,
  onSkip,
  onMoveToStart,
  onMoveToEnd,
  onRemove,
}) {
  // Touch: a long press selects (there is no hover to reveal the checkbox).
  // While anything is selected a click toggles; otherwise it opens the details.
  const { handlers, consumeClick } = useLongPress(onToggleSelect);
  // A draggable element makes a touch screen start a native drag on a long press, which
  // cancels the press before it can select the tile. Touch uses the ‹ › buttons instead.
  const touch = useMediaQuery("(pointer: coarse)");

  function handleClick(e) {
    if ((consumeTouchClick && consumeTouchClick()) || consumeClick()) return;
    if (selectionMode) onToggleSelect();
    else onOpen(e?.currentTarget?.getBoundingClientRect?.());
  }

  return (
    <div
      draggable={draggable && !touch}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`relative ${isDragging ? "opacity-40" : ""}`}
    >
      {isDragOver && (
        <span className="absolute -left-2 top-0 bottom-0 w-[3px] rounded-full bg-accent-blue shadow-[0_0_0_3px_rgba(47,129,247,0.2)] z-20" />
      )}
      <ContentTile
        item={item}
        size="fluid"
        coloredType
        slotIndex={index}
        slotIndexActive={checked}
        onClick={handleClick}
        rootProps={touchProps ? { ...handlers, ...touchProps } : handlers}
        // Touch screens can't drag (HTML5 drag-and-drop ignores touch), so where the page
        // asks for it (`showMoveButtons`) each tile gets a bar with earlier / later buttons.
        footerBar={
          showMoveButtons && (
            <div className="flex border-t border-border-muted">
              <button
                type="button"
                title="Move earlier"
                aria-label="Move earlier"
                disabled={!onMoveEarlier}
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveEarlier?.();
                }}
                className="flex-1 h-9 flex items-center justify-center border-r border-border-muted text-text-primary hover:bg-bg-hover active:bg-bg-hover disabled:opacity-25 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              {/* this item's own actions (the toolbar above acts on the selected items) */}
              <ActionMenu
                label="Actions for this item"
                align="end"
                items={[
                  { label: skipped ? "Unskip" : "Skip", icon: skipped ? Play : SkipForward, variant: "warning", onClick: onSkip },
                  { label: "Move to start", icon: ChevronsLeft, onClick: onMoveToStart, disabled: !onMoveToStart },
                  { label: "Move to end", icon: ChevronsRight, onClick: onMoveToEnd, disabled: !onMoveToEnd },
                  { type: "separator" },
                  { label: "Remove from playlist", icon: Trash2, variant: "danger", onClick: onRemove },
                ]}
                trigger={
                  <button
                    type="button"
                    title="More"
                    aria-label="More actions for this item"
                    disabled={selectionMode}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 h-9 flex items-center justify-center border-r border-border-muted text-text-primary hover:bg-bg-hover active:bg-bg-hover disabled:opacity-25 disabled:hover:bg-transparent transition-colors"
                  >
                    <MoreVertical size={18} />
                  </button>
                }
              />
              <button
                type="button"
                title="Move later"
                aria-label="Move later"
                disabled={!onMoveLater}
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveLater?.();
                }}
                className="flex-1 h-9 flex items-center justify-center text-text-primary hover:bg-bg-hover active:bg-bg-hover disabled:opacity-25 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )
        }
        className={`select-none [-webkit-touch-callout:none] transition-[filter,opacity] duration-200 ${
          dimmed ? "xl:blur-[3px] xl:opacity-60" : ""
        } ${
          armed ? "!border-2 !border-accent-blue scale-[1.04] shadow-lg shadow-black/40" : ""
        } ${
          checked
            ? "!border-2 !border-accent-blue -translate-y-0.5"
            : inspected
              ? "!border-2 !border-[#8b949e] -translate-y-0.5"
              : ""
        }`}
      >
        <SelectCheckbox
          checked={checked}
          alwaysVisible={selectionMode}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect();
          }}
          className="absolute right-1.5 top-1.5 z-10"
        />

        {skipped && (
          <div className="absolute inset-0 bg-black/55 flex items-center justify-center pointer-events-none">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-amber px-3 py-1 text-xs font-bold text-black shadow-lg">
              <SkipForward size={13} aria-hidden="true" />
              Skipped
            </span>
          </div>
        )}

      </ContentTile>
    </div>
  );
}

export default PlaylistSlotTile;

// A draggable, selectable ContentTile for the playlist detail grid:
// position-number badge (top-left, via ContentTile's slotIndex), a
// hover-reveal square select checkbox (top-right, for bulk Remove / Skip).
// Clicking the tile opens the item's details panel (`onOpen(tileRect)`; gray
// border while it is open, the other tiles blur on desktop), like the Content
// page; only the checkbox selects (blue border while checked). While anything
// is selected a click toggles instead, and on touch a long press selects.
// A blue insertion-line indicator shows on the left
// edge while another dragged tile is hovering over it as a drop target
// (shows exactly where the dropped tile will land). Drag handlers are
// passed straight through from the parent, which owns the actual reorder
// logic/state.
// `skipped` dims the tile and lays a "Skipped" banner over it (the item stays in
// the playlist but is not played). The overlay sits below the checkbox (z-10)
// and ignores clicks, so selecting still works.
// `onMoveEarlier` / `onMoveLater` (optional) fill the move bar, shown when
// `showMoveButtons` is true (touch screens and anything narrower than a desktop);
// pass undefined for the first / last tile so that button is disabled. Between them the ⋮ menu
// acts on this one item: Skip / Unskip, Move to start, Move to end, Remove from playlist.
// `touchProps`, `consumeTouchClick` and `armed` come from useTouchReorder (hold and drag).
// Used by: pages/Playlists.jsx.
