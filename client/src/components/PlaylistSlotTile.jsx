import ContentTile from "./ContentTile.jsx";
import SelectCheckbox from "./SelectCheckbox.jsx";

function PlaylistSlotTile({
  item,
  index,
  checked,
  onToggleSelect,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging,
  isDragOver,
}) {
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
        // we will comment - when preview modal is implemented
        onClick={onToggleSelect}
        className={
          checked ? "!border-2 !border-accent-blue -translate-y-0.5" : ""
        }
      >
        <SelectCheckbox
          checked={checked}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect();
          }}
          className="absolute right-1.5 top-1.5 z-10"
        />
      </ContentTile>
    </div>
  );
}

export default PlaylistSlotTile;

// A draggable, selectable ContentTile for the playlist detail grid:
// position-number badge (top-left, via ContentTile's slotIndex), a
// hover-reveal square select checkbox (top-right, for bulk Remove) —
// clicking anywhere on the tile toggles selection too, same as the
// content-picker grids, not just the checkbox itself — blue border while
// checked, and a blue insertion-line indicator on the left
// edge while another dragged tile is hovering over it as a drop target
// (shows exactly where the dropped tile will land). Drag handlers are
// passed straight through from the parent, which owns the actual reorder
// logic/state.
// Used by: pages/Playlists.jsx.
