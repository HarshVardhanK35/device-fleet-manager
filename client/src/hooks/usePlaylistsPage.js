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
import { useMediaQuery } from "./useCompactLayout.js";
import { useToast } from "../context/useToast.js";

// Skipped slots are positions in the playlist (0, 1, 2 ...), so one copy of an image
// can be skipped while another copy still plays. These keep them right when the
// items move or go.
const toFlags = (slots, length) => Array.from({ length }, (_, i) => slots.has(i));
const fromFlags = (flags) => new Set(flags.map((on, i) => (on ? i : -1)).filter((i) => i >= 0));
const sorted = (slots) => [...slots].sort((a, b) => a - b);

// After the playlist's items were edited as a list of ids: each new slot takes the
// skip flag of the first unused old slot holding the same content.
function carrySkipped(oldIds, oldSlots, newIds) {
  const used = new Set();
  const next = new Set();
  newIds.forEach((id, newIndex) => {
    const oldIndex = oldIds.findIndex((old, i) => !used.has(i) && String(old) === String(id));
    if (oldIndex === -1) return;
    used.add(oldIndex);
    if (oldSlots.has(oldIndex)) next.add(newIndex);
  });
  return next;
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
  // A desktop (1024 px and up) shows the list and the open playlist side by side; a
  // tablet and a phone show one at a time (mobileView says which).
  const split = useMediaQuery("(min-width: 1024px)");
  // Items are moved with the ‹ › buttons on a touch screen of any size (a tablet, even a big
  // one) and in any window narrower than a desktop; a mouse on a desktop drags them.
  const touch = useMediaQuery("(pointer: coarse)");
  const moveButtons = touch || !split;
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
  // The skipped slots that go with the draft order (null while there is no draft).
  const [draftSkipped, setDraftSkipped] = useState(null);
  function clearDraft() {
    setDraftItems(null);
    setDraftSkipped(null);
  }
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderError, setOrderError] = useState(false);
  const shownItems = draftItems ?? selectedPlaylist?.contentItems ?? [];
  const savedSkipped = new Set(selectedPlaylist?.skippedSlots ?? []);
  // Skipped positions of what the grid shows (the draft's while one is open).
  const skippedSlots = draftItems && draftSkipped ? draftSkipped : savedSkipped;
  const orderDirty =
    draftItems !== null &&
    (draftItems.map((i) => i._id).join() !==
      (selectedPlaylist?.contentItems ?? []).map((i) => i._id).join() ||
      sorted(skippedSlots).join() !== sorted(savedSkipped).join());

  const inspectedItem = inspectedSlot
    ? shownItems.find((item, index) => `${item._id}-${index}` === inspectedSlot)
    : null;

  const removeSlotItems = selectedPlaylist
    ? shownItems
        .filter((item, index) => checkedSlotIds.has(`${item._id}-${index}`))
        .map((item) => ({ id: item._id, name: item.name, type: item.type }))
    : [];

  // Skipped items stay in the playlist but are not played. Skip works on the
  // selected slots, so a repeated image is skipped one copy at a time.
  const selectedSlots = shownItems
    .map((item, index) => index)
    .filter((index) => checkedSlotIds.has(`${shownItems[index]._id}-${index}`));
  // All selected items are skipped already: the button turns into "Unskip".
  const unskipMode = selectedSlots.length > 0 && selectedSlots.every((index) => skippedSlots.has(index));

  const [handleSkip, skipping] = useAsyncAction(async () => {
    const next = new Set(skippedSlots);
    for (const index of selectedSlots) {
      if (unskipMode) next.delete(index);
      else next.add(index);
    }
    const message = unskipMode ? "Playing again" : "Skipped. Item(s) stay in the playlist but won't play";
    const shortMessage = unskipMode ? "Playing again" : "Skipped";
    // With an unsaved new order, the skips belong to that order and are saved with it.
    if (draftItems) {
      setDraftSkipped(next);
      clearCheckedSlots();
      toast(message, "success", shortMessage);
      return;
    }
    const updated = await updatePlaylist(selectedPlaylistId, { skippedSlots: sorted(next) });
    if (!updated?._id) {
      toast(updated?.message || "Could not save the change", "error");
      return;
    }
    setPlaylists((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
    clearCheckedSlots();
    toast(message, "success", shortMessage);
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
    clearDraft();
    setInspectedSlot(null);
    clearCheckedSlots();
    setSelectedPlaylistId((id) =>
      playlistData.some((p) => p._id === id) ? id : (playlistData[0]?._id ?? null),
    );
  }

  function selectPlaylist(id) {
    clearDraft();
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

    let kept = 0;
    const stillSkipped = new Set();
    shownItems.forEach((item, index) => {
      if (checkedSlotIds.has(`${item._id}-${index}`)) return;
      if (skippedSlots.has(index)) stillSkipped.add(kept);
      kept += 1;
    });

    const updated = await updatePlaylist(selectedPlaylistId, {
      contentItems: remaining,
      skippedSlots: sorted(stillSkipped),
    });

    if (!updated?._id) {
      toast(updated?.message || "Could not remove the items", "error");
      return;
    }
    setPlaylists(playlists.map((p) => (p._id === updated._id ? updated : p)));
    clearDraft();
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
    // A refusal answers with just { message } (for example a name already taken).
    if (!newPlaylist?._id) throw new Error(newPlaylist?.message || "Could not create the playlist");

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
      skippedSlots: sorted(skippedSlots),
    });

    setPlaylists(playlists.map((p) => (p._id === updated._id ? updated : p)));
    clearDraft();
    setAddContentOpen(false);
    toast(ids.length === 1 ? "Added to the playlist" : `Added ${ids.length} items`);
  }

  // Name, description and the content list are saved together, only here: the
  // modal's remove buttons just edit its own draft until Save.
  async function handleSaveEditPlaylist(name, description, contentItems) {
    const editing = playlists.find((p) => p._id === editPlaylistId);
    const updated = await updatePlaylist(editPlaylistId, {
      name,
      description,
      contentItems,
      skippedSlots: sorted(
        carrySkipped(
          (editing?.contentItems ?? []).map((i) => i._id),
          new Set(editing?.skippedSlots ?? []),
          contentItems,
        ),
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
    // the skip flag moves with its item
    const flags = toFlags(skippedSlots, shownItems.length);
    const [movedFlag] = flags.splice(fromIndex, 1);
    flags.splice(toIndex, 0, movedFlag);
    setOrderError(false);
    setInspectedSlot(null);
    setDraftSkipped(fromFlags(flags));
    setDraftItems(reordered);
  }

  async function handleSaveOrder() {
    setSavingOrder(true);
    setOrderError(false);
    try {
      const updated = await updatePlaylist(selectedPlaylistId, {
        contentItems: draftItems.map((item) => item._id),
        skippedSlots: sorted(skippedSlots),
      });
      setPlaylists((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
      clearDraft();
      toast("Order saved");
    } catch {
      setOrderError(true);
    } finally {
      setSavingOrder(false);
    }
  }

  function handleDiscardOrder() {
    clearDraft();
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
    split,
    moveButtons,
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
    skippedSlots,
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
