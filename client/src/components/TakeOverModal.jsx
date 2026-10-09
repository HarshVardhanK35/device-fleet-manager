import * as Dialog from "@radix-ui/react-dialog";
import { Plug, StopCircle, Info, Check } from "lucide-react";

import GhostButton from "./GhostButton.jsx";

function TakeOverModal({ open, onOpenChange, screen, ack, onAckToggle, onConfirm }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-panel border border-border-muted rounded-xl w-[440px] max-w-[calc(100vw-32px)] max-h-[85vh] flex flex-col z-40">
          {screen && (
            <>
              <div className="flex flex-col gap-4 px-6 pt-6 pb-5 min-h-0 overflow-auto">
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 flex-none rounded-[10px] bg-accent-red/15 text-accent-red flex items-center justify-center">
                    <Plug size={18} />
                  </span>
                  <div className="flex-1 min-w-0 flex flex-col gap-1 pt-0.5">
                    <Dialog.Title className="text-text-primary font-bold text-lg m-0 leading-tight">
                      Take over {screen.name}?
                    </Dialog.Title>
                    <p className="text-text-muted text-sm m-0 leading-relaxed">
                      This opens the full player here and{" "}
                      <span className="text-text-primary">
                        disconnects the physical screen immediately
                      </span>
                      . A screen allows one connection at a time, so it stays dark
                      until you release it.
                    </p>
                  </div>
                </div>

                {screen.playing ? (
                  <div className="flex items-center gap-2.5 flex-wrap p-2.5 rounded-lg border border-border-muted bg-bg-primary text-xs">
                    <StopCircle size={16} className="text-accent-red" />
                    <span className="text-text-muted">Will stop on the screen:</span>
                    <span className="text-text-primary">
                      {screen.playing.playlist} — {screen.playing.item}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border-muted bg-bg-primary text-xs text-text-muted leading-relaxed">
                    <Info size={16} className="flex-none" />
                    <span>
                      {screen.status === "offline"
                        ? "This screen is offline, so nothing will be interrupted — it can't reconnect while you hold it."
                        : "Nothing is scheduled, but the screen will still drop its connection."}
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={onAckToggle}
                  role="checkbox"
                  aria-checked={ack}
                  className="flex items-start gap-2.5 text-left text-sm select-none"
                >
                  <span
                    className={`w-4 h-4 mt-0.5 flex-none rounded flex items-center justify-center border ${
                      ack ? "bg-accent-red border-accent-red" : "border-border-hover"
                    }`}
                  >
                    {ack && <Check size={11} className="text-white" />}
                  </span>
                  <span className="text-text-primary">
                    I understand {screen.name} will be disconnected right now.
                  </span>
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border-muted">
                <GhostButton as={Dialog.Close} size="lg">
                  Cancel
                </GhostButton>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={!ack}
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-accent-red hover:brightness-110 text-bg-primary text-sm font-semibold transition-[filter] disabled:opacity-40 disabled:pointer-events-none"
                >
                  <Plug size={16} />
                  Disconnect &amp; take over
                </button>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default TakeOverModal;

// Confirms the destructive "take over a live screen" action — disconnects
// the physical device immediately, since only one connection per screen is
// ever allowed. Styled to match RemoveConfirmModal.jsx/ConfirmDeleteModal.jsx's
// confirm-dialog language (icon badge, Dialog.Title, border-t footer, solid
// red action button) instead of a one-off red-bordered card. Still requires
// the explicit acknowledgment checkbox before the take-over button enables.
// Used by: pages/PlayerSlots.jsx.
