import { useState, useEffect, useRef, useMemo } from "react";

import {
  getContent,
  createContent,
  uploadFile,
  updateContent,
  deleteContent,
} from "../api/content";

import ConfirmDeleteModal from "../components/ConfirmDeleteModal.jsx";
import AppsPickerModal from "../apps/AppsPickerModal.jsx";
import WeatherSettingsScreen from "../apps/appModals/weather-modal.jsx";
import ClockSettingsScreen from "../apps/appModals/clock-modal.jsx";
import ContentToolbar from "../components/ContentToolbar.jsx";
import ContentDetailsPanel from "../components/ContentDetailsPanel.jsx";
import UploadProgressModal from "../components/UploadProgressModal.jsx";
import ContentSearchInput from "../components/ContentSearchInput.jsx";
import UploadSplitButton from "../components/UploadSplitButton.jsx";
import ContentEmptyState from "../components/ContentEmptyState.jsx";
import SelectableContentTile from "../components/SelectableContentTile.jsx";
import SkeletonGrid from "../components/SkeletonGrid.jsx";
import ScrollBox from "../components/ScrollBox.jsx";
import ScrollToTopButton from "../components/ScrollToTopButton.jsx";
import { getVideoDurationMs } from "../utils/getVideoDuration.js";
import { pluralizeCount } from "../utils/pluralize.js";
import { useToggleSet } from "../hooks/useToggleSet.js";

// Mirrors the server-side quota in contentController.js's createContent —
// this is purely a pre-upload UX check (avoid wasting a Cloudinary upload
// on something already known to be rejected). The real enforcement is the
// backend check; these numbers must stay in sync with it, not replace it.
const MAX_IMAGES = 30;
const MAX_VIDEO_BYTES = 150 * 1024 * 1024; // 150MB

function formatMB(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

// Bottom third of the cap = normal, middle third = amber, top third = red —
// same banding applied to images (count-based, max 30) and video
// (byte-based, max 150MB), so both read the same way at a glance.
function quotaColorClass(value, max) {
  if (value >= (max * 2) / 3) return "text-accent-red";
  if (value >= max / 3) return "text-accent-amber";
  return "text-text-muted";
}

function Content() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const gridScrollRef = useRef(null);

  // bulk selection (checkbox-tick, for multi-item actions)
  const [checkedIds, { toggle: toggleChecked, toggleAll: toggleCheckedAll, setSet: setCheckedIds }] =
    useToggleSet();

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
  const [appsPickerOpen, setAppsPickerOpen] = useState(false);
  const [weatherSettingsOpen, setWeatherSettingsOpen] = useState(false);
  // The existing Content row being edited (set when the pencil icon is
  // clicked on an already-saved Weather app tile) — null means the modal
  // is creating a brand new one instead (opened via "Add an App").
  const [weatherEditTarget, setWeatherEditTarget] = useState(null);
  const [clockSettingsOpen, setClockSettingsOpen] = useState(false);
  const [clockEditTarget, setClockEditTarget] = useState(null);
  const [singleDeleteTarget, setSingleDeleteTarget] = useState(null); // from inspector

  // Pencil icon on any tile (image/video/app) opens the same Details panel
  // — name + duration are edited there for all types, including apps. The
  // panel itself shows an extra "Edit app settings" button, app-only, that
  // calls openAppSettingsModal below for the app-specific fields (location,
  // refresh interval, etc.) that don't belong in the generic panel.
  function handleTileEdit(item) {
    setInspectedId(item._id);
  }

  function openAppSettingsModal(item) {
    // Weather is currently the only app with a settings screen — rows
    // saved before `appType` was added to configBlob don't have it yet, so
    // fall back to the old "range" field (only Weather's configBlob ever
    // had one) rather than require every pre-existing row to be re-saved.
    const isWeather =
      item.configBlob?.appType === "weather" || item.configBlob?.range !== undefined;

    if (isWeather) {
      setWeatherEditTarget(item);
      setWeatherSettingsOpen(true);
    } else if (item.configBlob?.appType === "clock") {
      setClockEditTarget(item);
      setClockSettingsOpen(true);
    } else {
      // Other app types (RSS/Announcements) don't have a settings screen
      // built yet — same gap as AppsPickerModal's onSelectApp.
      console.log("No settings screen built yet for this app:", item.name);
    }
  }

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

    // Running totals across this batch, starting from what's already saved
    // — checked against each file *before* it's uploaded, so a file that
    // would be rejected never reaches Cloudinary at all.
    let imagesQueued = content.filter((c) => c.type === "image").length;
    let videoBytesQueued = content
      .filter((c) => c.type === "video")
      .reduce((sum, c) => sum + (c.sizeBytes || 0), 0);

    for (let i = 0; i < validFiles.length; i++) {
      const selectedFile = validFiles[i];
      const isVideo = selectedFile.type.startsWith("video");

      if (!isVideo && imagesQueued >= MAX_IMAGES) {
        setUploadState({
          fileName: selectedFile.name,
          isVideo,
          progress: 0,
          done: false,
          error: `Image limit reached (${MAX_IMAGES} max)`,
          queueIndex: i + 1,
          queueTotal: validFiles.length,
        });
        return;
      }

      if (isVideo && videoBytesQueued + selectedFile.size > MAX_VIDEO_BYTES) {
        setUploadState({
          fileName: selectedFile.name,
          isVideo,
          progress: 0,
          done: false,
          error: "Video storage limit reached (150MB max)",
          queueIndex: i + 1,
          queueTotal: validFiles.length,
        });
        return;
      }

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

        const created = await createContent({
          name,
          type: isVideo ? "video" : "image",
          mediaUrl: uploadResult.url,
          thumbnailUrl: uploadResult.thumbnailUrl,
          sizeBytes: uploadResult.bytes,
          ...(durationInMillis && { durationInMillis }),
        });

        // createContent resolves (doesn't throw) on a quota rejection too —
        // apiFetch returns the JSON body regardless of status code, so an
        // error here looks like { message: "..." } with no _id, same
        // convention used elsewhere in this app.
        if (!created?._id) {
          setUploadState((s) =>
            s
              ? {
                  ...s,
                  error:
                    created?.message ||
                    `Upload failed for "${selectedFile.name}". Please try again.`,
                }
              : s,
          );
          return;
        }

        if (isVideo) {
          videoBytesQueued += uploadResult.bytes || 0;
        } else {
          imagesQueued += 1;
        }

        fetchContent();

        const isLast = i === validFiles.length - 1;
        if (isLast) {
          setUploadState((s) => (s ? { ...s, progress: 100, done: true } : s));
        }
      } catch (err) {
        if (err.name === "AbortError") {
          setUploadState(null);
        } else {
          setUploadState((s) =>
            s
              ? {
                  ...s,
                  error: `Upload failed for "${selectedFile.name}". Please try again.`,
                }
              : s,
          );
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
    toggleCheckedAll(visibleContent.map((item) => item._id));
  }

  function toggleSelect(id, e) {
    e.stopPropagation();
    toggleChecked(id);
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
      videoBytes: content
        .filter((c) => c.type === "video")
        .reduce((sum, c) => sum + (c.sizeBytes || 0), 0),
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

      {/* fixed header: stays put, only the grid below scrolls (nested ScrollBox).
          pr-4 matches the grid's own scrollbar gutter (ScrollBox below) — but
          only when the Details panel is closed. With it open, the panel's own
          border is the row's real right edge, not the grid's scrollbar. */}
      <div className={`flex-shrink-0 ${inspectedItem ? "" : "pr-4"}`}>
        {/* row 1: title + count + quota (left, two lines), search (right,
            vertically centered against the full left column via items-center) */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex flex-col gap-1 min-w-0 flex-shrink-0">
            <div className="flex items-baseline gap-2 min-w-0">
              <h1 className="text-text-primary text-xl font-bold whitespace-nowrap">
                All content
              </h1>
              <span className="text-text-muted text-sm whitespace-nowrap">
                {pluralizeCount(visibleContent.length, "item")}
              </span>
            </div>
            <p className="text-text-muted text-xs whitespace-nowrap">
              <span className={quotaColorClass(counts.image, MAX_IMAGES)}>
                {counts.image}
              </span>
              /{MAX_IMAGES} images ·{" "}
              <span className={quotaColorClass(counts.videoBytes, MAX_VIDEO_BYTES)}>
                {formatMB(counts.videoBytes)}
              </span>
              /{formatMB(MAX_VIDEO_BYTES)} video · {counts.app} apps
            </p>
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
            onAddAppClick={() => setAppsPickerOpen(true)}
          />
        </ContentToolbar>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* content grid */}
        <div className="relative flex-1 min-h-0 flex">
          <ScrollBox ref={gridScrollRef} className="flex-1 pr-4 pt-2 pb-20 md:pb-0">
            {loading ? (
              <SkeletonGrid />
            ) : content.length === 0 ? (
              <ContentEmptyState
                onUploadClick={openFilePicker}
                onAddAppClick={() => setAppsPickerOpen(true)}
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
                    onEdit={handleTileEdit}
                  />
                ))}
              </div>
            )}
          </ScrollBox>
          <ScrollToTopButton scrollRef={gridScrollRef} />
        </div>

        {/* inspector panel */}
        {inspectedItem && (
          <ContentDetailsPanel
            key={inspectedItem._id}
            item={inspectedItem}
            onClose={() => setInspectedId(null)}
            onSave={handleSaveItem}
            onDelete={(item) => setSingleDeleteTarget(item)}
            onOpenAppSettings={
              inspectedItem.type === "app"
                ? () => {
                    setInspectedId(null);
                    openAppSettingsModal(inspectedItem);
                  }
                : undefined
            }
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
        error={uploadState?.error}
        queueIndex={uploadState?.queueIndex}
        queueTotal={uploadState?.queueTotal}
        onCancel={handleCancelUpload}
        onClose={() => setUploadState(null)}
      />

      <AppsPickerModal
        open={appsPickerOpen}
        onOpenChange={setAppsPickerOpen}
        onSelectApp={(app) => {
          setAppsPickerOpen(false);
          if (app.name === "Weather") {
            setWeatherEditTarget(null);
            setWeatherSettingsOpen(true);
          } else if (app.name === "Clock") {
            setClockEditTarget(null);
            setClockSettingsOpen(true);
          } else {
            // TODO: other apps (RSS/Announcements) don't have a settings
            // screen built yet — Weather and Clock are first.
            console.log("No settings screen built yet for:", app.name);
          }
        }}
      />

      <WeatherSettingsScreen
        // Remounts fresh every time this opens (key changes closed->open),
        // so all its internal state resets to defaults instead of carrying
        // over whatever was left from the last time it was open.
        key={weatherSettingsOpen ? weatherEditTarget?._id ?? "new" : "weather-closed"}
        open={weatherSettingsOpen}
        onOpenChange={setWeatherSettingsOpen}
        existingContent={weatherEditTarget}
        onSaved={fetchContent}
      />

      <ClockSettingsScreen
        key={clockSettingsOpen ? clockEditTarget?._id ?? "new" : "clock-closed"}
        open={clockSettingsOpen}
        onOpenChange={setClockSettingsOpen}
        existingContent={clockEditTarget}
        onSaved={fetchContent}
      />
    </div>
  );
}

export default Content;
