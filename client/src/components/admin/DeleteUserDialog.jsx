import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";

import { useAsyncAction } from "../../hooks/useAsyncAction.js";
import LoadingOverlay from "../loading/LoadingOverlay.jsx";

// "Delete this user?": the Delete button stays off until the admin types the
// user's exact email. Sits above the details panel / modal.
function DeleteUserDialog({ user, onCancel, onConfirm }) {
  const [typed, setTyped] = useState("");
  const [error, setError] = useState("");
  const [confirm, busy] = useAsyncAction(async () => {
    setError("");
    try {
      await onConfirm();
    } catch (err) {
      setError(err.message || "Could not delete this user");
    }
  });
  const matches = typed.trim() === user.email;

  return (
    <Dialog.Root open onOpenChange={(o) => !o && !busy && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[70] -translate-x-1/2 -translate-y-1/2 w-[440px] max-w-[calc(100vw-32px)] p-6 bg-bg-panel border border-border-muted rounded-2xl shadow-2xl outline-none">
          <Dialog.Title className="m-0 text-xl font-semibold leading-snug text-text-primary">Delete this user?</Dialog.Title>
          <Dialog.Description className="mt-2 mb-0 text-sm leading-relaxed text-text-muted">
            The user, their screens and their schedules will be deleted permanently. This can&apos;t be undone.
          </Dialog.Description>
          <label htmlFor="del-email" className="block mt-5 text-[13px] text-text-primary">
            Type <strong className="font-semibold [overflow-wrap:anywhere]">{user.email}</strong> to confirm
          </label>
          <input
            id="del-email"
            autoFocus
            autoComplete="off"
            spellCheck={false}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            className="w-full h-12 sm:h-10 mt-2 px-3.5 bg-bg-primary border border-border-muted text-text-primary text-base sm:text-sm rounded-[10px] outline-none focus-visible:border-accent-blue focus-visible:ring-[3px] focus-visible:ring-accent-blue/25"
          />
          {error && <p className="mt-2 mb-0 text-sm text-accent-red">{error}</p>}
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="flex-1 sm:flex-none h-12 sm:h-10 px-[18px] rounded-full border border-border-muted text-text-primary text-sm hover:bg-bg-hover disabled:opacity-45"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={!matches || busy}
              className="flex-1 sm:flex-none h-12 sm:h-10 px-5 rounded-full bg-accent-red text-white text-sm font-semibold transition-[filter,opacity] hover:brightness-110 disabled:opacity-45 disabled:cursor-not-allowed"
            >
              {busy ? "Deleting…" : "Delete"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
      <LoadingOverlay show={busy} />
    </Dialog.Root>
  );
}

export default DeleteUserDialog;

// Used by: pages/AdminUsers.jsx.
