import { useState, useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { LayoutGrid, List, Loader2, Search } from "lucide-react";

import ContentTile from "./ContentTile.jsx";
import ScrollBox from "./ScrollBox.jsx";
import Button from "./Button.jsx";
import CancelButton from "./CancelButton.jsx";
import SelectCheckbox from "./SelectCheckbox.jsx";
import ContentFilterSortBar from "./ContentFilterSortBar.jsx";
import PickerSelectionStatus from "./PickerSelectionStatus.jsx";
import { useAsyncAction } from "../hooks/useAsyncAction.js";
import { getTypeMeta } from "../utils/contentTypeMeta.js";
import { formatDuration } from "../utils/formatDuration.js";
import { getOptimizedThumbnail } from "../utils/cloudinaryTransform.js";

// One library item as a compact row (the picker's List view) — about three
// times more items per screen than tiles, for big libraries.
function PickerRow({ item, selected, showDuration, onToggle }) {
  const meta = getTypeMeta(item.type);
  return (
    <div
      onClick={onToggle}
      className={`flex items-center gap-3 px-2.5 py-1.5 rounded-lg border cursor-pointer transition-colors ${
        selected
          ? "border-accent-blue bg-accent-blue/10"
          : "border-border-muted hover:border-border-hover hover:bg-bg-hover"
      }`}
    >
      <SelectCheckbox
        shape="square"
        checked={selected}
        onClick={onToggle}
        alwaysVisible
      />
      <span className="w-14 aspect-video flex-none rounded bg-[#201e1e] overflow-hidden flex items-center justify-center text-[10px] text-text-muted">
        {item.type === "app" ? (
          "App"
        ) : (
          <img
            src={getOptimizedThumbnail(item.thumbnailUrl || item.mediaUrl, 200)}
            alt=""
            className="w-full h-full object-contain"
            loading="lazy"
          />
        )}
      </span>
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <span
          title={item.name}
          className="text-sm font-semibold text-text-primary leading-snug line-clamp-2"
        >
          {item.name}
        </span>
        <span className="flex items-center gap-2">
          <span
            className={`flex-none text-[10px] font-bold px-[6px] py-[2px] rounded-[5px] ${meta.textClass} ${meta.bgClass}`}
          >
            <span className="sm:hidden">{meta.short}</span>
            <span className="hidden sm:inline">{meta.label}</span>
          </span>
          {showDuration && item.durationInMillis ? (
            <span className="text-xs text-text-muted tabular-nums">
              {formatDuration(item.durationInMillis)}
            </span>
          ) : null}
        </span>
      </div>
    </div>
  );
}

// Owns all the form/selection state. Rendered only while `open` is true, so
// it mounts fresh (and gets fresh initial state) every time the modal opens
// — avoids syncing props into state via a useEffect (see
// react-hooks/set-state-in-effect; same pattern as ContentDetailsPanel.jsx).
function PickerFormBody({
  content,
  submitLabel,
  busyLabel,
  showNameField,
  showTypeFilter,
  singleSelect,
  initialSelectedIds,
  onSubmit,
  portalContainer,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIds, setSelectedIds] = useState(initialSelectedIds);
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [search, setSearch] = useState("");
  const [alertKey, setAlertKey] = useState(0);
  // Grid (tiles) or List (rows); and "Selected" shows only what is ticked.
  const [view, setView] = useState("grid");
  const [selectedOnly, setSelectedOnly] = useState(false);

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
      list = list.filter((c) => c.type === filterType);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    if (selectedOnly) {
      list = list.filter((c) => selectedIds.includes(c._id));
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
  }, [content, filterType, search, sortBy, selectedOnly, selectedIds]);

  function toggleSelect(id, e) {
    e.stopPropagation();
    if (singleSelect) {
      setSelectedIds((prev) => (prev.includes(id) ? [] : [id]));
      return;
    }
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  const visibleIds = visibleContent.map((c) => c._id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const someVisibleSelected = visibleIds.some((id) => selectedIds.includes(id));

  function toggleSelectAllVisible() {
    if (allVisibleSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => [
        ...prev,
        ...visibleIds.filter((id) => !prev.includes(id)),
      ]);
    }
  }

  const selectedDurationMs = content
    .filter((c) => selectedIds.includes(c._id))
    .reduce((sum, c) => sum + (c.durationInMillis || 0), 0);

  const canSubmit =
    (!showNameField || name.trim().length > 0) && selectedIds.length > 0;

  // While an async onSubmit (create / add) runs, the button shows `busyLabel`.
  const [submit, busy] = useAsyncAction(onSubmit);

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) {
      setAlertKey((k) => k + 1);
      return;
    }
    submit(name, description, selectedIds);
  }

  const libraryGrid = visibleContent.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-8">
                {selectedOnly
                  ? "Nothing selected yet."
                  : `Nothing in your library matches${search ? ` "${search}"` : " this filter"}.`}
              </p>
            ) : view === "list" ? (
              <div className="flex flex-col gap-1.5">
                {visibleContent.map((item) => (
                  <PickerRow
                    key={item._id}
                    item={item}
                    selected={selectedIds.includes(item._id)}
                    showDuration={!singleSelect}
                    onToggle={(e) => toggleSelect(item._id, e)}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {visibleContent.map((item) => {
                  const order = selectedIds.indexOf(item._id);
                  return (
                    <ContentTile
                      key={item._id}
                      item={item}
                      size="fluid"
                      coloredType
                      showDuration={!singleSelect}
                      onClick={(e) => toggleSelect(item._id, e)}
                      className={
                        order !== -1
                          ? "!border-2 !border-accent-blue -translate-y-0.5"
                          : ""
                      }
                    >
                      <SelectCheckbox
                        shape="square"
                        checked={order !== -1}
                        onClick={(e) => toggleSelect(item._id, e)}
                        className="absolute left-1.5 top-1.5 z-10"
                      />
                    </ContentTile>
                  );
                })}
              </div>
            );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
      <div className="flex flex-col gap-5 pl-4 pr-4 sm:pl-11 sm:pr-6 pt-3 sm:pt-4 pb-5 sm:pb-0 flex-1 min-h-0 overflow-y-auto sm:overflow-visible">
        {showNameField && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:pr-5">
            <label className="flex flex-col gap-1.5">
              <span className="text-text-muted text-xs font-semibold">
                Name
              </span>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Lobby — Weekday"
                className="bg-bg-primary border border-border-muted rounded-lg px-3 h-10 text-text-primary text-sm outline-none focus-visible:border-accent-blue"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-text-muted text-xs font-semibold">
                Description <span className="font-normal">· optional</span>
              </span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={1}
                placeholder="Where it plays, when, and why"
                className="dark-scrollbar bg-bg-primary border border-border-muted rounded-lg px-3 py-2 text-text-primary text-sm outline-none focus-visible:border-accent-blue resize-y min-h-10 max-h-28"
              />
            </label>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-1 sm:min-h-0">
          {showNameField && (
            <span className="text-text-muted text-xs font-semibold">
              Starting content{" "}
              <span className="font-normal">
                · plays in the order you pick
              </span>
            </span>
          )}

          <div className="flex flex-col gap-2.5 sm:pr-5">
            <div className="flex items-center justify-between gap-2">
              {!singleSelect ? (
                <div className="flex items-center gap-2">
                  <SelectCheckbox
                    checked={allVisibleSelected}
                    indeterminate={someVisibleSelected && !allVisibleSelected}
                    onClick={toggleSelectAllVisible}
                    alwaysVisible
                  />
                  <span className="text-text-muted text-sm whitespace-nowrap">
                    Select all
                  </span>
                </div>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                {!singleSelect && (
                  <button
                    type="button"
                    aria-pressed={selectedOnly}
                    disabled={selectedIds.length === 0 && !selectedOnly}
                    onClick={() => setSelectedOnly((v) => !v)}
                    title="Show only the items you have ticked"
                    className={`h-8 px-3 rounded-lg border text-sm font-medium whitespace-nowrap transition-colors disabled:opacity-40 disabled:pointer-events-none ${
                      selectedOnly
                        ? "bg-[#102a4c] border-accent-blue text-text-primary"
                        : "border-border-muted text-text-muted hover:bg-bg-hover hover:text-text-primary"
                    }`}
                  >
                    Selected ({selectedIds.length})
                  </button>
                )}
                <div
                  role="group"
                  aria-label="View"
                  className="flex rounded-lg border border-border-muted overflow-hidden"
                >
                  {[
                    { key: "grid", label: "Grid view", Icon: LayoutGrid },
                    { key: "list", label: "List view", Icon: List },
                  ].map(({ key, label, Icon }) => (
                    <button
                      key={key}
                      type="button"
                      title={label}
                      aria-label={label}
                      aria-pressed={view === key}
                      onClick={() => setView(key)}
                      className={`w-8 h-8 flex items-center justify-center transition-colors ${
                        view === key
                          ? "bg-bg-hover text-text-primary"
                          : "text-text-muted hover:bg-bg-hover hover:text-text-primary"
                      }`}
                    >
                      <Icon size={15} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* search and filter / sort share one line */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 min-w-0">
                <Search
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search library"
                  className="w-full bg-bg-primary border border-border-muted rounded-lg pl-8 pr-3 h-9 text-sm text-text-primary outline-none focus-visible:border-accent-blue"
                />
              </div>

              <ContentFilterSortBar
                counts={counts}
                filterValue={filterType}
                onFilterChange={setFilterType}
                sortValue={sortBy}
                onSortChange={setSortBy}
                showFilter={showTypeFilter}
                portalContainer={portalContainer}
              />
            </div>
          </div>

          {/* Tall screens: the grid scrolls on its own. Short phones: the whole
              body scrolls instead, so the form fields can't squeeze the grid
              down to a sliver. */}
          <div className="sm:hidden pt-1">{libraryGrid}</div>
          <div className="hidden sm:flex flex-col flex-1 min-h-0">
            <ScrollBox className="sm:pr-5 pt-2 sm:pb-4">{libraryGrid}</ScrollBox>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-2 gap-y-3 pl-4 pr-4 sm:pl-11 sm:pr-6 py-4 border-t border-border-muted">
        <div className="w-full sm:w-auto">
        <PickerSelectionStatus
          nameRequired={showNameField}
          hasName={name.trim().length > 0}
          selectedCount={selectedIds.length}
          selectedDurationMs={selectedDurationMs}
          showDuration={!singleSelect}
          onClear={() => setSelectedIds([])}
          alertKey={alertKey}
        />
        </div>
        <div className="flex-1 hidden sm:block" />
        <Dialog.Close
          type="button"
          disabled={busy}
          className="flex-1 sm:flex-none h-10 disabled:opacity-40 disabled:pointer-events-none text-text-muted border border-border-muted hover:border-border-hover hover:bg-bg-hover hover:text-text-primary rounded-lg px-4 text-sm font-semibold transition-colors"
        >
          Cancel
        </Dialog.Close>
        <Button type="submit" disabled={busy} className="flex-1 sm:flex-none whitespace-nowrap">
          {busy && busyLabel ? <Loader2 size={14} className="animate-spin" /> : null}
          {busy && busyLabel ? busyLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function ContentPickerModal({
  open,
  onOpenChange,
  content,
  title,
  subtitle,
  submitLabel = "Save",
  busyLabel,
  showNameField = true,
  showTypeFilter = true,
  singleSelect = false,
  initialSelectedIds = [],
  onSubmit,
}) {
  // See StyledSelect.jsx's `portalContainer` comment — without this, the
  // Filter/Sort dropdowns' hover highlight silently breaks whenever this
  // modal is open, since Radix Dialog's pointer-events lockdown treats the
  // Select's default body-level portal as "outside" content.
  const [contentEl, setContentEl] = useState(null);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* z-50/z-60 — higher than AppSettingsShell's own Dialog (z-50
            content), since this modal can now open from inside that one
            (rss-modal.jsx's brand-logo picker). At the old z-30/z-40, this
            modal's overlay rendered BEHIND AppSettingsShell's opaque z-50
            panel — invisible, but still capturing clicks, which looked
            like the button did nothing and the screen was stuck. */}
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <Dialog.Content
          ref={setContentEl}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-panel border border-border-muted rounded-xl w-[760px] max-w-[calc(100vw-32px)] max-h-[85dvh] flex flex-col z-[60]"
        >
          <div className="flex items-center gap-3 pl-4 pr-4 sm:pl-11 sm:pr-6 pt-3 pb-3 sm:pt-5 sm:pb-4 border-b border-border-muted">
            <div className="flex-1 min-w-0">
              <Dialog.Title className="text-text-primary font-bold text-lg m-0">
                {title}
              </Dialog.Title>
              {subtitle && (
                <p className="text-text-muted text-sm mt-1 sm:truncate">
                  {subtitle}
                </p>
              )}
            </div>
            <CancelButton as={Dialog.Close} title="Close" />
          </div>

          {open && (
            <PickerFormBody
              content={content}
              submitLabel={submitLabel}
              busyLabel={busyLabel}
              showNameField={showNameField}
              showTypeFilter={showTypeFilter}
              singleSelect={singleSelect}
              initialSelectedIds={initialSelectedIds}
              onSubmit={onSubmit}
              portalContainer={contentEl}
            />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default ContentPickerModal;

// Shared modal for picking content from the library (Radix Dialog). Used
// for both "Create Playlist" (showNameField, name+description fields on
// top) and "Add Content" (no name field, just the picker). The content
// grid has a "Select all" checkbox (toggles every currently *visible* —
// filtered/searched — item) plus the same ContentFilterSortBar
// (filter/sort) + search used on the Content page. Selection is ORDERED
// (an array, not a Set) — each picked tile shows its pick-order number in
// place of a checkmark, since playlist content plays in the order it was
// added. `onSubmit(name, description, orderedIds)` may be async: the submit
// button then shows `busyLabel` (e.g. "Creating…") until it settles.
// Used by: pages/Playlists.jsx (Create Playlist + Add Content modals).
