import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Check } from "lucide-react";

import ContentTile from "./ContentTile.jsx";
import ScrollBox from "./ScrollBox.jsx";

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
  const [selectedIds, setSelectedIds] = useState(new Set(initialSelectedIds));

  useEffect(() => {
    if (open) {
      setName("");
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
    onSubmit(name, Array.from(selectedIds));
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-panel p-6 rounded-lg w-[min(90vw,1000px)] max-h-[85vh] flex flex-col z-40">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-text-primary font-bold">
              {title}
            </Dialog.Title>
            <Dialog.Close className="text-text-muted hover:text-accent-red transition-colors">
              <X size={18} />
            </Dialog.Close>
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
                        className="bg-bg-hover text-text-primary px-2 py-1 rounded w-full"
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
                        <button
                          type="button"
                          onClick={(e) => toggleSelect(item._id, e)}
                          className={`absolute left-1.5 top-1.5 z-10 w-[18px] h-[18px] rounded-full flex items-center justify-center border-[1.5px] border-accent-blue shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-opacity ${
                            selectedIds.has(item._id)
                              ? "bg-accent-blue opacity-100"
                              : "bg-white/95 opacity-0 group-hover:opacity-100"
                          }`}
                        >
                          {selectedIds.has(item._id) && (
                            <Check
                              size={10}
                              className="text-white"
                              strokeWidth={3}
                            />
                          )}
                        </button>
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
                        <button
                          type="button"
                          onClick={(e) => toggleSelect(item._id, e)}
                          className={`absolute left-1.5 top-1.5 z-10 w-[18px] h-[18px] rounded-full flex items-center justify-center border-[1.5px] border-accent-blue shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-opacity ${
                            selectedIds.has(item._id)
                              ? "bg-accent-blue opacity-100"
                              : "bg-white/95 opacity-0 group-hover:opacity-100"
                          }`}
                        >
                          {selectedIds.has(item._id) && (
                            <Check
                              size={10}
                              className="text-white"
                              strokeWidth={3}
                            />
                          )}
                        </button>
                      </ContentTile>
                    ))}
                  </div>
                </ScrollBox>
              </>
            )}

            <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-bg-hover">
              <Dialog.Close type="button" className="text-text-muted px-3 py-1">
                Cancel
              </Dialog.Close>
              <button
                type="submit"
                className="bg-accent-blue text-white px-3 py-1 rounded"
              >
                {submitLabel}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default ContentPickerModal;
