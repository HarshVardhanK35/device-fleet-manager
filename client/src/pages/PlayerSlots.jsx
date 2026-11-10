import { Plus } from "lucide-react";

import PairingPanel from "../components/screens/slots/PairingPanel.jsx";
import ScreenDetails from "../components/screens/slots/ScreenDetails.jsx";
import SlotModals from "../components/screens/slots/SlotModals.jsx";
import SlotRail from "../components/screens/slots/SlotRail.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import SkeletonPanel from "../components/loading/SkeletonPanel.jsx";
import { useScreenSlots } from "../hooks/useScreenSlots.js";
import { usePaneCollapse } from "../hooks/usePaneCollapse.js";
import { useScreenStorage } from "../hooks/useScreenStorage.js";

function PlayerSlots() {
  const slots = useScreenSlots();
  const { screens, loading, selected, selectedSlot, mobileView, setMobileView } = slots;
  // What the selected screen last reported about its browser and offline storage.
  const storage = useScreenStorage(selected && !selected.pending ? selected.id : null, selected?.status);
  // Desktop: the slot list can be folded away to focus on one screen.
  const [listCollapsed, toggleList] = usePaneCollapse("player");

  return (
    <div
      className={`mx-auto md:max-w-none lg:max-w-7xl pb-20 md:pb-0 pr-[10px] ${
        mobileView === "detail" ? "max-w-3xl" : "max-w-xl"
      }`}
    >
      {/* min height = the visible page, so the divider runs to the bottom */}
      <div className="flex gap-4 lg:min-h-[calc(100dvh-88px)]">
        <SlotRail
          screens={screens}
          loading={loading}
          selectedId={slots.selectedId}
          used={slots.used}
          full={slots.full}
          mobileView={mobileView}
          collapsed={listCollapsed}
          onToggleCollapse={toggleList}
          onSelect={slots.selectScreen}
          onAdd={slots.addScreen}
          onRefresh={slots.refreshScreens}
        />

        {/* detail pane */}
        <div
          className={`flex-1 min-w-0 flex flex-col gap-3 ${
            mobileView === "list" ? "hidden lg:flex" : "flex"
          }`}
        >
          {loading && <SkeletonPanel rows={3} />}

          {!loading && !selected && screens.length === 0 && (
            <EmptyState
              title="Add your first screen"
              description={
                <>
                  1. Add a screen — it takes a slot.
                  <br />
                  2. On the TV, tablet or monitor browser, open{" "}
                  <a
                    href={`${window.location.origin}/screens`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-blue hover:underline"
                  >
                    Screens.
                  </a>{" "}
                  <br />
                  3. Type the 8-character code after clicking <strong>Add a screen</strong> below.
                </>
              }
              actionLabel="Add your first screen"
              actionIcon={Plus}
              onAction={slots.addScreen}
            />
          )}

          {!loading && !selected && screens.length > 0 && (
            <EmptyState title="Select a screen" description="Pick a slot on the left to manage it." />
          )}

          {!loading && selected && selected.pending && (
            <PairingPanel
              screen={selected}
              slot={selectedSlot}
              code={slots.codeFor(selected.id)}
              error={slots.pairErrorFor(selected.id)}
              busy={slots.busyId === selected.id}
              anyBusy={!!slots.busyId}
              focused={slots.codeFocused}
              onFocus={() => slots.setCodeFocused(true)}
              onBlur={() => slots.setCodeFocused(false)}
              onChange={(value) => slots.changeCode(selected.id, value)}
              onPair={() => slots.handlePair(selected.id)}
              onCancel={() => slots.cancelPairing(selected.id)}
              onBack={() => setMobileView("list")}
            />
          )}

          {!loading && selected && !selected.pending && (
            <ScreenDetails
              screen={selected}
              slot={selectedSlot}
              edit={{
                editing: slots.editingId === selected.id,
                draft: slots.draft,
                error: slots.editError,
                onChange: (field, value) => slots.changeDraft(selected.id, field, value),
                onStart: () => slots.startEdit(selected),
                onDiscard: slots.discardEdit,
                onSave: () => slots.saveEdit(selected.id),
              }}
              nameRef={slots.nameInputRef}
              refreshLeft={slots.refreshLeft(selected.id)}
              pulling={slots.pullingId === selected.id}
              storage={storage}
              releaseError={slots.releaseError}
              onBack={() => setMobileView("list")}
              onPreview={() => slots.setModal({ mode: "preview", id: selected.id })}
              onRemove={() => slots.setModal({ mode: "remove", id: selected.id })}
              onTakeOver={() => slots.openTakeOver(selected.id)}
              onOpenPlayer={() => slots.setModal({ mode: "player", id: selected.id })}
              onRelease={() => slots.releaseScreen(selected.id)}
              onRefreshScreen={() => slots.refreshScreenNow(selected)}
              onPullLogs={() => slots.pullLogsNow(selected)}
            />
          )}
        </div>
      </div>

      <SlotModals slots={slots} />
    </div>
  );
}

export default PlayerSlots;

// Player tab — manage up to 3 paired screens (devices), pair a new one via
// an 8-character code (entered here; generated/shown on the physical
// screen's own pairing page, pages/Screens.jsx at "/screens" — code shape
// must stay in sync between the two, see utils/screens/screenSlots.js), preview
// without touching the live screen, and explicitly "take over" a screen
// (disconnects it, since only one connection per screen is ever allowed —
// see z-files/future-implementations.md's Preview-tab section for the full
// reasoning).
// How it is split: hooks/useScreenSlots.js holds all the state and actions
// (fetching, pairing, editing, removing, take over, release);
// components/screens/slots/ has the pieces — SlotRail (the three slots),
// PairingPanel (the code field), ScreenDetails (preview, details, take over)
// and SlotModals (the four dialogs); this page only puts them together.
// Real backend wiring: fetching the screen list, pairing/claiming, editing
// (name/type), removing a screen, take-over, and release all go through the
// real API (api/devices.js, api/pairing.js) — take-over/release publish a
// real MQTT control message the screen reacts to. Still local-state-only,
// no backend yet: preview — it has no live streaming-state/manifest-
// correlation backend yet.
// Used by: App.jsx (route "/player", inside Layout/ProtectedRoute — not to
// be confused with pages/Player.jsx, the unauthenticated device-facing
// "/player/:token" route a real paired screen uses).
