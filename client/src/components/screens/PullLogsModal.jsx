import * as Dialog from "@radix-ui/react-dialog";
import { FileDown } from "lucide-react";

import Button from "../ui/Button.jsx";
import GhostButton from "../ui/GhostButton.jsx";
import LoadingOverlay from "../loading/LoadingOverlay.jsx";
import { useAsyncAction } from "../../hooks/useAsyncAction.js";

// Asks before pulling a screen's logs: it is only worth doing when a screen misbehaves, so the
// owner confirms first. The copy says when to use it, what happens, and what to do with the file.
//   screen     the screen whose logs would be pulled
//   onConfirm  async: pulls the logs (the dialog shows "Pulling…" until it settles)
function PullLogsModal({ open, onOpenChange, screen, onConfirm }) {
  const [confirm, busy] = useAsyncAction(onConfirm);

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-40 flex max-h-[85vh] w-[440px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl border border-border-muted bg-bg-panel">
          <div className="flex items-start gap-3 px-6 pb-5 pt-6">
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] bg-accent-blue/15 text-accent-blue">
              <FileDown size={18} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-2 pt-0.5">
              <Dialog.Title className="m-0 text-lg font-bold leading-tight text-text-primary">
                Pull logs{screen ? ` of ${screen.name}` : ""}?
              </Dialog.Title>
              <Dialog.Description className="m-0 text-sm text-text-primary/90">
                Only needed if this screen isn&apos;t working as expected.
              </Dialog.Description>
              <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-sm text-text-muted">
                <li className="flex gap-2">
                  <span aria-hidden className="mt-[7px] h-1 w-1 flex-none rounded-full bg-text-muted/60" />
                  <span>Saves the last 60 minutes as a .zip on this device.</span>
                </li>
                <li className="flex gap-2">
                  <span aria-hidden className="mt-[7px] h-1 w-1 flex-none rounded-full bg-text-muted/60" />
                  <span>
                    Email it to <span className="text-text-primary">hello@castwise.site</span> for help.
                  </span>
                </li>
              </ul>
              <p className="m-0 text-xs text-text-muted/80">The file can include your playlist names and app settings.</p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-border-muted px-6 py-4">
            <GhostButton as={Dialog.Close} size="lg" disabled={busy} className="disabled:pointer-events-none disabled:opacity-40">
              Cancel
            </GhostButton>
            <Button icon={FileDown} onClick={confirm} disabled={busy}>
              {busy ? "Pulling…" : "Pull logs"}
            </Button>
          </div>
          <LoadingOverlay show={busy} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default PullLogsModal;

// Used by: components/screens/slots/SlotModals.jsx.
