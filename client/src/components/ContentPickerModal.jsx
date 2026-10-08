import { useState, useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Search } from "lucide-react";

import ContentTile from "./ContentTile.jsx";
import ScrollBox from "./ScrollBox.jsx";
import Button from "./Button.jsx";
import CancelButton from "./CancelButton.jsx";
import SelectCheckbox from "./SelectCheckbox.jsx";
import ContentFilterSortBar from "./ContentFilterSortBar.jsx";
import PickerSelectionStatus from "./PickerSelectionStatus.jsx";

// Owns all the form/selection state. Rendered only while `open` is true, so
// it mounts fresh (and gets fresh initial state) every time the modal opens
// — avoids syncing props into state via a useEffect (see
// react-hooks/set-state-in-effect; same pattern as ContentDetailsPanel.jsx).
function PickerFormBody({
  content,
  submitLabel,
  showNameField,
  initialSelectedIds,
  onSubmit,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIds, setSelectedIds] = useState(initialSelectedIds);
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [search, setSearch] = useState("");
  const [alertKey, setAlertKey] = useState(0);

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

  function toggleSelect(id, e) {
    e.stopPropagation();
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

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) {
      setAlertKey((k) => k + 1);
      return;
    }
    onSubmit(name, description, selectedIds);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
      <div className="flex flex-col gap-5 pl-11 pr-6 pb-5 flex-1 min-h-0">
        {showNameField && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-5">
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

        <div className="flex flex-col gap-3 flex-1 min-h-0">
          {showNameField && (
            <span className="text-text-muted text-xs font-semibold">
              Starting content{" "}
              <span className="font-normal">
                · plays in the order you pick
              </span>
            </span>
          )}

          <div className="flex flex-col gap-2.5 pr-5">
            <div className="flex items-center justify-between gap-2">
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

              <ContentFilterSortBar
                counts={counts}
                filterValue={filterType}
                onFilterChange={setFilterType}
                sortValue={sortBy}
                onSortChange={setSortBy}
              />
            </div>

            <div className="relative">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search library"
                className="w-full bg-bg-primary border border-border-muted rounded-lg pl-8 pr-3 h-[38px] text-sm text-text-primary outline-none focus-visible:border-accent-blue"
              />
            </div>
          </div>

          <ScrollBox className="pr-5 pt-2">
            {visibleContent.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-8">
                Nothing in your library matches
                {search ? ` "${search}"` : " this filter"}.
              </p>
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
            )}
          </ScrollBox>
        </div>
      </div>

      <div className="flex items-center gap-2 pl-11 pr-6 py-4 border-t border-border-muted">
        <PickerSelectionStatus
          nameRequired={showNameField}
          hasName={name.trim().length > 0}
          selectedCount={selectedIds.length}
          selectedDurationMs={selectedDurationMs}
          onClear={() => setSelectedIds([])}
          alertKey={alertKey}
        />
        <div className="flex-1" />
        <Dialog.Close
          type="button"
          className="h-10 text-text-muted border border-border-muted hover:border-border-hover hover:bg-bg-hover hover:text-text-primary rounded-lg px-4 text-sm font-semibold transition-colors"
        >
          Cancel
        </Dialog.Close>
        <Button type="submit">{submitLabel}</Button>
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
  showNameField = true,
  initialSelectedIds = [],
  onSubmit,
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-panel border border-border-muted rounded-xl w-[760px] max-w-[calc(100vw-32px)] max-h-[85vh] flex flex-col z-40">
          <div className="flex items-start gap-3 pl-11 pr-6 pt-5 pb-4">
            <div className="flex-1 min-w-0">
              <Dialog.Title className="text-text-primary font-bold text-lg m-0">
                {title}
              </Dialog.Title>
              {subtitle && (
                <p className="text-text-muted text-sm mt-1 truncate">
                  {subtitle}
                </p>
              )}
            </div>
            <CancelButton as={Dialog.Close} />
          </div>

          {open && (
            <PickerFormBody
              content={content}
              submitLabel={submitLabel}
              showNameField={showNameField}
              initialSelectedIds={initialSelectedIds}
              onSubmit={onSubmit}
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
// added. `onSubmit(name, description, orderedIds)`.
// Used by: pages/Playlists.jsx (Create Playlist + Add Content modals).
