import * as Dialog from "@radix-ui/react-dialog";
import { CircleMinus } from "lucide-react";

import ScrollBox from "./ScrollBox.jsx";
import GhostButton from "./GhostButton.jsx";
import { getTypeMeta } from "../utils/contentTypeMeta.js";

function RemoveConfirmModal({
  open,
  onOpenChange,
  icon: Icon = CircleMinus,
  title,
  description,
  items,
  confirmLabel,
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
                <Icon size={18} />
              </span>
              <div className="flex-1 min-w-0 flex flex-col gap-1 pt-0.5">
                <Dialog.Title className="text-text-primary font-bold text-lg m-0 leading-tight">
                  {title}
                </Dialog.Title>
                <p className="text-text-muted text-sm m-0 leading-relaxed">{description}</p>
              </div>
            </div>

            {items && items.length > 0 && (
              <div className="border border-border-muted rounded-[10px] bg-bg-primary overflow-hidden">
                <ScrollBox className="max-h-[260px]">
                  <div className="flex flex-col">
                    {items.map((item, index) => {
                      const meta = item.type ? getTypeMeta(item.type) : null;
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
                          {meta && (
                            <span
                              className={`flex-none text-[10px] font-bold px-[6px] py-[2px] rounded-[5px] ${meta.textClass} ${meta.bgClass}`}
                            >
                              {meta.label}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollBox>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border-muted">
            <GhostButton as={Dialog.Close} size="lg">
              Cancel
            </GhostButton>
            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-accent-red hover:brightness-110 text-bg-primary text-sm font-semibold transition-[filter]"
            >
              <Icon size={16} />
              {confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default RemoveConfirmModal;

// Generic "remove/unpair something" confirmation dialog (Radix Dialog):
// icon badge, title, description, an optional bordered item list (position
// badge, name, colored type badge), and a Cancel/solid-red-confirm footer.
// `items` is optional — pass [{ id, name, type? }] for a bulk removal with
// a visible list (type badge shown only when `type` is given), or omit it
// entirely for a single-entity removal with no list. Distinct from
// ConfirmDeleteModal (actual, permanent deletion of records); this is for
// "removed from this list/pairing, but the underlying thing still exists
// elsewhere" actions.
// Used by: pages/Playlists.jsx (remove content from a playlist, bulk),
// pages/PlayerSlots.jsx (unpair/remove a screen, single).
