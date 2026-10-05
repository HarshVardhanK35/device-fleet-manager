import { useState, useEffect, useRef, useMemo } from "react";

import {
  getContent,
  createContent,
  uploadFile,
  updateContent,
  deleteContent,
} from "../api/content";

import ConfirmDeleteModal from "../components/ConfirmDeleteModal.jsx";
import ContentToolbar from "../components/ContentToolbar.jsx";
import ContentDetailsPanel from "../components/ContentDetailsPanel.jsx";
import UploadProgressModal from "../components/UploadProgressModal.jsx";
import ContentSearchInput from "../components/ContentSearchInput.jsx";
import UploadSplitButton from "../components/UploadSplitButton.jsx";
import ContentEmptyState from "../components/ContentEmptyState.jsx";
import SelectableContentTile from "../components/SelectableContentTile.jsx";
import SkeletonGrid from "../components/SkeletonGrid.jsx";
import ScrollBox from "../components/ScrollBox.jsx";
import { getVideoDurationMs } from "../utils/getVideoDuration.js";

function Content() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);

  // bulk selection (checkbox-tick, for multi-item actions)
  const [checkedIds, setCheckedIds] = useState(new Set());

  // single-item inspector (click the card body to open)
  const [inspectedId, setInspectedId] = useState(null);

  // filter/sort/search
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  // upload
  const [uploadState, setUploadState] = useState(null); // { fileName, isVideo, progress, done } | null
  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // delete confirmations
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false); // bulk
  const [singleDeleteTarget, setSingleDeleteTarget] = useState(null); // from inspector

  useEffect(() => {
    fetchContent();
  }, []);

  async function fetchContent() {
    const data = await getContent();
    setContent(data);
    setLoading(false);

    const validIds = new Set(data.map((item) => item._id));
    setCheckedIds((prev) => {
      const next = new Set([...prev].filter((id) => validIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }

  async function handleFileSelected(e) {
    const selectedFiles = Array.from(e.target.files);
    e.target.value = ""; // reset so re-selecting the same file(s) re-fires onChange
    if (selectedFiles.length === 0) return;

    const validFiles = selectedFiles.filter(
      (f) => f.type.startsWith("image/") || f.type.startsWith("video/"),
    );
    if (validFiles.length === 0) {
      alert("Only image or video files are allowed.");
      return;
    }

    for (let i = 0; i < validFiles.length; i++) {
      const selectedFile = validFiles[i];
      const isVideo = selectedFile.type.startsWith("video");

      setUploadState({
        fileName: selectedFile.name,
        isVideo,
        progress: 0,
        done: false,
        queueIndex: i + 1,
        queueTotal: validFiles.length,
      });

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const uploadResult = await uploadFile(selectedFile, {
          onProgress: (progress) =>
            setUploadState((s) => (s ? { ...s, progress } : s)),
          signal: controller.signal,
        });

        const name = selectedFile.name.replace(/\.[^/.]+$/, "");
        const durationInMillis = isVideo
          ? await getVideoDurationMs(selectedFile).catch(() => undefined)
          : undefined;

        await createContent({
          name,
          type: isVideo ? "video" : "image",
          mediaUrl: uploadResult.url,
          thumbnailUrl: uploadResult.thumbnailUrl,
          ...(durationInMillis && { durationInMillis }),
        });

        fetchContent();

        const isLast = i === validFiles.length - 1;
        if (isLast) {
          setUploadState((s) => (s ? { ...s, progress: 100, done: true } : s));
        }
      } catch (err) {
        if (err.name === "AbortError") {
          setUploadState(null);
        } else {
          alert(`Upload failed for "${selectedFile.name}". Please try again.`);
          setUploadState(null);
        }
        return;
      }
    }
  }

  function handleCancelUpload() {
    abortControllerRef.current?.abort();
  }

  async function handleSaveItem(id, data) {
    await updateContent(id, data);
    setInspectedId(null);
    fetchContent();
  }

  async function handleConfirmSingleDelete() {
    await deleteContent(singleDeleteTarget._id);
    setContent((prev) =>
      prev.filter((item) => item._id !== singleDeleteTarget._id),
    );
    setSingleDeleteTarget(null);
    setInspectedId(null);
  }

  async function handleBulkDeleteContent() {
    await Promise.all(Array.from(checkedIds).map((id) => deleteContent(id)));
    setContent((prev) => prev.filter((item) => !checkedIds.has(item._id)));
    setCheckedIds(new Set());
    setDeleteConfirmOpen(false);
  }

  function toggleSelectAll() {
    if (checkedIds.size === visibleContent.length) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(visibleContent.map((item) => item._id)));
    }
  }

  function toggleSelect(id, e) {
    e.stopPropagation();
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openFilePicker() {
    fileInputRef.current.click();
  }

  const counts = useMemo(
    () => ({
      all: content.length,
      image: content.filter((c) => c.type === "image").length,
      video: content.filter((c) => c.type === "video").length,
      app: content.filter((c) => c.type === "app").length,
    }),
    [content],
  );

  const visibleContent = useMemo(() => {
    let list = content;
    if (filterType !== "all") {
      list = list.filter((item) => item.type === filterType);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((item) => item.name.toLowerCase().includes(q));
    }
    list = [...list];
    if (sortBy === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      list.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      );
    }
    return list;
  }, [content, filterType, search, sortBy]);

  const inspectedItem = content.find((item) => item._id === inspectedId);

  return (
    // 88px = Layout's header (h-14 = 56px) + ScrollBox page padding (p-4 =
    // 32px). A definite height (not h-full) is required here because Radix's
    // ScrollArea viewport doesn't stretch its content to 100% height, so a
    // percentage height on this root wouldn't resolve — needed so the nested
    // ScrollBox below can scroll just the grid, not the whole page.
    <div className="max-w-7xl mx-auto h-[calc(100vh-88px)] flex flex-col">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFileSelected}
        className="hidden"
      />

      {/* fixed header: stays put, only the grid below scrolls (nested ScrollBox) */}
      <div className="flex-shrink-0">
        {/* row 1: title + count, search */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-baseline gap-2 min-w-0 flex-shrink-0">
            <h1 className="text-text-primary text-xl font-bold whitespace-nowrap">
              All content
            </h1>
            <span className="text-text-muted text-sm whitespace-nowrap">
              {visibleContent.length} items
            </span>
          </div>

          <ContentSearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* row 2: select all / delete (left), upload / filter / sort (right) */}
        <ContentToolbar
          checkedCount={checkedIds.size}
          totalCount={visibleContent.length}
          onToggleAll={toggleSelectAll}
          onAction={() => setDeleteConfirmOpen(true)}
          filterCounts={counts}
          filterValue={filterType}
          onFilterChange={setFilterType}
          sortValue={sortBy}
          onSortChange={setSortBy}
        >
          <UploadSplitButton
            onUploadClick={openFilePicker}
            onAddAppClick={() => {}} // no route yet
          />
        </ContentToolbar>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* content grid */}
        <ScrollBox className="flex-1 pr-4 pt-2">
          {loading ? (
            <SkeletonGrid />
          ) : content.length === 0 ? (
            <ContentEmptyState
              onUploadClick={openFilePicker}
              onAddAppClick={() => {}} // no route yet
            />
          ) : visibleContent.length === 0 ? (
            <p className="text-text-muted text-sm pt-8 text-center">
              No content matches your search or filter.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {visibleContent.map((item) => (
                <SelectableContentTile
                  key={item._id}
                  item={item}
                  checked={checkedIds.has(item._id)}
                  inspected={inspectedId === item._id}
                  onToggleSelect={toggleSelect}
                  onClick={() => setInspectedId(item._id)}
                />
              ))}
            </div>
          )}
        </ScrollBox>

        {/* inspector panel */}
        {inspectedItem && (
          <ContentDetailsPanel
            key={inspectedItem._id}
            item={inspectedItem}
            onClose={() => setInspectedId(null)}
            onSave={handleSaveItem}
            onDelete={(item) => setSingleDeleteTarget(item)}
          />
        )}
      </div>

      <ConfirmDeleteModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Content"
        items={content
          .filter((item) => checkedIds.has(item._id))
          .map((item) => ({ id: item._id, name: item.name }))}
        onConfirm={handleBulkDeleteContent}
      />

      <ConfirmDeleteModal
        open={!!singleDeleteTarget}
        onOpenChange={(open) => !open && setSingleDeleteTarget(null)}
        title="Delete Content"
        items={
          singleDeleteTarget
            ? [{ id: singleDeleteTarget._id, name: singleDeleteTarget.name }]
            : []
        }
        onConfirm={handleConfirmSingleDelete}
      />

      <UploadProgressModal
        open={!!uploadState}
        fileName={uploadState?.fileName}
        isVideo={uploadState?.isVideo}
        progress={uploadState?.progress ?? 0}
        done={uploadState?.done ?? false}
        queueIndex={uploadState?.queueIndex}
        queueTotal={uploadState?.queueTotal}
        onCancel={handleCancelUpload}
        onClose={() => setUploadState(null)}
      />
    </div>
  );
}

export default Content;
