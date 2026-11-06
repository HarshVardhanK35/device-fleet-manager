import * as Dialog from "@radix-ui/react-dialog";
import { TYPE_LABEL } from "../../utils/feedbackMeta.js";
import CancelButton from "../ui/CancelButton.jsx";

// The frame of a message's details, for both sides:
//   phone    full screen
//   tablet   centred modal, 620px wide
//   desktop  a floating panel 16px from the right, like the Users page (no dim)
// The body and footer are passed in. Closing runs `onClose` (Esc, the dim, X).
function DetailsShell({ open, type, onClose, children }) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="cw-scrim-in fixed inset-0 z-[49] bg-black/65 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none max-md:hidden" />
        <Dialog.Content
          className={
            "cw-details-in fixed z-50 inset-0 flex flex-col overflow-hidden outline-none " +
            "bg-bg-primary border-border-muted shadow-2xl " +
            "md:m-auto md:h-fit md:w-[620px] md:max-h-[calc(100dvh-176px)] md:rounded-xl md:border md:bg-bg-panel " +
            "lg:inset-auto lg:right-4 lg:top-[124px] lg:bottom-4 lg:m-0 lg:h-auto lg:max-h-none lg:w-[480px] lg:rounded-2xl lg:border lg:bg-bg-panel"
          }
        >
          <div className="flex items-center gap-2 border-b border-border-muted py-2.5 pl-5 pr-3">
            <Dialog.Title className="m-0 text-[15px] font-semibold text-text-primary">Message</Dialog.Title>
            <span className="mr-auto text-[13px] text-text-muted">· {TYPE_LABEL[type] || ""}</span>
            <CancelButton onClick={onClose} title="Close" />
          </div>
          <Dialog.Description className="sr-only">Message details</Dialog.Description>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default DetailsShell;

// Used by: components/feedback/UserFeedbackDetails.jsx, AdminFeedbackDetails.jsx.
