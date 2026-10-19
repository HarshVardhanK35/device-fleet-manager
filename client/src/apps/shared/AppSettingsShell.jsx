import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Pencil, ChevronDown, Check } from "lucide-react";

import CancelButton from "../../components/CancelButton.jsx";
import ScrollBox from "../../components/ScrollBox.jsx";
import ActionMenu from "../../components/ActionMenu.jsx";
import { PREVIEW_SIZES } from "./previewSizes.js";

// Click the pencil to turn the app name into a text input. Small enough
// that it doesn't need its own file — it's only ever used here.
function EditableTitle({ name, onChange }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <input
        autoFocus
        value={name}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === "Escape") setEditing(false);
        }}
        className="text-xl font-medium tracking-tight text-text-primary bg-bg-panel border border-accent-blue rounded-md px-2 h-9 outline-none min-w-0 max-w-[260px]"
      />
    );
  }

  return (
    <>
      <span className="text-xl font-medium tracking-tight text-text-primary">{name}</span>
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
    <div className="flex items-center border border-border-muted rounded-lg overflow-hidden">
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
//   `preview(previewSize)` — so the preview content knows which device
//     size is currently selected (desktop/tablet/mobile).
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
  const [previewSize, setPreviewSize] = useState("desktop");

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-40" />
        <Dialog.Content
          ref={setContentEl}
          className="fixed inset-0 bg-bg-primary z-50 flex flex-col overflow-hidden"
        >
          <div className="flex items-center gap-2 px-4 sm:px-6 md:px-8 h-[60px] flex-none border-b border-border-muted">
            <EditableTitle name={appName} onChange={onAppNameChange} />
            <div className="flex-1" />
            <PreviewSizeToggle size={previewSize} onChange={setPreviewSize} />
            <CancelButton as={Dialog.Close} size="lg" title="Close" />
          </div>

          <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
            {/* Preview column — fixed in place, never scrolls */}
            <div className="flex-none lg:flex-1 lg:min-w-0 flex flex-col items-center lg:justify-center gap-3.5 px-4 sm:px-6 md:px-8 py-6 lg:overflow-hidden">
              {open && preview(previewSize)}
            </div>

            {/* Settings column — its own independent scroll + its own footer */}
            <div className="lg:w-[400px] flex-1 lg:flex-none min-h-0 flex flex-col border-t lg:border-t-0 lg:border-l border-border-muted">
              <ScrollBox className="flex-1 min-h-0">
                <div className="flex flex-col gap-3 px-4 sm:px-6 md:px-8 py-6">
                  {open && children(contentEl)}
                </div>
              </ScrollBox>

              <div className="flex-none px-4 sm:px-6 md:px-8 py-3 border-t border-border-muted bg-bg-primary">
                {saveError && (
                  <p className="text-xs text-accent-red font-medium mb-2 m-0">{saveError}</p>
                )}
                <div className="flex gap-2">
                  <Dialog.Close
                    type="button"
                    className="flex-1 h-10 text-text-muted border border-border-muted hover:border-border-hover hover:bg-bg-hover hover:text-text-primary rounded-lg text-sm font-semibold transition-colors"
                  >
                    Close
                  </Dialog.Close>
                  <div className="flex-1 flex">
                    <button
                      type="button"
                      disabled={!dirty || saving}
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
                          disabled: !dirty || saving,
                        },
                      ]}
                      trigger={
                        <button
                          type="button"
                          disabled={!dirty || saving}
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
