import EmptyState from "../ui/EmptyState.jsx";
import PlaylistSlotTile from "./PlaylistSlotTile.jsx";
import { CONTENT_GRID } from "../content/contentGrid.js";
import { useTouchReorder } from "../../hooks/useTouchReorder.js";

// The grid of the open playlist's items: drag to reorder (hold and drag on touch, or the ⋮ menu's
// Move to start / end), select, open an item's details, skipped items marked.
//   pl  what usePlaylistsPage returns
function PlaylistSlotGrid({ pl }) {
  const { shownItems, visibleSlots, slotFilterType, checkedSlotIds, skippedSlots } = pl;
  // On a touch screen or a narrow window: hold an item and drag it (items can only be reordered
  // in the unfiltered list).
  const reorderOn = slotFilterType === "all" && pl.moveButtons;
  const reorder = useTouchReorder({
    enabled: reorderOn,
    onMove: pl.handleReorder,
    onSelect: (index) => pl.selectSlot(`${shownItems[index]._id}-${index}`),
  });

  if (shownItems.length === 0) {
    return (
      <EmptyState
        title="This playlist has no content yet"
        description="Add items from your library. They play in the order you add them, and you can drag them into a new order later."
      />
    );
  }

  if (visibleSlots.length === 0) {
    return <p className="text-text-muted text-sm pt-8 text-center">No content matches this filter.</p>;
  }

  return (
    <div className={CONTENT_GRID}>
      {visibleSlots.map(({ item, index }) => {
        const slotId = `${item._id}-${index}`;
        const canDrag = slotFilterType === "all";
        return (
          <PlaylistSlotTile
            key={slotId}
            item={item}
            index={index}
            checked={checkedSlotIds.has(slotId)}
            skipped={skippedSlots.has(index)}
            inspected={pl.inspectedSlot === slotId}
            dimmed={!!pl.inspectedItem && pl.inspectedSlot !== slotId}
            selectionMode={checkedSlotIds.size > 0}
            onOpen={(tileRect) => pl.openSlot(slotId, tileRect)}
            onToggleSelect={() => pl.selectSlot(slotId)}
            draggable={canDrag}
            showMenu={pl.moveButtons}
            isDragging={(canDrag && pl.dragIndex === index) || reorder.from === index}
            isDragOver={(canDrag && pl.dragOverIndex === index) || reorder.over === index}
            touchProps={reorderOn ? reorder.bind(index) : undefined}
            consumeTouchClick={reorder.consumeClick}
            armed={reorder.armed === index}
            onSkip={() => pl.skipOne(index)}
            onMoveToStart={canDrag && index > 0 ? () => pl.handleReorder(index, 0) : undefined}
            onMoveToEnd={canDrag && index < shownItems.length - 1 ? () => pl.handleReorder(index, shownItems.length - 1) : undefined}
            onRemove={() => pl.removeOne(slotId)}
            onDragStart={() => canDrag && pl.setDragIndex(index)}
            onDragOver={(e) => {
              if (!canDrag) return;
              e.preventDefault();
              pl.setDragOverIndex(index);
            }}
            onDrop={() => canDrag && pl.handleDrop(index)}
            onDragEnd={() => {
              pl.setDragIndex(null);
              pl.setDragOverIndex(null);
            }}
          />
        );
      })}
    </div>
  );
}

export default PlaylistSlotGrid;

// Used by: components/playlists/PlaylistDetailPane.jsx.
