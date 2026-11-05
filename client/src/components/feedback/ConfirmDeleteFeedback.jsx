import * as Dialog from "@radix-ui/react-dialog";

import { useAsyncAction } from "../../hooks/useAsyncAction.js";
import LoadingOverlay from "../loading/LoadingOverlay.jsx";
import { FbButton } from "./FeedbackButtons.jsx";

// "Delete this message?" for both sides (`admin` changes the wording).
function ConfirmDeleteFeedback({ open, admin = false, onCancel, onConfirm }) {
  const [confirm, busy] = useAsyncAction(onConfirm);
  const body = admin
    ? "It will be removed from the inbox and from the user's Feedback page. This can't be undone."
    : "It hasn't been read yet. Deleting it does not give your slot back.";

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && !busy && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="cw-scrim-in fixed inset-0 z-[60] bg-black/65 backdrop-blur-sm" />
        <Dialog.Content className="cw-pop-in fixed z-[70] left-3 right-3 top-[280px] md:left-0 md:right-0 md:mx-auto md:top-[380px] md:w-[460px] lg:top-[220px] lg:w-[420px] bg-bg-panel border border-border-muted rounded-[14px] md:rounded-xl shadow-2xl outline-none">
          <div className="flex flex-col gap-2 px-5 pt-5 pb-1">
            <Dialog.Title className="m-0 text-[17px] font-semibold text-text-primary">Delete this message?</Dialog.Title>
            <Dialog.Description className="m-0 text-sm text-text-muted">{body}</Dialog.Description>
          </div>
          <div className="grid grid-cols-2 md:flex md:justify-end gap-2 px-5 pt-4 pb-5">
            <FbButton onClick={onCancel} disabled={busy}>
              Cancel
            </FbButton>
            <FbButton variant="danger" onClick={confirm} disabled={busy} className="md:px-4">
              {busy ? "Deleting…" : "Delete"}
            </FbButton>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
      <LoadingOverlay show={busy} />
    </Dialog.Root>
  );
}

export default ConfirmDeleteFeedback;

// Used by: pages/Feedback.jsx, pages/AdminInbox.jsx.
