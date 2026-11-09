import { Monitor, ArrowRight, ArrowDown, Plug } from "lucide-react";

import DetailPane from "../../layout/DetailPane.jsx";
import Button from "../../ui/Button.jsx";
import GhostButton from "../../ui/GhostButton.jsx";
import StatusPill from "../../ui/StatusPill.jsx";
import LoadingOverlay from "../../loading/LoadingOverlay.jsx";
import { PAIRING_CODE_LENGTH } from "../../../utils/screens/screenSlots.js";

// The right-hand pane for a slot that is waiting to be paired: the 8-box code
// field, its hint, and the Pair screen button.
//   code / error   what was typed for this slot, and the pairing error
//   busy           this slot is being paired; anyBusy: some slot is
//   focused        the hidden input has focus (shows the blinking caret)
function PairingPanel({
  screen,
  slot,
  code,
  error,
  busy,
  anyBusy,
  focused,
  onFocus,
  onBlur,
  onChange,
  onPair,
  onCancel,
  onBack,
}) {
  return (
    <DetailPane
      backLabel="All screens"
      onBack={onBack}
      title={screen.name}
      badge={<StatusPill screen={screen} />}
      meta={`Slot ${slot}`}
      headerExtra={<GhostButton onClick={onCancel}>Cancel</GhostButton>}
    >
      <div className="flex flex-col md:flex-row gap-3 items-stretch">
        <div className="flex-1 min-w-0 aspect-video rounded-lg border border-dashed border-border-hover bg-[repeating-linear-gradient(135deg,#0d1117_0_8px,#11161d_8px_16px)] flex flex-col items-center justify-center gap-2 text-center px-4">
          <Monitor size={28} className="text-border-hover" />
          <span className="text-text-muted text-sm">The physical screen</span>
          <span className="text-text-muted text-xs">Open /screens on it — a code appears</span>
        </div>
        <div className="flex-none flex items-center justify-center text-accent-amber">
          <ArrowRight size={18} className="hidden md:block" />
          <ArrowDown size={18} className="md:hidden" />
        </div>
        <div className="flex-1 min-w-0 flex flex-col items-center justify-center gap-3 p-4 rounded-lg bg-bg-primary border border-accent-amber/35">
          <span className="text-text-primary text-sm font-semibold">Enter the code shown on the screen</span>
          <div className="relative flex gap-1.5 w-full max-w-[380px]">
            {Array.from({ length: PAIRING_CODE_LENGTH }, (_, i) => {
              const isActive = i === code.length;
              return (
                <div
                  key={i}
                  className={`flex-1 h-11 rounded-lg border bg-bg-panel flex items-center justify-center font-mono text-lg font-semibold ${
                    code[i] ? "border-border-hover" : isActive ? "border-accent-blue" : "border-border-muted"
                  }`}
                >
                  {code[i] ||
                    (isActive && focused && <span className="caret-blink w-[2px] h-5 bg-accent-blue" />)}
                </div>
              );
            })}
            <input
              value={code}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onPair()}
              onFocus={onFocus}
              onBlur={onBlur}
              maxLength={PAIRING_CODE_LENGTH}
              autoComplete="off"
              aria-label="Pairing code"
              className="absolute inset-0 w-full opacity-0 cursor-text text-base"
            />
          </div>
          <span className={`text-xs ${error ? "text-accent-red" : "text-text-muted"}`}>
            {busy
              ? "Connecting to the screen…"
              : error
                ? error
                : code.length === PAIRING_CODE_LENGTH
                  ? "Press Enter or Pair screen"
                  : "Codes expire after 15 minutes"}
          </span>
          <div>
            <Button
              icon={Plug}
              onClick={onPair}
              disabled={code.length < PAIRING_CODE_LENGTH || anyBusy}
              className="!min-h-9"
            >
              {busy ? "Pairing…" : "Pair screen"}
            </Button>
            <LoadingOverlay show={busy} />
          </div>
        </div>
      </div>
    </DetailPane>
  );
}

export default PairingPanel;

// Used by: pages/PlayerSlots.jsx.
