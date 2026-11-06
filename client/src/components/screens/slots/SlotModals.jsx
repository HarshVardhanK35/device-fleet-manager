import { Trash2 } from "lucide-react";

import ScreenThumb from "../ScreenThumb.jsx";
import TakeOverModal from "../TakeOverModal.jsx";
import PlayerStandinModal from "../PlayerStandinModal.jsx";
import PreviewModal from "../../modals/PreviewModal.jsx";
import RemoveConfirmModal from "../../modals/RemoveConfirmModal.jsx";
import StatusPill from "../../ui/StatusPill.jsx";

// The four dialogs of the Player page (preview, take over, remove, and the
// stand-in player shown after a take-over). `slots` is what
// hooks/useScreenSlots.js returns; only one dialog is open at a time
// (`slots.modal.mode`).
function SlotModals({ slots }) {
  const {
    modal,
    setModal,
    modalScreen,
    previewScreen,
    ack,
    setAck,
    takeOverError,
    setTakeOverError,
    removeError,
    setRemoveError,
    confirmTakeOver,
    removeScreen,
    releaseScreen,
  } = slots;

  return (
    <>
      <PreviewModal
        open={!!previewScreen}
        onOpenChange={(open) => !open && setModal(null)}
        title={previewScreen?.name}
        subtitle="Preview only — the physical screen keeps playing"
        media={previewScreen && <ScreenThumb playing={previewScreen.playing} bare />}
        meta={
          previewScreen
            ? [
                <StatusPill key="status" screen={previewScreen} />,
                <span key="playlist">
                  Playlist{" "}
                  <span className="text-text-primary">
                    {previewScreen.playing ? previewScreen.playing.playlistName : "Nothing scheduled"}
                  </span>
                </span>,
                ...(previewScreen.playing
                  ? [
                      <span key="item">
                        Item{" "}
                        <span className="text-text-primary">
                          {previewScreen.playing.name}
                          {previewScreen.playing.pos ? ` · ${previewScreen.playing.pos}` : ""}
                        </span>
                      </span>,
                    ]
                  : []),
                <span key="seen">{previewScreen.seen}</span>,
              ]
            : []
        }
      />

      <TakeOverModal
        open={modal?.mode === "take"}
        onOpenChange={(o) => {
          if (!o) {
            setModal(null);
            setTakeOverError("");
          }
        }}
        screen={modal?.mode === "take" ? modalScreen : null}
        ack={ack}
        onAckToggle={() => setAck((v) => !v)}
        onConfirm={confirmTakeOver}
        error={takeOverError}
      />

      <RemoveConfirmModal
        open={modal?.mode === "remove"}
        onOpenChange={(o) => {
          if (!o) {
            setModal(null);
            setRemoveError("");
          }
        }}
        icon={Trash2}
        title={modal?.mode === "remove" ? `Remove ${modalScreen?.name}?` : ""}
        description="It's unpaired from your account and frees one of your 3 slots. To use it again, pair it with a new code."
        confirmLabel="Remove screen"
        onConfirm={() => modalScreen && removeScreen(modalScreen.id)}
        error={removeError}
      />

      <PlayerStandinModal
        open={modal?.mode === "player"}
        onOpenChange={(o) => !o && setModal(null)}
        screen={modal?.mode === "player" ? modalScreen : null}
        onRelease={() => modalScreen && releaseScreen(modalScreen.id)}
      />
    </>
  );
}

export default SlotModals;

// Used by: pages/PlayerSlots.jsx.
