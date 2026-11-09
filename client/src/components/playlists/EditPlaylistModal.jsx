import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";

import ScrollBox from "../layout/ScrollBox.jsx";
import CancelButton from "../ui/CancelButton.jsx";
import Button from "../ui/Button.jsx";
import GhostButton from "../ui/GhostButton.jsx";
import RemovableContentTile from "../content/RemovableContentTile.jsx";
import LoadingOverlay from "../loading/LoadingOverlay.jsx";
import FieldCount from "../ui/FieldCount.jsx";
import { MAX_PLAYLIST_DESCRIPTION, MAX_PLAYLIST_NAME } from "../../utils/validation/limits.js";
import { useAsyncAction } from "../../hooks/useAsyncAction.js";
import { DUPLICATE_PLAYLIST_NAME, normalizeName } from "../../utils/playlists/playlistNames.js";

// Owns name/description/contentItems state. Rendered only while `open` is
// true, so it mounts fresh off `playlist` every time the modal opens —
// avoids syncing props into state via a useEffect (see
// react-hooks/set-state-in-effect; same pattern as ContentPickerModal.jsx).
function EditPlaylistBody({ playlist, takenNames, onSave }) {
  const [name, setName] = useState(playlist.name);
  const [description, setDescription] = useState(playlist.description || "");
  const [contentItems, setContentItems] = useState(playlist.contentItems);

  const [error, setError] = useState("");
  const nameTaken = takenNames.includes(normalizeName(name));

  // Nothing is saved until Save: removing a tile only edits this list, and
  // Cancel (or closing) throws the edits away.
  const [save, saving] = useAsyncAction(async () => {
    setError("");
    if (nameTaken) return;
    try {
      await onSave(name, description, contentItems.map((item) => item._id));
    } catch (err) {
      setError(err.message || "Could not save the playlist");
    }
  });

  // Removes one copy (by position), so a repeated image loses only the tile clicked.
  function handleRemove(index) {
    setContentItems((items) => items.filter((_, i) => i !== index));
  }

  return (
    <>
      <ScrollBox className="px-6 pb-5">
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="flex items-center justify-between text-text-muted text-xs font-semibold">
                Name
                <FieldCount value={name} max={MAX_PLAYLIST_NAME} />
              </span>
              <input
                value={name}
                maxLength={MAX_PLAYLIST_NAME}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={nameTaken}
                className={`bg-bg-primary border rounded-lg px-3 h-10 text-text-primary text-sm outline-none ${
                  nameTaken ? "border-accent-red" : "border-border-muted focus-visible:border-accent-blue"
                }`}
              />
              {nameTaken && (
                <span role="alert" className="text-accent-red text-xs">
                  {DUPLICATE_PLAYLIST_NAME}
                </span>
              )}
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="flex items-center justify-between text-text-muted text-xs font-semibold">
                <span>
                  Description <span className="font-normal">· optional</span>
                </span>
                <FieldCount value={description} max={MAX_PLAYLIST_DESCRIPTION} />
              </span>
              <textarea
                value={description}
                maxLength={MAX_PLAYLIST_DESCRIPTION}
                onChange={(e) => setDescription(e.target.value)}
                rows={1}
                className="dark-scrollbar bg-bg-primary border border-border-muted rounded-lg px-3 py-2 text-text-primary text-sm outline-none focus-visible:border-accent-blue resize-y min-h-10 max-h-28"
              />
            </label>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-text-muted text-xs font-semibold">
              Content in this playlist
            </span>
            {contentItems.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-8 border border-dashed border-border-muted rounded-lg">
                All content removed. Save to leave this playlist empty.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {contentItems.map((item, index) => (
                  <RemovableContentTile
                    key={`${item._id}-${index}`}
                    item={item}
                    slotIndex={index}
                    onRemove={() => handleRemove(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollBox>

      {error && <p className="m-0 px-6 pb-2 text-sm text-accent-red">{error}</p>}
      <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border-muted">
        <GhostButton
          as={Dialog.Close}
          size="lg"
          disabled={saving}
          className="disabled:opacity-40 disabled:pointer-events-none"
        >
          Cancel
        </GhostButton>
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
        <LoadingOverlay show={saving} />
      </div>
    </>
  );
}

function EditPlaylistModal({ open, onOpenChange, playlist, takenNames = [], onSave }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-panel border border-border-muted rounded-xl w-[760px] max-w-[calc(100vw-32px)] max-h-[85vh] flex flex-col z-40">
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <Dialog.Title className="text-text-primary font-bold text-lg m-0">
              Edit Playlist
            </Dialog.Title>
            <CancelButton as={Dialog.Close} title="Close" />
          </div>

          {open && playlist && (
            <EditPlaylistBody
              playlist={playlist}
              takenNames={takenNames}
              onSave={onSave}
            />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default EditPlaylistModal;

// Edit Playlist modal (Radix Dialog): name + description fields, and a
// grid of the playlist's current content with per-item remove buttons.
// `takenNames`: the other playlists' normalised names; typing one shows a red line.
// Everything is a draft until Save: `onSave(name, description, contentIds)`
// saves all three in one request (and throws with a message when the server
// refuses, which the modal shows); Cancel or closing discards the edits.
// Used by: pages/Playlists.jsx.
