import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Pencil, ChevronDown, Check, Maximize2, Minimize2, TriangleAlert } from "lucide-react";

import CancelButton from "../../components/CancelButton.jsx";
import ScrollBox from "../../components/ScrollBox.jsx";
import ActionMenu from "../../components/ActionMenu.jsx";
import RemoveConfirmModal from "../../components/RemoveConfirmModal.jsx";
import { PREVIEW_SIZES } from "./previewSizes.js";

// Click the pencil to turn the app name into a text input. Small enough
// that it doesn't need its own file — it's only ever used here.
// Cap on an app tile's name — long enough to tell two instances apart,
// short enough to stay readable on a tile and in this header.
const APP_NAME_MAX = 60;

function EditableTitle({ name, onChange }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <>
        <input
          autoFocus
          value={name}
          maxLength={APP_NAME_MAX}
          onChange={(e) => onChange(e.target.value.slice(0, APP_NAME_MAX))}
          onBlur={() => setEditing(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Escape") setEditing(false);
          }}
          className="text-xl font-medium tracking-tight text-text-primary bg-bg-panel border border-accent-blue rounded-md px-2 h-9 outline-none min-w-0 max-w-[260px]"
        />
        <span
          className={`flex-none text-[11px] tabular-nums ${
            name.length >= APP_NAME_MAX ? "text-accent-amber" : "text-text-muted"
          }`}
        >
          {name.length}/{APP_NAME_MAX}
        </span>
      </>
    );
  }

  return (
    <>
      <span className="text-xl font-medium tracking-tight text-text-primary truncate min-w-0">{name}</span>
      <button
        type="button"
        aria-label="Rename app"
        onClick={() => setEditing(true)}
        className="w-7 h-7 flex items-center justify-center rounded-md text-text-muted hover:bg-bg-hover hover:text-text-primary transition-colors"
      >
        <Pencil size={14} />
      </button>
    </>
  );
}

// The 3-button Desktop/Tablet/Mobile switch that controls how big
// AppPreviewFrame renders its preview.
function PreviewSizeToggle({ size, onChange }) {
  return (
    <div className="flex items-center bg-bg-primary border border-border-muted rounded-lg overflow-hidden">
      {Object.entries(PREVIEW_SIZES).map(([key, s]) => (
        <button
          key={key}
          type="button"
          aria-label={s.label}
          title={s.label}
          onClick={() => onChange(key)}
          className={`w-9 h-9 flex items-center justify-center transition-colors ${
            size === key ? "bg-accent-blue/15 text-accent-blue" : "text-text-muted hover:bg-bg-hover"
          }`}
        >
          <s.icon size={15} />
        </button>
      ))}
    </div>
  );
}

// The full-screen wrapper every app's settings screen uses: header (name +
// rename + device-size toggle + close), a preview/settings split body, and
// a Save/Close footer. The actual preview content and settings fields are
// supplied by whoever uses this — see `preview` and `children` below.
//
// `preview` and `children` are both FUNCTIONS (not plain JSX) because they
// need something only this shell knows about once it's mounted:
//   `preview(previewSize, fullPreview)` — `previewSize` is the selected
//     device size (desktop/tablet/mobile); `fullPreview` is true while the
//     full-screen toggle is active, for callers that want to pass it
//     through to AppPreviewFrame's own `fullscreen` prop (drops its
//     device-size max-width cap so the iframe actually fills the space).
//   `children(portalContainer)` — `portalContainer` is this Dialog's own
//     DOM node. Any StyledSelect dropdown inside the settings panel needs
//     it, otherwise its hover-highlight silently breaks (a real Radix bug
//     we hit — see StyledSelect.jsx's own comment for the full why).
function AppSettingsShell({
  open,
  onOpenChange,
  appName,
  onAppNameChange,
  dirty,
  onSaveAndClose,
  onSaveOnly,
  saving = false,
  saveError,
  preview,
  children,
}) {
  const [contentEl, setContentEl] = useState(null);
  // Layer over the settings column only (above the footer, never over the
  // preview) — a settings screen can portal a column-anchored modal into it
  // via `children`'s second argument.
  const [layerEl, setLayerEl] = useState(null);
  // True while a column modal is open — the footer Close/Save buttons are
  // disabled meanwhile so they can't be hit by mistake right after editing.
  const [columnModalOpen, setColumnModalOpen] = useState(false);
  // Closing with unsaved edits (X, Close, Esc) asks first — Save & Close
  // calls onOpenChange directly, so it never goes through this.
  const [confirmClose, setConfirmClose] = useState(false);

  function handleOpenChange(next) {
    if (!next && dirty && !saving) {
      setConfirmClose(true);
      return;
    }
    onOpenChange(next);
  }
  const [previewSize, setPreviewSize] = useState("desktop");
  // Full-screen preview: hides the settings column entirely and lets the
  // iframe take the whole body (still padded, via the preview column's own
  // existing padding classes). Toggling it back off restores the normal
  // split view — Save/Close live in the settings column, so they're only
  // reachable there; the header's own Close (X) always works regardless.
  const [fullPreview, setFullPreview] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <RemoveConfirmModal
        elevated
        open={confirmClose}
        onOpenChange={setConfirmClose}
        icon={TriangleAlert}
        title="Discard unsaved changes?"
        description="You have changes that haven't been saved. If you close now, they'll be lost."
        confirmLabel="Discard and close"
        onConfirm={() => {
          setConfirmClose(false);
          onOpenChange(false);
        }}
      />
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-40" />
        <Dialog.Content
          ref={setContentEl}
          // Esc belongs to a column modal first (it handles its own Esc) —
          // only close the whole screen when no modal is mounted in the layer.
          onEscapeKeyDown={(e) => {
            if (layerEl?.childElementCount) e.preventDefault();
          }}
          className="group fixed inset-0 bg-bg-primary z-50 flex flex-col overflow-hidden"
        >
          {/* Both header variants stay mounted and cross-fade via opacity —
              conditionally unmounting either one would snap instantly
              instead of transitioning smoothly. The normal header's own
              height also animates (60px -> 0) so the preview area grows
              into the freed space at the same pace as the fade. */}
          <div
            className={`flex items-center gap-2 px-4 sm:px-6 md:px-8 flex-none border-b border-border-muted overflow-hidden transition-[height,opacity] duration-300 ease-in-out ${
              fullPreview ? "h-0 opacity-0 pointer-events-none border-b-0" : "h-[60px] opacity-100"
            }`}
          >
            <EditableTitle name={appName} onChange={onAppNameChange} />
            <div className="flex-1" />
            <PreviewSizeToggle size={previewSize} onChange={setPreviewSize} />
            <button
              type="button"
              title="Full-screen preview"
              onClick={() => setFullPreview(true)}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-border-muted text-text-muted hover:bg-bg-hover transition-colors"
            >
              <Maximize2 size={15} />
            </button>
            <CancelButton as={Dialog.Close} size="lg" title="Close" />
          </div>

          {/* In full-screen preview, this toolbar is hidden by default and
              only revealed on hovering the window — stays out of the way of
              the thing being previewed otherwise. */}
          <div
            className={`absolute top-4 right-4 z-10 flex items-center gap-2 transition-opacity duration-300 ease-in-out ${
              fullPreview
                ? "opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <PreviewSizeToggle size={previewSize} onChange={setPreviewSize} />
            <button
              type="button"
              title="Exit full-screen preview"
              onClick={() => setFullPreview(false)}
              className="w-9 h-9 flex items-center justify-center rounded-lg border bg-bg-primary border-accent-blue text-accent-blue hover:bg-bg-hover transition-colors"
            >
              <Minimize2 size={15} />
            </button>
            <CancelButton as={Dialog.Close} size="lg" title="Close" />
          </div>

          <div
            className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden"
          >
            {/* Preview column — fixed in place, never scrolls */}
            <div
              className={`flex flex-col items-center lg:justify-center gap-3.5 px-4 sm:px-6 md:px-8 py-6 lg:overflow-hidden transition-[flex-grow] duration-300 ease-in-out ${
                fullPreview ? "flex-1 w-full" : "flex-none lg:flex-1 lg:min-w-0"
              }`}
            >
              {open && preview(previewSize, fullPreview)}
            </div>

            {/* Settings column — its own independent scroll + its own footer.
                Stays mounted even in full-screen preview (width animates to
                0 instead of unmounting) so the collapse/expand transitions
                smoothly — Save/Close are only reachable once it's back
                open, but the header's own Close (X) always works. */}
            <div
              className={`flex-1 lg:flex-none min-h-0 flex flex-col border-t lg:border-t-0 lg:border-l border-border-muted overflow-hidden transition-[width,opacity] duration-300 ease-in-out ${
                fullPreview
                  ? "w-0 lg:w-0 opacity-0 pointer-events-none border-transparent"
                  : "w-full lg:w-[400px] opacity-100"
              }`}
            >
              <div className="relative flex-1 min-h-0 flex flex-col">
              <ScrollBox className="flex-1 min-h-0">
                {/* Extra bottom padding (pb-40, well past the usual py-6)
                    gives a dropdown on the LAST field of the LAST card real
                    room to open into — Radix sizes a Select's popup against
                    actual on-screen space below its trigger
                    (--radix-select-content-available-height), not just this
                    container's own scrollable height, so a field sitting
                    right at the bottom edge was clipping its own dropdown
                    to 1-2 visible rows regardless of the dropdown's own
                    row-count cap. */}
                <div className="flex flex-col gap-3 px-4 sm:px-6 md:px-8 pt-6 pb-80">
                  {open && children(contentEl, layerEl, setColumnModalOpen)}
                </div>
              </ScrollBox>
              <div
                ref={setLayerEl}
                className="absolute inset-0 z-10 pointer-events-none [&>*]:pointer-events-auto"
              />
              </div>

              <div className="flex-none px-4 sm:px-6 md:px-8 py-3 border-t border-border-muted bg-bg-primary">
                {saveError && (
                  <p className="text-xs text-accent-red font-medium mb-2 m-0">{saveError}</p>
                )}
                <div className="flex gap-2">
                  <Dialog.Close
                    type="button"
                    disabled={columnModalOpen}
                    className="flex-1 h-10 text-text-muted border border-border-muted hover:border-border-hover hover:bg-bg-hover hover:text-text-primary rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-border-muted disabled:hover:text-text-muted"
                  >
                    Close
                  </Dialog.Close>
                  <div className="flex-1 flex">
                    <button
                      type="button"
                      disabled={!dirty || saving || columnModalOpen}
                      onClick={onSaveAndClose}
                      className="flex-1 min-h-[40px] px-4 rounded-l-lg text-sm font-semibold bg-[#1f6feb] border border-accent-blue hover:bg-[#1a5fd0] text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#1f6feb]"
                    >
                      {saving ? "Saving…" : "Save & Close"}
                    </button>
                    <ActionMenu
                      label="More save options"
                      align="end"
                      items={[
                        {
                          label: "Save",
                          icon: Check,
                          onClick: onSaveOnly,
                          disabled: !dirty || saving || columnModalOpen,
                        },
                      ]}
                      trigger={
                        <button
                          type="button"
                          disabled={!dirty || saving || columnModalOpen}
                          className="min-h-[40px] px-2 rounded-r-lg bg-[#1f6feb] border border-accent-blue border-l-0 hover:bg-[#1a5fd0] text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#1f6feb]"
                        >
                          <ChevronDown size={14} />
                        </button>
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default AppSettingsShell;
