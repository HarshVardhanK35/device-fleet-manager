import * as Dialog from "@radix-ui/react-dialog";
import { CircleMinus } from "lucide-react";

import ScrollBox from "./ScrollBox.jsx";
import { getTypeMeta } from "../utils/contentTypeMeta.js";

function RemoveContentModal({
  open,
  onOpenChange,
  playlistName,
  items,
  onConfirm,
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-panel border border-border-muted rounded-xl w-[440px] max-w-[calc(100vw-32px)] max-h-[85vh] flex flex-col z-40">
          <div className="flex flex-col gap-4 px-6 pt-6 pb-5 min-h-0 overflow-auto">
            <div className="flex items-start gap-3">
              <span className="w-9 h-9 flex-none rounded-[10px] bg-accent-red/15 text-accent-red flex items-center justify-center">
                <CircleMinus size={18} />
              </span>
              <div className="flex-1 min-w-0 flex flex-col gap-1 pt-0.5">
                <Dialog.Title className="text-text-primary font-bold text-lg m-0 leading-tight">
                  Remove {items.length} item{items.length === 1 ? "" : "s"}?
                </Dialog.Title>
                <p className="text-text-muted text-sm m-0">
                  From &ldquo;{playlistName}&rdquo;. They stay in your
                  Content library and in any other playlists.
                </p>
              </div>
            </div>

            <div className="border border-border-muted rounded-[10px] bg-bg-primary overflow-hidden">
              <ScrollBox className="max-h-[260px]">
                <div className="flex flex-col">
                  {items.map((item, index) => {
                    const meta = getTypeMeta(item.type);
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 px-3 py-2 ${
                          index > 0 ? "border-t border-border-muted" : ""
                        }`}
                      >
                        <span className="text-xs font-bold text-text-muted tabular-nums min-w-[24px]">
                          #{index + 1}
                        </span>
                        <span className="flex-1 min-w-0 text-sm font-semibold text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">
                          {item.name}
                        </span>
                        <span
                          className={`flex-none text-[10px] font-bold px-[6px] py-[2px] rounded-[5px] ${meta.textClass} ${meta.bgClass}`}
                        >
                          {meta.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </ScrollBox>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border-muted">
            <Dialog.Close
              type="button"
              className="h-10 text-text-muted border border-border-muted hover:border-border-hover hover:bg-bg-hover hover:text-text-primary rounded-lg px-4 text-sm font-semibold transition-colors"
            >
              Cancel
            </Dialog.Close>
            <button
              onClick={onConfirm}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-accent-red hover:brightness-110 text-bg-primary text-sm font-semibold transition-[filter]"
            >
              <CircleMinus size={16} />
              Remove {items.length} item{items.length === 1 ? "" : "s"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default RemoveContentModal;

// Playlist-specific "remove content" confirmation (distinct from the
// generic ConfirmDeleteModal): icon badge, reassurance copy naming the
// playlist and reminding the items stay in the library/other playlists,
// and a bordered list of the actual items — position badge, name, colored
// type badge (no thumbnail — name/type is enough here) — instead of a
// plain name list. `items` is [{ id, name, type }], already in the order
// they'll be removed.
// Used by: pages/Playlists.jsx (bulk-remove content from a playlist).
