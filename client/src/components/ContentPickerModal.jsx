import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";

import ContentTile from "./ContentTile.jsx";
import ScrollBox from "./ScrollBox.jsx";
import Button from "./Button.jsx";
import CancelButton from "./CancelButton.jsx";
import SelectCheckbox from "./SelectCheckbox.jsx";

function ContentPickerModal({
  open,
  onOpenChange,
  content,
  title,
  submitLabel = "Save",
  showNameField = true,
  initialSelectedIds = [],
  layout = "single",
  onSubmit,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set(initialSelectedIds));

  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setSelectedIds(new Set(initialSelectedIds));
    }
  }, [open]);

  function toggleSelect(id, e) {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(name, description, Array.from(selectedIds));
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-panel p-6 rounded-lg w-[min(90vw,1000px)] max-h-[85vh] flex flex-col z-40">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-bg-hover">
            <Dialog.Title className="text-text-primary font-bold">
              {title}
            </Dialog.Title>
            <CancelButton as={Dialog.Close} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col flex-1 min-h-0 gap-3"
          >
            {layout === "split" ? (
              <div className="flex gap-6 flex-1 min-h-0">
                <div className="w-64 flex-shrink-0">
                  {showNameField && (
                    <>
                      <label className="block text-text-muted text-xs font-semibold mb-1.5">
                        Enter playlist name
                      </label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter playlist name"
                        required
                        className="bg-bg-hover text-text-primary px-2 py-1 rounded w-full mb-5"
                      />

                      <label className="block text-text-muted text-xs font-semibold mb-1.5">
                        Enter description
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter description (optional)"
                        rows={3}
                        className="bg-bg-hover text-text-primary px-2 py-1 rounded w-full resize-y min-h-[4.5rem] max-h-[300px] dark-scrollbar"
                      />
                    </>
                  )}
                </div>

                <ScrollBox className="pl-6 pr-4 border-l border-bg-hover">
                  <label className="block text-text-muted text-xs font-semibold mb-2">
                    Select content for this playlist
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {content.map((item) => (
                      <ContentTile
                        key={item._id}
                        item={item}
                        size="fluid"
                        className={
                          selectedIds.has(item._id)
                            ? "border-2 border-accent-blue -translate-y-0.5"
                            : ""
                        }
                      >
                        <SelectCheckbox
                          shape="circle"
                          checked={selectedIds.has(item._id)}
                          onClick={(e) => toggleSelect(item._id, e)}
                          className="absolute left-1.5 top-1.5 z-10"
                        />
                      </ContentTile>
                    ))}
                  </div>
                </ScrollBox>
              </div>
            ) : (
              <>
                {showNameField && (
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter playlist name"
                    required
                    className="bg-bg-hover text-text-primary px-2 py-1 rounded"
                  />
                )}

                <ScrollBox className="pt-3 pb-1 pl-1 pr-4">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {content.map((item) => (
                      <ContentTile
                        key={item._id}
                        item={item}
                        size="fluid"
                        className={
                          selectedIds.has(item._id)
                            ? "border-2 border-accent-blue -translate-y-0.5"
                            : ""
                        }
                      >
                        <SelectCheckbox
                          shape="circle"
                          checked={selectedIds.has(item._id)}
                          onClick={(e) => toggleSelect(item._id, e)}
                          className="absolute left-1.5 top-1.5 z-10"
                        />
                      </ContentTile>
                    ))}
                  </div>
                </ScrollBox>
              </>
            )}

            <div className="inline-flex items-center justify-end gap-2 mt-1 pt-3 border-t border-bg-hover">
              <Dialog.Close
                type="button"
                className="text-text-muted border border-border-muted hover:border-border-hover hover:bg-bg-hover hover:text-text-primary rounded-lg px-3 py-1 text-sm transition-colors"
              >
                Cancel
              </Dialog.Close>
              <Button type="submit">{submitLabel}</Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default ContentPickerModal;

// Shared modal for picking content from the library (Radix Dialog +
// ContentTile grid + ScrollBox). Two layouts: "split" (name field left,
// tile grid right — used for Create Playlist) and "single" (name field
// optional, just a tile grid — used for Add Content, no name needed).
// `showNameField` toggles the name input; `initialSelectedIds` pre-checks
// existing selections when editing rather than creating fresh.
// Used by: pages/Playlists.jsx (Create Playlist + Add Content modals).
