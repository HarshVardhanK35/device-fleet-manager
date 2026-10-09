import * as Dialog from "@radix-ui/react-dialog";
import { PlayCircle, Plug } from "lucide-react";

import ScreenThumb from "./ScreenThumb.jsx";
import GhostButton from "./GhostButton.jsx";
import ReleaseScreenButton from "./ReleaseScreenButton.jsx";

function PlayerStandinModal({ open, onOpenChange, screen, onRelease }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-panel border border-border-muted rounded-xl w-[640px] max-w-[calc(100vw-32px)] max-h-[85vh] overflow-auto z-40">
          {screen && (
            <>
              <div className="flex items-center gap-2.5 flex-wrap px-4 py-3 border-b border-border-muted bg-bg-primary">
                <PlayCircle size={18} className="text-accent-blue flex-none" />
                <div className="flex-1 min-w-[160px]">
                  <div className="text-text-primary text-sm font-semibold">
                    Full player · {screen.name}
                  </div>
                  <div className="text-text-muted text-xs">
                    Stand-in for the player route this action navigates to
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-accent-amber/15 text-accent-amber">
                  <Plug size={12} />
                  Physical screen disconnected
                </span>
              </div>
              <div className="aspect-video bg-black">
                <ScreenThumb playing={screen.playing} bare />
              </div>
              <div className="flex items-center justify-between flex-wrap gap-2.5 px-4 py-3">
                <span className="text-text-muted text-xs">
                  You hold the only connection to this screen.
                </span>
                <div className="flex gap-2 flex-wrap">
                  <GhostButton as={Dialog.Close} size="sm">
                    Back to Player tab
                  </GhostButton>
                  <ReleaseScreenButton onClick={onRelease} size="sm" />
                </div>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default PlayerStandinModal;

// Stand-in for the real player route — shown after "take over" until the
// user releases the screen back. No actual player/manifest rendering here
// (none exists for this feature yet); just the shell + a static thumbnail.
// Used by: pages/PlayerSlots.jsx.
