import EmptyState from "../ui/EmptyState.jsx";
import PlaylistSlotTile from "./PlaylistSlotTile.jsx";

// The grid of the open playlist's items: drag to reorder (or the ‹ › buttons on
// touch), select, open an item's details, skipped items marked.
//   pl  what usePlaylistsPage returns
function PlaylistSlotGrid({ pl }) {
  const { shownItems, visibleSlots, slotFilterType, checkedSlotIds, skippedIds } = pl;

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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
      {visibleSlots.map(({ item, index }) => {
        const slotId = `${item._id}-${index}`;
        const canDrag = slotFilterType === "all";
        return (
          <PlaylistSlotTile
            key={slotId}
            item={item}
            index={index}
            checked={checkedSlotIds.has(slotId)}
            skipped={skippedIds.has(String(item._id))}
            inspected={pl.inspectedSlot === slotId}
            dimmed={!!pl.inspectedItem && pl.inspectedSlot !== slotId}
            selectionMode={checkedSlotIds.size > 0}
            onOpen={(tileRect) => pl.openSlot(slotId, tileRect)}
            onToggleSelect={() => pl.selectSlot(slotId)}
            draggable={canDrag}
            isDragging={canDrag && pl.dragIndex === index}
            isDragOver={canDrag && pl.dragOverIndex === index}
            onDragStart={() => canDrag && pl.setDragIndex(index)}
            onDragOver={(e) => {
              if (!canDrag) return;
              e.preventDefault();
              pl.setDragOverIndex(index);
            }}
            onMoveEarlier={canDrag && index > 0 ? () => pl.handleReorder(index, index - 1) : undefined}
            onMoveLater={
              canDrag && index < shownItems.length - 1 ? () => pl.handleReorder(index, index + 1) : undefined
            }
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
