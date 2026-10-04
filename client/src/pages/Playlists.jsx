import { useState, useEffect, useRef } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import { X, Plus, Check, Trash2, MoreVertical, Pencil } from "lucide-react";

import {
  getPlaylists,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
} from "../api/playlists.js";
import { getContent } from "../api/content.js";

import ContentTile from "../components/ContentTile.jsx";
import ContentPickerModal from "../components/ContentPickerModal.jsx";
import ScrollBox from "../components/ScrollBox.jsx";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal.jsx";
import Button from "../components/Button.jsx";

function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [content, setContent] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);

  const [createOpen, setCreateOpen] = useState(false);

  const [addContentOpen, setAddContentOpen] = useState(false);
  const [checkedSlotIds, setCheckedSlotIds] = useState(new Set());

  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editPlaylistId, setEditPlaylistId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editContentItems, setEditContentItems] = useState([]);

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [slotDeleteConfirmOpen, setSlotDeleteConfirmOpen] = useState(false);

  const selectedPlaylist = playlists.find((p) => p._id === selectedPlaylistId);

  useEffect(() => {
    getPlaylist();
  }, []);

  useEffect(() => {
    setCheckedSlotIds(new Set());
  }, [selectedPlaylistId]);

  useEffect(() => {
    function handleClickOutside() {
      setMenuOpenId(null);
    }

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  async function handleDeleteSlots() {
    const remaining = selectedPlaylist.contentItems
      .filter((item, index) => !checkedSlotIds.has(`${item._id}-${index}`))
      .map((item) => item._id);

    const updated = await updatePlaylist(selectedPlaylistId, {
      contentItems: remaining,
    });

    setPlaylists(playlists.map((p) => (p._id === updated._id ? updated : p)));
    setCheckedSlotIds(new Set());
  }

  async function handleConfirmDeletePlaylist() {
    const idToDelete = deleteConfirmId;
    const remaining = playlists.filter((p) => p._id !== idToDelete);

    await deletePlaylist(idToDelete);
    setPlaylists(remaining);

    if (selectedPlaylistId === idToDelete) {
      setSelectedPlaylistId(remaining.length ? remaining[0]._id : null);
    }

    setDeleteConfirmId(null);
  }

  async function getPlaylist() {
    const playlistData = await getPlaylists();
    const contentData = await getContent();

    setPlaylists(playlistData);
    setContent(contentData);

    if (playlistData.length) setSelectedPlaylistId(playlistData[0]._id);
  }

  async function handleCreatePlaylist(name, description, contentItemIds) {
    const newPlaylist = await createPlaylist({
      name,
      description,
      contentItems: contentItemIds,
    });

    setPlaylists([...playlists, newPlaylist]);
    setSelectedPlaylistId(newPlaylist._id);
    setCreateOpen(false);
  }

  function toggleSlotSelect(id, e) {
    e.stopPropagation();
    setCheckedSlotIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openAddContent() {
    setAddContentOpen(true);
  }

  async function handleAddContentSave(ids) {
    const existingIds = selectedPlaylist.contentItems.map((item) => item._id);
    const updated = await updatePlaylist(selectedPlaylistId, {
      contentItems: [...existingIds, ...ids],
    });

    setPlaylists(playlists.map((p) => (p._id === updated._id ? updated : p)));
    setAddContentOpen(false);
  }

  function openEditPlaylist(playlist, e) {
    e.stopPropagation();
    setMenuOpenId(null);
    setEditPlaylistId(playlist._id);
    setEditName(playlist.name);
    setEditDescription(playlist.description || "");
    setEditContentItems(playlist.contentItems);
  }

  async function handleRemoveEditItem(itemId) {
    const remaining = editContentItems.filter((item) => item._id !== itemId);
    const updated = await updatePlaylist(editPlaylistId, {
      contentItems: remaining.map((item) => item._id),
    });

    setEditContentItems(updated.contentItems);
    setPlaylists((prev) =>
      prev.map((p) => (p._id === updated._id ? updated : p)),
    );
  }

  async function handleSaveEditName() {
    const updated = await updatePlaylist(editPlaylistId, {
      name: editName,
      description: editDescription,
    });
    setPlaylists((prev) =>
      prev.map((p) => (p._id === updated._id ? updated : p)),
    );
    setEditPlaylistId(null);
  }

  return (
    <div className="flex gap-4">
      {/* left pane */}
      <div className="w-80 flex-shrink-0 pr-4 border-r border-bg-hover">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-bg-hover">
          <h2 className="text-text-primary font-bold">Playlists</h2>
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-[#50cd89] hover:bg-[#45b87a] text-white font-semibold text-sm leading-none px-4 py-2 rounded-md"
          >
            <Plus size={16} className="shrink-0" />
            Add a playlist
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {playlists.map((playlist) => (
            <div
              key={playlist._id}
              onClick={() => setSelectedPlaylistId(playlist._id)}
              className={`relative bg-bg-panel rounded-lg p-3 cursor-pointer ${
                playlist._id === selectedPlaylistId
                  ? "border border-accent-blue"
                  : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-text-primary font-semibold">
                    {playlist.name}
                  </p>
                  <span className="text-text-muted text-sm">
                    {playlist.contentItems.length} items
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenId(
                      menuOpenId === playlist._id ? null : playlist._id,
                    );
                  }}
                  className="text-text-muted hover:text-text-primary p-1"
                >
                  <MoreVertical size={16} />
                </button>
              </div>

              {menuOpenId === playlist._id && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="absolute right-2 top-10 w-40 bg-bg-panel rounded-lg shadow-lg py-2 z-20 border border-bg-hover"
                >
                  <button
                    onClick={(e) => {
                      openEditPlaylist(playlist, e);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-muted hover:bg-bg-hover hover:text-text-primary"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(null);
                      setDeleteConfirmId(playlist._id);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-muted hover:bg-bg-hover hover:text-accent-red"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* right pane */}
      <div className="flex-1">
        {selectedPlaylist && (
          <>
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-bg-hover">
              <div>
                <h2 className="text-text-primary font-bold">
                  {selectedPlaylist.name}
                </h2>
                <p className="text-text-muted text-sm">
                  {selectedPlaylist.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={openAddContent}>Add content</Button>
                <button
                  onClick={() => setSlotDeleteConfirmOpen(true)}
                  disabled={checkedSlotIds.size === 0}
                  className="text-text-muted hover:text-accent-red disabled:opacity-40 disabled:hover:text-text-muted p-2"
                  title="Delete selected content"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              {selectedPlaylist.contentItems.map((item, index) => (
                <ContentTile
                  key={`${item._id}-${index}`}
                  item={item}
                  slotIndex={index}
                  className={
                    checkedSlotIds.has(`${item._id}-${index}`)
                      ? "border-2 border-accent-blue -translate-y-0.5"
                      : ""
                  }
                >
                  <button
                    onClick={(e) => toggleSlotSelect(`${item._id}-${index}`, e)}
                    className={`absolute left-2 top-2 z-10 w-[21px] h-[21px] rounded-full flex items-center justify-center border-[1.5px] border-accent-blue shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-opacity ${
                      checkedSlotIds.has(`${item._id}-${index}`)
                        ? "bg-accent-blue opacity-100"
                        : "bg-white/95 opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {checkedSlotIds.has(`${item._id}-${index}`) && (
                      <Check size={12} className="text-white" strokeWidth={3} />
                    )}
                  </button>
                </ContentTile>
              ))}
            </div>
          </>
        )}
      </div>

      {/* create playlist */}
      <ContentPickerModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        content={content}
        title="Create Playlist"
        submitLabel="Create"
        layout="split"
        onSubmit={handleCreatePlaylist}
      />

      {/* add content modal */}
      <ContentPickerModal
        open={addContentOpen}
        onOpenChange={setAddContentOpen}
        content={content}
        title="Add Content"
        submitLabel="Add"
        showNameField={false}
        onSubmit={(_, __, ids) => handleAddContentSave(ids)}
      />

      {/* edit playlist */}
      <Dialog.Root
        open={!!editPlaylistId}
        onOpenChange={(open) => !open && setEditPlaylistId(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-panel p-6 rounded-lg w-[min(90vw,1000px)] max-h-[85vh] flex flex-col z-40">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-bg-hover">
              <Dialog.Title className="text-text-primary font-bold">
                Edit Playlist
              </Dialog.Title>
              <Dialog.Close className="text-text-muted hover:text-accent-red transition-colors">
                <X size={18} />
              </Dialog.Close>
            </div>

            <div className="flex gap-6 flex-1 min-h-0">
              <div className="w-64 flex-shrink-0">
                <label className="block text-text-muted text-xs font-semibold mb-1.5">
                  Playlist Name
                </label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-bg-hover text-text-primary px-2 py-1 rounded w-full"
                />
                <label className="block text-text-muted text-xs font-semibold mb-1.5 mt-3">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="bg-bg-hover text-text-primary px-2 py-1 rounded w-full resize-y min-h-[4.5rem] max-h-[300px] dark-scrollbar"
                />
              </div>

              <ScrollBox className="pl-6 pr-4 border-l border-bg-hover">
                <label className="block text-text-muted text-xs font-semibold mb-2">
                  Content in this playlist
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {editContentItems.map((item) => (
                    <ContentTile key={item._id} item={item} size="fluid">
                      <button
                        onClick={() => handleRemoveEditItem(item._id)}
                        className="absolute right-1.5 top-1.5 z-10 w-[18px] h-[18px] rounded-full bg-accent-red hover:bg-red-600 shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
                      >
                        <X
                          size={11}
                          className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                          strokeWidth={3}
                        />
                      </button>
                    </ContentTile>
                  ))}
                </div>
              </ScrollBox>
            </div>

            <div className="inline-flex items-center justify-end gap-2 mt-1 pt-3 border-t border-bg-hover">
              <Dialog.Close className="text-text-muted px-3 py-1">
                Close
              </Dialog.Close>
              <Button onClick={handleSaveEditName}>Save</Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* confirm delete playlist modal */}
      <ConfirmDeleteModal
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
        title="Delete Playlist"
        items={
          deleteConfirmId
            ? [
                {
                  id: deleteConfirmId,
                  name: playlists.find((p) => p._id === deleteConfirmId)?.name,
                },
              ]
            : []
        }
        onConfirm={handleConfirmDeletePlaylist}
      />

      {/* confirm delete slots modal */}
      <ConfirmDeleteModal
        open={slotDeleteConfirmOpen}
        onOpenChange={setSlotDeleteConfirmOpen}
        title="Remove Content"
        items={
          selectedPlaylist
            ? selectedPlaylist.contentItems
                .filter((item, index) =>
                  checkedSlotIds.has(`${item._id}-${index}`),
                )
                .map((item) => ({ id: item._id, name: item.name }))
            : []
        }
        onConfirm={() => {
          handleDeleteSlots();
          setSlotDeleteConfirmOpen(false);
        }}
      />
    </div>
  );
}

export default Playlists;
