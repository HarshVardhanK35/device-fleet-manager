import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import ScrollBox from "./ScrollBox.jsx";

function ConfirmDeleteModal({ open, onOpenChange, title, items, onConfirm }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-panel p-6 rounded-lg w-96 z-40">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-text-primary font-bold">
              {title}
            </Dialog.Title>
            <Dialog.Close
              type="button"
              className="text-text-muted hover:text-accent-red"
            >
              <X size={18} />
            </Dialog.Close>
          </div>

          {items.length === 1 ? (
            <p className="text-text-muted text-sm mb-6">
              Are you sure you want to delete "{items[0].name}"? This action
              cannot be undone.
            </p>
          ) : (
            <>
              <p className="text-text-muted text-sm mb-3">
                Are you sure you want to delete these {items.length} items? This
                action cannot be undone.
              </p>
              <div className="flex flex-col flex-1 min-h-0 max-h-40 mb-4">
                <ScrollBox className="pr-4">
                  <ul className="flex flex-col gap-1">
                    {items.map((item) => (
                      <li
                        key={item.id}
                        className="text-text-primary text-sm bg-bg-hover rounded px-2 py-1"
                      >
                        {item.name}
                      </li>
                    ))}
                  </ul>
                </ScrollBox>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2">
            <Dialog.Close type="button" className="text-text-muted px-3 py-1">
              Cancel
            </Dialog.Close>
            <button
              onClick={onConfirm}
              className="bg-accent-red text-white px-3 py-1 rounded"
            >
              Confirm
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default ConfirmDeleteModal;
