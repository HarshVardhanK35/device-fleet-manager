import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { useFeedbackForm } from "../../hooks/useFeedbackForm.js";
import LoadingOverlay from "../loading/LoadingOverlay.jsx";
import FeedbackFields from "./FeedbackFields.jsx";
import { FbButton, FooterRight, FooterSplit } from "./FeedbackButtons.jsx";

function NewFeedbackBody({ remaining, limit, onClose, onSent, portalContainer }) {
  const form = useFeedbackForm({ remaining, limit, onSent });

  const buttons = (
    <>
      <FbButton onClick={onClose} disabled={form.sending}>
        <span className="hidden md:inline">Cancel</span>
        <span className="md:hidden">Close</span>
      </FbButton>
      <FbButton
        variant="primary"
        onClick={form.send}
        disabled={form.blocked || form.sending}
        className="md:px-[18px]"
      >
        Send
      </FbButton>
    </>
  );

  return (
    <>
      <div className="flex items-center justify-between pl-5 pr-3 pt-3 pb-1">
        <Dialog.Title className="m-0 text-[17px] font-semibold text-text-primary">New feedback</Dialog.Title>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="w-11 h-11 md:w-9 md:h-9 rounded-md grid place-items-center text-text-muted hover:bg-bg-hover hover:text-text-primary transition-colors"
        >
          <X size={18} />
        </button>
      </div>
      <Dialog.Description className="sr-only">Send a message to the admin</Dialog.Description>

      <div className="px-5 pt-2 pb-5 overflow-y-auto">
        <FeedbackFields form={form} id="fb-modal" portalContainer={portalContainer} />
      </div>

      <FooterRight>{buttons}</FooterRight>
      <FooterSplit>{buttons}</FooterSplit>
      <LoadingOverlay show={form.sending} />
    </>
  );
}

// The "New feedback" dialog, for tablet and phone (on desktop the same form
// sits beside the list, see InlineFeedbackForm). `remaining` / `limit` come
// from the server (GET /feedback/mine). Mounted fresh on every open, so a
// draft never lingers.
function NewFeedbackModal({ open, onOpenChange, remaining, limit, onSent }) {
  // The dropdown's list must render inside the dialog (see StyledSelect).
  const [contentEl, setContentEl] = useState(null);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="cw-scrim-in fixed inset-0 z-30 bg-black/65 backdrop-blur-sm" />
        <Dialog.Content ref={setContentEl} className="cw-pop-in fixed z-40 left-3 right-3 top-16 md:left-0 md:right-0 md:mx-auto md:top-[200px] md:w-[600px] lg:top-[120px] lg:w-[560px] max-h-[calc(100dvh-80px)] flex flex-col bg-bg-panel border border-border-muted rounded-[14px] md:rounded-xl shadow-2xl outline-none">
          {open && (
            <NewFeedbackBody
              remaining={remaining}
              limit={limit}
              onClose={() => onOpenChange(false)}
              onSent={onSent}
              portalContainer={contentEl}
            />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default NewFeedbackModal;

// Used by: pages/Feedback.jsx.
