import { useState } from "react";
import { SkipForward } from "lucide-react";

import AppEditModals from "./AppEditModals.jsx";
import EditPlaylistModal from "./EditPlaylistModal.jsx";
import ContentDetailsPanel from "../content/ContentDetailsPanel.jsx";
import ContentPickerModal from "../content/ContentPickerModal.jsx";
import ConfirmDeleteModal from "../modals/ConfirmDeleteModal.jsx";
import RemoveConfirmModal from "../modals/RemoveConfirmModal.jsx";
import { MAX_IMAGE_COPIES } from "../../utils/validation/limits.js";
import { takenPlaylistNames } from "../../utils/playlists/playlistNames.js";

// Every dialog of the Playlists page, plus the details panel of a clicked item
// and the app settings screens: create / add content / edit playlist, the
// delete and remove confirmations.
//   pl  what usePlaylistsPage returns
function PlaylistModals({ pl }) {
  const { playlists, content, selectedPlaylist, inspectedItem } = pl;

  // The remove dialog keeps the items it was opened with while it closes: the selection
  // is cleared as soon as they are removed, and the dialog would otherwise redraw as
  // "Remove 0 items" during its closing animation.
  const [shownRemoveItems, setShownRemoveItems] = useState([]);
  const removeKey = pl.removeSlotItems.map((item) => item.id).join();
  if (pl.removeSlotItems.length > 0 && removeKey !== shownRemoveItems.map((item) => item.id).join()) {
    setShownRemoveItems(pl.removeSlotItems);
  }
  const removeSlotItems = pl.removeSlotItems.length > 0 ? pl.removeSlotItems : shownRemoveItems;

  return (
    <>
      {/* create playlist */}
      <ContentPickerModal
        open={pl.createOpen}
        onOpenChange={pl.setCreateOpen}
        content={content}
        title="Create Playlist"
        submitLabel="Create"
        busyLabel="Creating…"
        takenNames={takenPlaylistNames(playlists)}
        onSubmit={pl.handleCreatePlaylist}
      />

      {/* add content modal */}
      <ContentPickerModal
        open={pl.addContentOpen}
        onOpenChange={pl.setAddContentOpen}
        content={content}
        title="Add Content"
        subtitle={selectedPlaylist?.name}
        note={`Images: up to ${MAX_IMAGE_COPIES} copies. Videos and apps: once.`}
        submitLabel="Add"
        busyLabel="Adding…"
        showNameField={false}
        existingItems={pl.shownItems}
        onSubmit={(_, __, ids) => pl.handleAddContentSave(ids)}
      />

      {/* edit playlist */}
      <EditPlaylistModal
        open={!!pl.editPlaylistId}
        onOpenChange={(open) => !open && pl.setEditPlaylistId(null)}
        playlist={playlists.find((p) => p._id === pl.editPlaylistId)}
        takenNames={takenPlaylistNames(playlists, pl.editPlaylistId)}
        onSave={pl.handleSaveEditPlaylist}
      />

      {/* confirm delete playlist modal */}
      <ConfirmDeleteModal
        open={!!pl.deleteConfirmId}
        onOpenChange={(open) => !open && pl.setDeleteConfirmId(null)}
        title="Delete Playlist"
        items={
          pl.deleteConfirmId
            ? [
                {
                  id: pl.deleteConfirmId,
                  name: playlists.find((p) => p._id === pl.deleteConfirmId)?.name,
                },
              ]
            : []
        }
        onConfirm={pl.handleConfirmDeletePlaylist}
      />

      {/* confirm bulk delete playlists modal */}
      <ConfirmDeleteModal
        open={pl.bulkDeletePlaylistsOpen}
        onOpenChange={pl.setBulkDeletePlaylistsOpen}
        title="Delete Playlists"
        items={playlists
          .filter((p) => pl.checkedPlaylistIds.has(p._id))
          .map((p) => ({ id: p._id, name: p.name }))}
        onConfirm={pl.handleBulkDeletePlaylists}
      />

      {/* confirm remove slots modal */}
      <RemoveConfirmModal
        open={pl.skipAllOpen}
        onOpenChange={(open) => !open && pl.cancelSkipAll()}
        icon={SkipForward}
        title="Skip every item?"
        description={`Nothing in "${selectedPlaylist?.name ?? "this playlist"}" will play until you unskip items. They stay in the playlist.`}
        confirmLabel="Skip all"
        busyLabel="Skipping…"
        onConfirm={pl.confirmSkipAll}
      />

      <RemoveConfirmModal
        open={pl.slotDeleteConfirmOpen}
        onOpenChange={pl.setSlotDeleteConfirmOpen}
        title={`Remove ${removeSlotItems.length} item${removeSlotItems.length === 1 ? "" : "s"}?`}
        description={
          <>
            From &ldquo;{selectedPlaylist?.name}&rdquo;. They stay in your
            Content library and in any other playlists.
          </>
        }
        items={removeSlotItems}
        confirmLabel={
          <>
            Remove
            <span className="hidden sm:inline">
              {` ${removeSlotItems.length} item${removeSlotItems.length === 1 ? "" : "s"}`}
            </span>
          </>
        }
        onConfirm={async () => {
          // closes whatever happens, so a failure can never leave the dialog stuck open
          try {
            await pl.handleDeleteSlots();
          } finally {
            pl.setSlotDeleteConfirmOpen(false);
          }
        }}
      />

      {/* details of the clicked item (name, duration, app settings) */}
      {inspectedItem && (
        <ContentDetailsPanel
          key={pl.inspectedSlot}
          item={inspectedItem}
          dockSide={pl.panelDock.side}
          dockLeft={pl.panelDock.left}
          showFit
          onClose={() => pl.setInspectedSlot(null)}
          onSave={pl.handleSaveItem}
          onOpenAppSettings={
            inspectedItem.type === "app"
              ? () => {
                  pl.setInspectedSlot(null);
                  pl.setAppEditItem(inspectedItem);
                }
              : undefined
          }
        />
      )}

      <AppEditModals
        item={pl.appEditItem}
        onClose={() => pl.setAppEditItem(null)}
        onSaved={pl.reloadAfterItemEdit}
        library={content}
      />
    </>
  );
}

export default PlaylistModals;

// Used by: pages/Playlists.jsx.
