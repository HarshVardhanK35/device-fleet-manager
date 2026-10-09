import * as Dialog from "@radix-ui/react-dialog";
import { Trash2 } from "lucide-react";

import ScrollBox from "./ScrollBox.jsx";

function ConfirmDeleteModal({ open, onOpenChange, title, items, onConfirm }) {
  const itemLabel = `${items.length} item${items.length === 1 ? "" : "s"}`;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-panel border border-border-muted rounded-xl w-[440px] max-w-[calc(100vw-32px)] max-h-[85vh] flex flex-col z-40">
          <div className="flex flex-col gap-4 px-6 pt-6 pb-5 min-h-0 overflow-auto">
            <div className="flex items-start gap-3">
              <span className="w-9 h-9 flex-none rounded-[10px] bg-accent-red/15 text-accent-red flex items-center justify-center">
                <Trash2 size={18} />
              </span>
              <div className="flex-1 min-w-0 flex flex-col gap-1 pt-0.5">
                <Dialog.Title className="text-text-primary font-bold text-lg m-0 leading-tight">
                  {title}
                </Dialog.Title>
                <p className="text-text-muted text-sm m-0">
                  {items.length === 1
                    ? `"${items[0].name}" will be permanently deleted. This action cannot be undone.`
                    : `These ${itemLabel} will be permanently deleted. This action cannot be undone.`}
                </p>
              </div>
            </div>

            {items.length > 1 && (
              <div className="border border-border-muted rounded-[10px] bg-bg-primary overflow-hidden">
                <ScrollBox className="max-h-[260px]">
                  <div className="flex flex-col">
                    {items.map((item, index) => (
                      <div
                        key={item.id}
                        className={`px-3 py-2.5 text-sm font-semibold text-text-primary ${
                          index > 0 ? "border-t border-border-muted" : ""
                        }`}
                      >
                        {item.name}
                      </div>
                    ))}
                  </div>
                </ScrollBox>
              </div>
            )}
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
              <Trash2 size={16} />
              Delete {itemLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default ConfirmDeleteModal;

// Reusable destructive-action confirmation dialog (Radix Dialog), styled to
// match RemoveConfirmModal.jsx's visual language (icon badge, bordered
// item list, red "Delete N items" button with icon) instead of the old
// plain text-list + generic "Confirm" button. Takes `items`: an array of
// { id, name }. One item renders inline in the subtitle; two or more
// render a bordered, scrollable name list so the user can verify the full
// scope of a bulk delete before confirming. Unlike RemoveConfirmModal,
// this has no reassurance copy or type badges — it's for *actual*
// deletion (playlists, assignments, content), not playlist-membership/
// pairing removal, so nothing "stays" anywhere.
// Used by: pages/Assignments.jsx (delete assignment), pages/Content.jsx
// (bulk delete), pages/Playlists.jsx (delete playlist, bulk delete
// playlists). For removing content from a playlist, or unpairing a
// screen, see RemoveConfirmModal.jsx.
