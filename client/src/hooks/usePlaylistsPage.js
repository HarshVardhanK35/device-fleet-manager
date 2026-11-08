import { useState, useEffect } from "react";

import {
  getPlaylists,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
} from "../api/playlists.js";
import { getContent, updateContent } from "../api/content.js";
import { useToggleSet } from "./useToggleSet.js";
import { useAsyncAction } from "./useAsyncAction.js";
import { usePaneCollapse } from "./usePaneCollapse.js";
import { useToast } from "../context/useToast.js";

// The skipped ids that still belong to a playlist whose items are now `ids`
// (skipping an item that was removed from the playlist is forgotten).
function keepSkipped(playlist, ids) {
  const stay = new Set(ids.map(String));
  return (playlist?.skippedItems ?? []).map(String).filter((id) => stay.has(id));
}

// All the state and actions of the Playlists page: the playlists and the
// library, which playlist is open, the checked playlists and checked items, the
// unsaved new order, skipped items, the item details panel, and every dialog.
// The page (pages/Playlists.jsx) only puts the pieces together:
// PlaylistListPane (left), PlaylistDetailPane (right) and PlaylistModals.
//   pageRef  the page's outer element (the page owns it, because a ref inside the
//            returned object cannot be handed down); used to dock the details panel
export function usePlaylistsPage(pageRef) {
  const toast = useToast();
  const [playlists, setPlaylists] = useState([]);
  const [content, setContent] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [mobileView, setMobileView] = useState("list"); // "list" | "detail"
  const [loading, setLoading] = useState(true);
  const noContent = content.length === 0;

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

  // The tile whose details panel is open (its slot id, so a repeated image is
  // told apart), which side the panel docks to, and the app being edited.
  // Desktop: the playlist list can be folded away to focus on one playlist.
  const [listCollapsed, toggleCollapsedList] = usePaneCollapse("playlists");
  function toggleList() {
    // A hidden selection must not be deletable, so collapsing clears it.
    if (!listCollapsed) {
      clearCheckedPlaylists();
      setOpenMenuPlaylistId(null);
    }
    toggleCollapsedList();
  }
  const [inspectedSlot, setInspectedSlot] = useState(null);
  const [panelDock, setPanelDock] = useState({ side: "right", left: 0 });
  const [appEditItem, setAppEditItem] = useState(null);

  const selectedPlaylist = playlists.find((p) => p._id === selectedPlaylistId);

  // Reordering only changes this local draft; nothing is saved until the user
  // clicks Save order. `shownItems` is what the grid shows (draft, else saved).
  const [draftItems, setDraftItems] = useState(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderError, setOrderError] = useState(false);
  const shownItems = draftItems ?? selectedPlaylist?.contentItems ?? [];
  const orderDirty =
    draftItems !== null &&
    draftItems.map((i) => i._id).join() !==
      (selectedPlaylist?.contentItems ?? []).map((i) => i._id).join();

  const inspectedItem = inspectedSlot
    ? shownItems.find((item, index) => `${item._id}-${index}` === inspectedSlot)
    : null;

  const removeSlotItems = selectedPlaylist
    ? shownItems
        .filter((item, index) => checkedSlotIds.has(`${item._id}-${index}`))
        .map((item) => ({ id: item._id, name: item.name, type: item.type }))
    : [];

  // Skipped items stay in the playlist but are not played (by content id, so
  // every copy of an image is skipped together).
  const skippedIds = new Set((selectedPlaylist?.skippedItems ?? []).map(String));
  const selectedItemIds = [
    ...new Set(
      shownItems
        .filter((item, index) => checkedSlotIds.has(`${item._id}-${index}`))
        .map((item) => String(item._id)),
    ),
  ];
  // All selected items are skipped already: the button turns into "Unskip".
  const unskipMode = selectedItemIds.length > 0 && selectedItemIds.every((id) => skippedIds.has(id));

  const [handleSkip, skipping] = useAsyncAction(async () => {
    const next = new Set(skippedIds);
    for (const id of selectedItemIds) {
      if (unskipMode) next.delete(id);
      else next.add(id);
    }
    const updated = await updatePlaylist(selectedPlaylistId, { skippedItems: [...next] });
    if (!updated?._id) {
      toast(updated?.message || "Could not save the change", "error");
      return;
    }
    setPlaylists((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
    clearCheckedSlots();
    toast(
      unskipMode ? "Playing again" : "Skipped. Item(s) stay in the playlist but won't play",
      "success",
      unskipMode ? "Playing again" : "Skipped",
    );
  });

  const slotFilterCounts = selectedPlaylist
    ? {
        all: shownItems.length,
        image: shownItems.filter((c) => c.type === "image").length,
        video: shownItems.filter((c) => c.type === "video").length,
        app: shownItems.filter((c) => c.type === "app").length,
      }
    : { all: 0, image: 0, video: 0, app: 0 };

  const visibleSlots = selectedPlaylist
    ? shownItems
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

  // Pulls fresh playlists + library. An unsaved reorder is dropped, and the
  // selection moves on if its playlist no longer exists.
  async function refreshAll() {
    const [playlistData, contentData] = await Promise.all([getPlaylists(), getContent()]);
    setPlaylists(playlistData);
    setContent(contentData);
    setDraftItems(null);
    setInspectedSlot(null);
    clearCheckedSlots();
    setSelectedPlaylistId((id) =>
      playlistData.some((p) => p._id === id) ? id : (playlistData[0]?._id ?? null),
    );
  }

  function selectPlaylist(id) {
    setDraftItems(null);
    setInspectedSlot(null);
    clearCheckedSlots();
    setSlotFilterType("all");
    setSelectedPlaylistId(id);
    setMobileView("detail");
    setOpenMenuPlaylistId(null);
  }

  async function handleDeleteSlots() {
    const removedCount = checkedSlotIds.size;
    const remaining = shownItems
      .filter((item, index) => !checkedSlotIds.has(`${item._id}-${index}`))
      .map((item) => item._id);

    const updated = await updatePlaylist(selectedPlaylistId, {
      contentItems: remaining,
      skippedItems: keepSkipped(selectedPlaylist, remaining),
    });

    setPlaylists(playlists.map((p) => (p._id === updated._id ? updated : p)));
    setDraftItems(null);
    clearCheckedSlots();
    toast(removedCount === 1 ? "Removed from the playlist" : `Removed ${removedCount} items`);
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
    toast("Playlist deleted");
  }

  async function handleBulkDeletePlaylists() {
    const count = checkedPlaylistIds.size;
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
    toast(count === 1 ? "Playlist deleted" : `Deleted ${count} playlists`);
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
    toast("Playlist created");
  }

  // Selecting and the details panel never go together.
  function selectSlot(slotId) {
    setInspectedSlot(null);
    toggleSlotSelect(slotId);
  }

  // Opens a tile's details panel on the side away from the tile, so the tile is
  // never hidden under it (`left` is where the page starts, for a left dock).
  function openSlot(slotId, tileRect) {
    const page = pageRef.current?.getBoundingClientRect();
    if (page && tileRect) {
      const tileMid = tileRect.left + tileRect.width / 2;
      const pageMid = page.left + page.width / 2;
      setPanelDock({ side: tileMid > pageMid ? "left" : "right", left: page.left });
    }
    setInspectedSlot(slotId);
  }

  // Reloads playlists and library after an item was edited. An unsaved new order
  // stays: its items are swapped for the fresh copies.
  async function reloadAfterItemEdit() {
    const [playlistData, contentData] = await Promise.all([getPlaylists(), getContent()]);
    const fresh = new Map(playlistData.flatMap((p) => p.contentItems.map((i) => [i._id, i])));
    setPlaylists(playlistData);
    setContent(contentData);
    setDraftItems((draft) => draft && draft.map((i) => fresh.get(i._id) ?? i));
  }

  async function handleSaveItem(id, data) {
    await updateContent(id, data);
    setInspectedSlot(null);
    await reloadAfterItemEdit();
    toast("Saved");
  }

  function toggleAllSlots() {
    setInspectedSlot(null);
    toggleAllSlotsIds(visibleSlots.map(({ item, index }) => `${item._id}-${index}`));
  }

  function toggleAllPlaylists() {
    toggleAllPlaylistsIds(playlists.map((p) => p._id));
  }

  async function handleAddContentSave(ids) {
    const existingIds = shownItems.map((item) => item._id);
    const updated = await updatePlaylist(selectedPlaylistId, {
      contentItems: [...existingIds, ...ids],
    });

    setPlaylists(playlists.map((p) => (p._id === updated._id ? updated : p)));
    setDraftItems(null);
    setAddContentOpen(false);
    toast(ids.length === 1 ? "Added to the playlist" : `Added ${ids.length} items`);
  }

  // Name, description and the content list are saved together, only here: the
  // modal's remove buttons just edit its own draft until Save.
  async function handleSaveEditPlaylist(name, description, contentItems) {
    const updated = await updatePlaylist(editPlaylistId, {
      name,
      description,
      contentItems,
      skippedItems: keepSkipped(
        playlists.find((p) => p._id === editPlaylistId),
        contentItems,
      ),
    });
    // A failed save answers with just { message }.
    if (!updated?._id) throw new Error(updated?.message || "Could not save the playlist");
    setPlaylists((prev) =>
      prev.map((p) => (p._id === updated._id ? updated : p)),
    );
    setEditPlaylistId(null);
    toast("Playlist saved");
  }

  function handleReorder(fromIndex, toIndex) {
    const reordered = [...shownItems];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    setOrderError(false);
    setInspectedSlot(null);
    setDraftItems(reordered);
  }

  async function handleSaveOrder() {
    setSavingOrder(true);
    setOrderError(false);
    try {
      const updated = await updatePlaylist(selectedPlaylistId, {
        contentItems: draftItems.map((item) => item._id),
      });
      setPlaylists((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
      setDraftItems(null);
      toast("Order saved");
    } catch {
      setOrderError(true);
    } finally {
      setSavingOrder(false);
    }
  }

  function handleDiscardOrder() {
    setDraftItems(null);
    setOrderError(false);
  }

  function handleDrop(toIndex) {
    if (dragIndex !== null && dragIndex !== toIndex) {
      handleReorder(dragIndex, toIndex);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  }

  return {
    // data
    playlists,
    content,
    loading,
    noContent,
    selectedPlaylist,
    selectedPlaylistId,
    mobileView,
    setMobileView,
    refreshAll,
    // the list on the left
    listCollapsed,
    toggleList,
    checkedPlaylistIds,
    toggleCheckPlaylist,
    toggleAllPlaylists,
    openMenuPlaylistId,
    setOpenMenuPlaylistId,
    selectPlaylist,
    // the open playlist on the right
    shownItems,
    visibleSlots,
    slotFilterType,
    setSlotFilterType,
    slotFilterCounts,
    checkedSlotIds,
    toggleAllSlots,
    orderDirty,
    savingOrder,
    orderError,
    handleSaveOrder,
    handleDiscardOrder,
    skippedIds,
    unskipMode,
    skipping,
    handleSkip,
    // its tiles: details panel, selection, drag
    inspectedSlot,
    inspectedItem,
    openSlot,
    selectSlot,
    setInspectedSlot,
    dragIndex,
    dragOverIndex,
    setDragIndex,
    setDragOverIndex,
    handleReorder,
    handleDrop,
    // dialogs and their actions
    createOpen,
    setCreateOpen,
    addContentOpen,
    setAddContentOpen,
    editPlaylistId,
    setEditPlaylistId,
    deleteConfirmId,
    setDeleteConfirmId,
    bulkDeletePlaylistsOpen,
    setBulkDeletePlaylistsOpen,
    slotDeleteConfirmOpen,
    setSlotDeleteConfirmOpen,
    removeSlotItems,
    handleCreatePlaylist,
    handleAddContentSave,
    handleSaveEditPlaylist,
    handleConfirmDeletePlaylist,
    handleBulkDeletePlaylists,
    handleDeleteSlots,
    // item details panel and app settings
    panelDock,
    handleSaveItem,
    appEditItem,
    setAppEditItem,
    reloadAfterItemEdit,
  };
}

// Used by: pages/Playlists.jsx.
