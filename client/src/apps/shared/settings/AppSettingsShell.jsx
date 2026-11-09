import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Pencil, ChevronDown, Check, X, Maximize2, Minimize2, TriangleAlert } from "lucide-react";

import CancelButton from "../../../components/ui/CancelButton.jsx";
import ScrollBox from "../../../components/layout/ScrollBox.jsx";
import ActionMenu from "../../../components/ui/ActionMenu.jsx";
import RemoveConfirmModal from "../../../components/modals/RemoveConfirmModal.jsx";
import Logo from "../../../components/layout/Logo.jsx";
import { useMediaQuery } from "../../../hooks/useCompactLayout.js";
import { MAX_APP_NAME } from "../../../utils/validation/limits.js";
import { PREVIEW_SIZES } from "../preview/previewSizes.js";

// Rename an app. Small enough that it doesn't need its own file — it's only
// ever used here. The cap (MAX_APP_NAME, 55) keeps a name to two lines in the
// phone header. Below md the title is the rename button and renaming takes
// the whole header (RenameRow); from md up it is the inline input.
function RenameRow({ initial, onSave, onCancel }) {
  const [draft, setDraft] = useState(initial);
  const [empty, setEmpty] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);

  function save() {
    const value = draft.replace(/\s+/g, " ").trim();
    if (!value) {
      setEmpty(true);
      ref.current?.focus();
      return;
    }
    onSave(value);
  }

  const atLimit = draft.length >= MAX_APP_NAME;
  const message = empty
    ? "Name can't be empty"
    : atLimit
      ? "Character limit reached"
      : "";

  return (
    <>
      <div className="flex items-start gap-1">
        <textarea
          ref={ref}
          rows={2}
          maxLength={MAX_APP_NAME}
          aria-label="App name"
          aria-invalid={empty}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value.replace(/\n/g, " ").slice(0, MAX_APP_NAME));
            setEmpty(false);
          }}
          className={`flex-1 min-w-0 h-[52px] px-3 py-[9px] resize-none overflow-hidden rounded-lg border bg-bg-primary text-text-primary text-xs leading-4 font-semibold outline-2 outline-offset-1 ${
            empty ? "border-accent-red outline-accent-red" : "border-accent-blue outline-accent-blue"
          }`}
        />
        <button
          type="button"
          title="Save name"
          aria-label="Save name"
          onClick={save}
          className="flex-none w-11 h-11 grid place-items-center rounded-lg bg-[#1f6feb] text-white hover:bg-[#1a62d6] transition-colors"
        >
          <Check size={18} />
        </button>
        <button
          type="button"
          title="Cancel rename"
          aria-label="Cancel rename"
          onClick={onCancel}
          className="flex-none w-11 h-11 grid place-items-center rounded-lg text-text-muted hover:bg-bg-panel hover:text-text-primary transition-colors"
        >
          <X size={18} />
        </button>
      </div>
      <div className="flex justify-between gap-2 pr-[98px] text-xs leading-4 text-text-muted">
        <span role="status" className={empty ? "text-accent-red" : ""}>
          {message}
        </span>
        <span className={`tabular-nums ${atLimit ? "text-accent-amber" : ""}`}>
          {draft.length}/{MAX_APP_NAME}
        </span>
      </div>
    </>
  );
}

function EditableTitle({ name, onChange, editing, setEditing, isMobile }) {
  // Enter / Esc only on desktop; touch screens (phone, tablet) have no use for them.
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  if (isMobile) {
    if (editing) {
      return (
        <RenameRow
          initial={name}
          onSave={(value) => {
            onChange(value);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      );
    }
    return (
      <button
        type="button"
        title={`${name} \u2014 tap to rename`}
        aria-label={`Rename app: ${name}`}
        onClick={() => setEditing(true)}
        className="group flex-1 min-w-0 min-h-11 flex items-center gap-1.5 py-1 pr-1.5 rounded-md text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue"
      >
        <span className="min-w-0 text-xs leading-4 font-semibold text-text-primary [overflow-wrap:anywhere] text-pretty">
          {name}
        </span>
        <Pencil size={14} className="flex-none text-text-muted group-hover:text-text-primary transition-colors" />
      </button>
    );
  }

  if (editing) {
    return (
      <>
        <input
          autoFocus
          value={name}
          maxLength={MAX_APP_NAME}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_APP_NAME))}
          onBlur={() => setEditing(false)}
          onKeyDown={(e) => {
            if (isDesktop && (e.key === "Enter" || e.key === "Escape")) setEditing(false);
          }}
          className="text-xl font-medium tracking-tight text-text-primary bg-bg-panel border border-accent-blue rounded-md px-2 h-9 outline-none min-w-0 max-w-[260px]"
        />
        <span
          className={`flex-none text-[11px] tabular-nums ${
            name.length >= MAX_APP_NAME ? "text-accent-amber" : "text-text-muted"
          }`}
        >
          {name.length}/{MAX_APP_NAME}
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

// Tablet / phone version of the switch above: one button (current screen icon
// + chevron) that opens a list of every screen, then Full screen below a
// divider because it is a different kind of choice (hides the settings
// instead of changing the preview size). There is no hover on touch screens,
// so nothing here depends on it.
const MENU_ITEM =
  "h-11 flex items-center gap-2.5 px-3 rounded-md text-sm text-text-primary cursor-pointer outline-none data-[highlighted]:bg-bg-hover";

function PreviewSizeMenu({ size, fullPreview, onSize, onFull, portalContainer }) {
  const CurrentIcon = fullPreview ? Maximize2 : PREVIEW_SIZES[size].icon;
  const currentLabel = fullPreview ? "Full screen" : PREVIEW_SIZES[size].label;
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          title={`Preview screen: ${currentLabel}`}
          aria-label={`Preview screen: ${currentLabel}`}
          className="group flex-none w-[60px] md:w-auto md:px-2.5 h-11 md:h-9 flex items-center justify-center gap-1 rounded-lg border border-border-muted text-accent-blue hover:border-border-hover outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue data-[state=open]:border-accent-blue data-[state=open]:bg-accent-blue/15"
        >
          <CurrentIcon size={18} />
          <ChevronDown size={14} strokeWidth={2.5} className="transition-transform group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal container={portalContainer}>
        <DropdownMenu.Content
          align="end"
          collisionPadding={12}
          sideOffset={4}
          className="w-[232px] p-1 bg-bg-panel border border-border-muted rounded-lg shadow-[0_8px_24px_rgba(1,4,9,0.6)] z-50"
        >
          <DropdownMenu.Label className="px-3 pt-2 pb-1 text-xs leading-4 text-text-muted">
            Preview screen
          </DropdownMenu.Label>
          <DropdownMenu.RadioGroup value={size} onValueChange={onSize}>
            {Object.entries(PREVIEW_SIZES).map(([key, s]) => (
              <DropdownMenu.RadioItem key={key} value={key} className={MENU_ITEM}>
                <s.icon size={18} />
                <span className="flex-1">{s.label}</span>
                <DropdownMenu.ItemIndicator>
                  <Check size={16} strokeWidth={2.5} className="text-accent-blue" />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
          <DropdownMenu.Separator className="h-px my-1 bg-border-hover" />
          <DropdownMenu.Item onSelect={onFull} className={MENU_ITEM}>
            <Maximize2 size={18} />
            <span className="flex-1">Fullscreen preview</span>
            {fullPreview && <Check size={16} strokeWidth={2.5} className="text-accent-blue" />}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
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
  // Renaming the app, and whether we're on the phone layout (below md) where
  // the title wraps and renaming takes the whole header.
  const [renaming, setRenaming] = useState(false);
  const isMobile = useMediaQuery("(max-width: 767px)");

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
            className={`flex items-center gap-1 md:gap-2 pl-4 pr-1.5 sm:px-6 md:px-8 flex-none border-b border-border-muted overflow-hidden transition-[height,opacity] duration-300 ease-in-out ${
              fullPreview
                ? "h-0 opacity-0 pointer-events-none border-b-0"
                : isMobile && renaming
                  ? "flex-col items-stretch gap-1.5 pt-1.5 pb-2.5 opacity-100"
                  : "min-h-14 md:h-[60px] py-1.5 md:py-0 opacity-100"
            }`}
          >
            <Logo size={28} className="hidden md:block flex-none mr-1" />
            <EditableTitle
              name={appName}
              onChange={onAppNameChange}
              editing={renaming}
              setEditing={setRenaming}
              isMobile={isMobile}
            />
            <div className={`flex-1 ${isMobile ? "hidden" : ""}`} />
            <div className={`lg:hidden ${isMobile && renaming ? "hidden" : ""}`}>
              <PreviewSizeMenu
                size={previewSize}
                fullPreview={fullPreview}
                onSize={setPreviewSize}
                onFull={() => setFullPreview(true)}
                portalContainer={contentEl}
              />
            </div>
            <div className="hidden lg:block">
              <PreviewSizeToggle size={previewSize} onChange={setPreviewSize} />
            </div>
            <button
              type="button"
              title="Full-screen preview"
              onClick={() => setFullPreview(true)}
              className="hidden lg:flex w-9 h-9 items-center justify-center rounded-lg border border-border-muted text-text-muted hover:bg-bg-hover transition-colors"
            >
              <Maximize2 size={15} />
            </button>
            <div className={isMobile && renaming ? "hidden" : "flex-none"}>
              <CancelButton as={Dialog.Close} size="lg" title="Close" />
            </div>
          </div>

          {/* In full-screen preview, this toolbar is hidden by default and
              only revealed on hovering the window — stays out of the way of
              the thing being previewed otherwise. */}
          <div
            className={`absolute top-4 right-4 z-10 flex items-center gap-2 transition-opacity duration-300 ease-in-out ${
              fullPreview
                ? "opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto [@media(hover:none)]:opacity-100 [@media(hover:none)]:pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="lg:hidden">
              <PreviewSizeMenu
                size={previewSize}
                fullPreview={fullPreview}
                onSize={setPreviewSize}
                onFull={() => setFullPreview(true)}
                portalContainer={contentEl}
              />
            </div>
            <div className="hidden lg:block">
              <PreviewSizeToggle size={previewSize} onChange={setPreviewSize} />
            </div>
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
                    className="flex-none px-3 min-[380px]:flex-1 h-10 text-text-muted border border-border-muted hover:border-border-hover hover:bg-bg-hover hover:text-text-primary rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-border-muted disabled:hover:text-text-muted"
                  >
                    Close
                  </Dialog.Close>
                  <div className="flex-1 flex">
                    <button
                      type="button"
                      disabled={!dirty || saving || columnModalOpen}
                      onClick={onSaveAndClose}
                      className="flex-1 min-h-[40px] px-2 min-[380px]:px-4 whitespace-nowrap rounded-l-lg text-sm font-semibold bg-[#1f6feb] border border-accent-blue hover:bg-[#1a5fd0] text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#1f6feb]"
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
