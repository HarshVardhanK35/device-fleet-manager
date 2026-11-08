import { ChevronLeft, ChevronRight, SkipForward } from "lucide-react";

import ContentTile from "../content/ContentTile.jsx";
import SelectCheckbox from "../ui/SelectCheckbox.jsx";
import { useLongPress } from "../../hooks/useLongPress.js";

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
}) {
  // Touch: a long press selects (there is no hover to reveal the checkbox).
  // While anything is selected a click toggles; otherwise it opens the details.
  const { handlers, consumeClick } = useLongPress(onToggleSelect);

  function handleClick(e) {
    if (consumeClick()) return;
    if (selectionMode) onToggleSelect();
    else onOpen(e?.currentTarget?.getBoundingClientRect?.());
  }

  return (
    <div
      draggable={draggable}
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
        rootProps={handlers}
        // Touch screens can't drag (HTML5 drag-and-drop ignores touch), so below
        // md each tile gets a bar with earlier / later buttons instead.
        footerBar={
          (onMoveEarlier || onMoveLater) && (
            <div className="md:hidden flex border-t border-border-muted">
              {[
                { label: "Move earlier", Icon: ChevronLeft, onClick: onMoveEarlier },
                { label: "Move later", Icon: ChevronRight, onClick: onMoveLater },
              ].map(({ label, Icon, onClick }, i) => (
                <button
                  key={label}
                  type="button"
                  title={label}
                  aria-label={label}
                  disabled={!onClick}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick?.();
                  }}
                  className={`flex-1 h-9 flex items-center justify-center text-text-primary hover:bg-bg-hover active:bg-bg-hover disabled:opacity-25 disabled:hover:bg-transparent transition-colors ${i === 0 ? "border-r border-border-muted" : ""}`}
                >
                  <Icon size={18} />
                </button>
              ))}
            </div>
          )
        }
        className={`transition-[filter,opacity] duration-200 ${
          dimmed ? "xl:blur-[3px] xl:opacity-60" : ""
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
// `onMoveEarlier` / `onMoveLater` (optional) show the below-md move bar;
// pass undefined for the first / last tile so that button is disabled.
// Used by: pages/Playlists.jsx.
