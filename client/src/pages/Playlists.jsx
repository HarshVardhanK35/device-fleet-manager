import { useState, useEffect } from "react";

import { Plus, Repeat, CircleMinus } from "lucide-react";

import {
  getPlaylists,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
} from "../api/playlists.js";
import { getContent } from "../api/content.js";

import ContentPickerModal from "../components/ContentPickerModal.jsx";
import ScrollBox from "../components/ScrollBox.jsx";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal.jsx";
import RemoveContentModal from "../components/RemoveContentModal.jsx";
import EditPlaylistModal from "../components/EditPlaylistModal.jsx";
import SelectAllBar from "../components/SelectAllBar.jsx";
import ContentToolbar from "../components/ContentToolbar.jsx";
import PlaylistSlotTile from "../components/PlaylistSlotTile.jsx";
import PlaylistRow from "../components/PlaylistRow.jsx";
import SkeletonPlaylistList from "../components/SkeletonPlaylistList.jsx";
import SkeletonGrid from "../components/SkeletonGrid.jsx";
import EmptyState from "../components/EmptyState.jsx";
import DetailPane from "../components/DetailPane.jsx";
import Button from "../components/Button.jsx";
import { pluralizeCount } from "../utils/pluralize.js";
import { useToggleSet } from "../hooks/useToggleSet.js";

function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [content, setContent] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [mobileView, setMobileView] = useState("list"); // "list" | "detail"
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);

  const [addContentOpen, setAddContentOpen] = useState(false);
  const [
    checkedSlotIds,
    { toggle: toggleSlotSelect, toggleAll: toggleAllSlotsIds, clear: clearCheckedSlots },
  ] = useToggleSet();

  const [editPlaylistId, setEditPlaylistId] = useState(null);
  const [openMenuPlaylistId, setOpenMenuPlaylistId] = useState(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [slotDeleteConfirmOpen, setSlotDeleteConfirmOpen] = useState(false);

  const [
    checkedPlaylistIds,
    { toggle: toggleCheckPlaylist, toggleAll: toggleAllPlaylistsIds, clear: clearCheckedPlaylists },
  ] = useToggleSet();
  const [bulkDeletePlaylistsOpen, setBulkDeletePlaylistsOpen] = useState(false);

  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const [slotFilterType, setSlotFilterType] = useState("all");

  const selectedPlaylist = playlists.find((p) => p._id === selectedPlaylistId);

  const slotFilterCounts = selectedPlaylist
    ? {
        all: selectedPlaylist.contentItems.length,
        image: selectedPlaylist.contentItems.filter((c) => c.type === "image")
          .length,
        video: selectedPlaylist.contentItems.filter((c) => c.type === "video")
          .length,
        app: selectedPlaylist.contentItems.filter((c) => c.type === "app")
          .length,
      }
    : { all: 0, image: 0, video: 0, app: 0 };

  const visibleSlots = selectedPlaylist
    ? selectedPlaylist.contentItems
        .map((item, index) => ({ item, index }))
        .filter(
          ({ item }) => slotFilterType === "all" || item.type === slotFilterType,
        )
    : [];

  useEffect(() => {
    (async () => {
      const [playlistData, contentData] = await Promise.all([
        getPlaylists(),
        getContent(),
      ]);

      setPlaylists(playlistData);
      setContent(contentData);

      if (playlistData.length) setSelectedPlaylistId(playlistData[0]._id);
      setLoading(false);
    })();
  }, []);

  function selectPlaylist(id) {
    clearCheckedSlots();
    setSlotFilterType("all");
    setSelectedPlaylistId(id);
    setMobileView("detail");
    setOpenMenuPlaylistId(null);
  }

  async function handleDeleteSlots() {
    const remaining = selectedPlaylist.contentItems
      .filter((item, index) => !checkedSlotIds.has(`${item._id}-${index}`))
      .map((item) => item._id);

    const updated = await updatePlaylist(selectedPlaylistId, {
      contentItems: remaining,
    });

    setPlaylists(playlists.map((p) => (p._id === updated._id ? updated : p)));
    clearCheckedSlots();
  }

  async function handleConfirmDeletePlaylist() {
    const idToDelete = deleteConfirmId;
    const remaining = playlists.filter((p) => p._id !== idToDelete);

    await deletePlaylist(idToDelete);
    setPlaylists(remaining);

    if (selectedPlaylistId === idToDelete) {
      clearCheckedSlots();
      setSelectedPlaylistId(remaining.length ? remaining[0]._id : null);
    }

    setDeleteConfirmId(null);
  }

  async function handleBulkDeletePlaylists() {
    await Promise.all(
      Array.from(checkedPlaylistIds).map((id) => deletePlaylist(id)),
    );
    const remaining = playlists.filter((p) => !checkedPlaylistIds.has(p._id));
    setPlaylists(remaining);

    if (checkedPlaylistIds.has(selectedPlaylistId)) {
      clearCheckedSlots();
      setSelectedPlaylistId(remaining.length ? remaining[0]._id : null);
    }

    clearCheckedPlaylists();
    setBulkDeletePlaylistsOpen(false);
  }

  async function handleCreatePlaylist(name, description, contentItemIds) {
    const newPlaylist = await createPlaylist({
      name,
      description,
      contentItems: contentItemIds,
    });

    setPlaylists([...playlists, newPlaylist]);
    selectPlaylist(newPlaylist._id);
    setCreateOpen(false);
  }

  function toggleAllSlots() {
    toggleAllSlotsIds(visibleSlots.map(({ item, index }) => `${item._id}-${index}`));
  }

  function toggleAllPlaylists() {
    toggleAllPlaylistsIds(playlists.map((p) => p._id));
  }

  async function handleAddContentSave(ids) {
    const existingIds = selectedPlaylist.contentItems.map((item) => item._id);
    const updated = await updatePlaylist(selectedPlaylistId, {
      contentItems: [...existingIds, ...ids],
    });

    setPlaylists(playlists.map((p) => (p._id === updated._id ? updated : p)));
    setAddContentOpen(false);
  }

  async function handleRemoveEditItem(itemId, currentItems) {
    const remaining = currentItems.filter((item) => item._id !== itemId);
    const updated = await updatePlaylist(editPlaylistId, {
      contentItems: remaining.map((item) => item._id),
    });

    setPlaylists((prev) =>
      prev.map((p) => (p._id === updated._id ? updated : p)),
    );
    return updated.contentItems;
  }

  async function handleSaveEditPlaylist(name, description) {
    const updated = await updatePlaylist(editPlaylistId, { name, description });
    setPlaylists((prev) =>
      prev.map((p) => (p._id === updated._id ? updated : p)),
    );
    setEditPlaylistId(null);
  }

  async function handleReorder(fromIndex, toIndex) {
    const reordered = [...selectedPlaylist.contentItems];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    // optimistic: update local state immediately, persist in the background
    setPlaylists((prev) =>
      prev.map((p) =>
        p._id === selectedPlaylistId ? { ...p, contentItems: reordered } : p,
      ),
    );
    await updatePlaylist(selectedPlaylistId, {
      contentItems: reordered.map((item) => item._id),
    });
  }

  function handleDrop(toIndex) {
    if (dragIndex !== null && dragIndex !== toIndex) {
      handleReorder(dragIndex, toIndex);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  }

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-88px)] flex gap-4 ">
      {/* left pane */}
      <div
        className={`w-full max-w-xl mx-auto lg:max-w-none lg:mx-0 lg:w-80 lg:flex-shrink-0 lg:pr-4 lg:border-r lg:border-border-muted flex flex-col min-h-0 ${
          mobileView === "detail" ? "hidden lg:flex" : "flex"
        }`}
      >
        <div className="flex items-center gap-2 pb-3 flex-shrink-0">
          <h2 className="text-text-primary font-bold text-base m-0">
            Playlists
          </h2>
          <span className="text-text-muted text-sm tabular-nums">
            {pluralizeCount(playlists.length, "item")}
          </span>
        </div>

        {playlists.length > 0 && (
          <SelectAllBar
            checkedCount={checkedPlaylistIds.size}
            totalCount={playlists.length}
            onToggleAll={toggleAllPlaylists}
            onAction={() => setBulkDeletePlaylistsOpen(true)}
            className="pb-3 pr-4 flex-shrink-0"
          />
        )}

        <ScrollBox className="pr-4 pt-1">
          {loading ? (
            <SkeletonPlaylistList count={4} />
          ) : (
          <div className="flex flex-col gap-2 pb-2">
            {playlists.map((playlist) => (
              <PlaylistRow
                key={playlist._id}
                playlist={playlist}
                active={playlist._id === selectedPlaylistId}
                checked={checkedPlaylistIds.has(playlist._id)}
                onSelect={() => selectPlaylist(playlist._id)}
                onToggleCheck={() => toggleCheckPlaylist(playlist._id)}
                onEdit={() => setEditPlaylistId(playlist._id)}
                onDelete={() => setDeleteConfirmId(playlist._id)}
                menuOpen={openMenuPlaylistId === playlist._id}
                onMenuOpenChange={(open) =>
                  setOpenMenuPlaylistId(open ? playlist._id : null)
                }
              />
            ))}
          </div>
          )}
        </ScrollBox>

        <div className="flex-shrink-0 pt-3 pr-4">
          <Button icon={Plus} onClick={() => setCreateOpen(true)} className="w-full">
            Create playlist
          </Button>
        </div>
      </div>

      {/* right pane */}
      <div
        className={`flex-1 min-h-0 flex flex-col ${
          mobileView === "list" ? "hidden lg:flex" : "flex"
        }`}
      >
        {loading ? (
          <SkeletonGrid count={6} />
        ) : (
          selectedPlaylist && (
            <DetailPane
              className="flex-1 min-h-0"
              bodyClassName="flex-1 min-h-0 flex flex-col"
              headerClassName="pr-4"
              backLabel="Playlists"
              onBack={() => setMobileView("list")}
              title={selectedPlaylist.name}
              badge={
                <span className="inline-flex items-center gap-1 h-6 px-2 rounded-full border border-border-muted text-text-muted text-xs font-semibold">
                  loop
                  <Repeat size={12} />
                </span>
              }
              meta={selectedPlaylist.description}
              actionLabel="Add from library"
              actionIcon={Plus}
              onAction={() => setAddContentOpen(true)}
              sectionLabel="Content"
              sectionMeta={
                selectedPlaylist.contentItems.length > 0
                  ? `${pluralizeCount(visibleSlots.length, "item")}${
                      slotFilterType === "all" ? " · drag to reorder" : ""
                    }`
                  : null
              }
            >
              {selectedPlaylist.contentItems.length > 0 && (
                <ContentToolbar
                  checkedCount={checkedSlotIds.size}
                  totalCount={visibleSlots.length}
                  onToggleAll={toggleAllSlots}
                  actionLabel="Remove"
                  actionIcon={CircleMinus}
                  onAction={() => setSlotDeleteConfirmOpen(true)}
                  filterCounts={slotFilterCounts}
                  filterValue={slotFilterType}
                  onFilterChange={setSlotFilterType}
                  showSort={false}
                  divider={false}
                  className="pr-4"
                />
              )}

              <ScrollBox className="flex-1 pr-4 pt-2">
                {selectedPlaylist.contentItems.length === 0 ? (
                  <EmptyState
                    minHeight="300px"
                    title="This playlist has no content yet"
                    description="Add items from your library. They play in the order you add them, and you can drag them into a new order later."
                  />
                ) : visibleSlots.length === 0 ? (
                  <p className="text-text-muted text-sm pt-8 text-center">
                    No content matches this filter.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {visibleSlots.map(({ item, index }) => {
                      const slotId = `${item._id}-${index}`;
                      const canDrag = slotFilterType === "all";
                      return (
                        <PlaylistSlotTile
                          key={slotId}
                          item={item}
                          index={index}
                          checked={checkedSlotIds.has(slotId)}
                          onToggleSelect={() => toggleSlotSelect(slotId)}
                          draggable={canDrag}
                          isDragging={canDrag && dragIndex === index}
                          isDragOver={canDrag && dragOverIndex === index}
                          onDragStart={() => canDrag && setDragIndex(index)}
                          onDragOver={(e) => {
                            if (!canDrag) return;
                            e.preventDefault();
                            setDragOverIndex(index);
                          }}
                          onDrop={() => canDrag && handleDrop(index)}
                          onDragEnd={() => {
                            setDragIndex(null);
                            setDragOverIndex(null);
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </ScrollBox>
            </DetailPane>
          )
        )}
      </div>

      {/* create playlist */}
      <ContentPickerModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        content={content}
        title="Create Playlist"
        submitLabel="Create"
        onSubmit={handleCreatePlaylist}
      />

      {/* add content modal */}
      <ContentPickerModal
        open={addContentOpen}
        onOpenChange={setAddContentOpen}
        content={content}
        title="Add Content"
        subtitle={selectedPlaylist?.name}
        submitLabel="Add"
        showNameField={false}
        onSubmit={(_, __, ids) => handleAddContentSave(ids)}
      />

      {/* edit playlist */}
      <EditPlaylistModal
        open={!!editPlaylistId}
        onOpenChange={(open) => !open && setEditPlaylistId(null)}
        playlist={playlists.find((p) => p._id === editPlaylistId)}
        onSave={handleSaveEditPlaylist}
        onRemoveItem={handleRemoveEditItem}
      />

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

      {/* confirm bulk delete playlists modal */}
      <ConfirmDeleteModal
        open={bulkDeletePlaylistsOpen}
        onOpenChange={setBulkDeletePlaylistsOpen}
        title="Delete Playlists"
        items={playlists
          .filter((p) => checkedPlaylistIds.has(p._id))
          .map((p) => ({ id: p._id, name: p.name }))}
        onConfirm={handleBulkDeletePlaylists}
      />

      {/* confirm remove slots modal */}
      <RemoveContentModal
        open={slotDeleteConfirmOpen}
        onOpenChange={setSlotDeleteConfirmOpen}
        playlistName={selectedPlaylist?.name}
        items={
          selectedPlaylist
            ? selectedPlaylist.contentItems
                .filter((item, index) =>
                  checkedSlotIds.has(`${item._id}-${index}`),
                )
                .map((item) => ({
                  id: item._id,
                  name: item.name,
                  type: item.type,
                }))
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
