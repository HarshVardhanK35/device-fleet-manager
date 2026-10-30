import { useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Info, Pencil, Plus, Trash2, X } from "lucide-react";

import { ICON_BTN, CONFIRM_YES, CONFIRM_NO } from "./columnModalStyles.js";

// The shared chrome + pieces of every "Manage …" modal (Status List's
// products, Rotating Notices' boards, any future list). A modal is built as:
//
//   <ColumnModal …>                       portal, header, count chip, Esc
//     <ManagedForm …> fields </ManagedForm>   add / edit form + limit note
//     <ListSection …>                         "Added …" header, Clear all,
//       <ManagedRow …/> …                     empty state, scrolling rows
//     </ListSection>
//   </ColumnModal>
//
// with the add / edit / delete state coming from useManagedList.js. Only the
// form fields and each row's contents differ per template.

// Anchored over the settings column only (portaled into AppSettingsShell's
// column layer, above its footer), so the live preview is never covered.
// `onEscape` is tried first (return true when it handled the key); an Esc it
// doesn't handle closes the modal.
export default function ColumnModal({
  layerEl,
  title,
  count,
  max,
  onClose,
  onModalOpenChange,
  onEscape,
  scrollbarClass = "",
  children,
}) {
  // Tells the shell a column modal is open (disables its footer buttons).
  useEffect(() => {
    onModalOpenChange?.(true);
    return () => onModalOpenChange?.(false);
  }, [onModalOpenChange]);

  useEffect(() => {
    function onKey(e) {
      if (e.key !== "Escape") return;
      if (onEscape?.()) return;
      onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  if (!layerEl) return null;
  const full = count >= max;

  return createPortal(
    <>
      <div className="absolute inset-0 bg-bg-primary/60" onClick={onClose} />
      <div
        role="dialog"
        aria-label={title}
        className="animate-modal-in absolute inset-3 min-[480px]:inset-4 flex flex-col bg-bg-panel border border-border-muted rounded-lg shadow-[0_8px_24px_rgba(1,4,9,.5)] overflow-hidden"
      >
        <div className="flex-none h-14 flex items-center gap-2 pl-3 min-[480px]:pl-4 pr-2 border-b border-border-muted">
          <h2 className="m-0 text-base font-semibold text-text-primary whitespace-nowrap">{title}</h2>
          <span
            className={`h-5 px-2 rounded-full inline-flex items-center border text-xs font-medium tabular-nums ${
              full
                ? "text-accent-amber border-accent-amber/40 bg-accent-amber/10"
                : "text-text-muted border-border-muted"
            }`}
          >
            {count} / {max}
          </span>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="ml-auto w-10 h-10 lg:w-8 lg:h-8 grid place-items-center rounded-md text-text-muted hover:bg-bg-hover hover:text-text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className={`flex-1 min-h-0 flex flex-col overflow-y-auto dark-scrollbar ${scrollbarClass}`}>
          {children}
        </div>
      </div>
    </>,
    layerEl,
  );
}

// Label row with a muted note on the right (character count, allowed range).
export function FieldLabel({ label, hint, hintClass = "text-text-muted" }) {
  return (
    <span className="flex items-baseline justify-between gap-2 text-[13px] font-semibold text-text-primary">
      {label}
      <span className={`text-xs font-normal tabular-nums whitespace-nowrap ${hintClass}`}>{hint}</span>
    </span>
  );
}

// The add / edit form shell: the limit note when the cap is hit, the caller's
// fields, and the Add / Save changes (+ Cancel) buttons. With `collapsible`
// it gets a chevron header (open by default, re-opens on Edit, collapses to
// give the list room) — for tall forms; short ones stay always open.
export function ManagedForm({ list, addLabel, editTitle, limitText, collapsible = false, children }) {
  const { locked, editing, complete, submit, cancelEdit, formOpen, setFormOpen } = list;
  const open = !collapsible || formOpen;
  return (
    <form
      onSubmit={submit}
      noValidate
      className={`flex-none px-3 min-[480px]:px-4 ${collapsible ? "" : "pt-4"}`}
    >
      {collapsible && (
      <button
        type="button"
        aria-expanded={formOpen}
        onClick={() => setFormOpen(!formOpen)}
        className="w-full h-12 flex items-center justify-between gap-2 text-[11px] font-semibold tracking-[.08em] uppercase text-text-muted hover:text-text-primary transition-colors"
      >
        <span>{editing ? editTitle : addLabel}</span>
        <ChevronDown size={16} className={`transition-transform ${formOpen ? "rotate-180" : ""}`} />
      </button>
      )}
      {/* Shown even while the form is folded, so a full list explains itself. */}
      {locked && (
        <div
          className={`flex items-start gap-2 px-3 py-2 rounded-lg border border-accent-amber/40 bg-accent-amber/10 text-[13px] leading-[18px] text-text-primary ${
            open ? "mb-3" : "mb-4"
          }`}
        >
          <Info size={16} className="flex-none mt-px text-accent-amber" />
          <span>{limitText}</span>
        </div>
      )}
      {open && (
        <div className="pb-4">
          <fieldset
            disabled={locked}
            className={`m-0 p-0 border-0 min-w-0 flex flex-col gap-3 ${locked ? "opacity-50" : ""}`}
          >
            {children}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!complete}
                className="flex-1 h-10 px-4 inline-flex items-center justify-center gap-2 rounded-lg bg-accent-blue hover:bg-[#4493f8] active:bg-[#1f6feb] text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-accent-blue"
              >
                {!editing && <Plus size={16} />}
                {editing ? "Save changes" : addLabel}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="h-10 px-4 rounded-lg border border-border-muted hover:bg-bg-hover hover:border-border-hover text-text-primary text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </fieldset>
        </div>
      )}
    </form>
  );
}

// Divider + "Added …" header (count, or Clear all with its inline confirm) +
// either the empty state or the list of rows (`children`).
export function ListSection({ list, title, count, EmptyIcon, emptyText, children }) {
  const { confirmClear, setConfirmClear, askClear, clearAll } = list;
  return (
    <>
      <div className="flex-none h-px mx-3 min-[480px]:mx-4 bg-border-muted" />
      <div className="flex-none flex items-center justify-between px-3 min-[480px]:px-4 pt-3 pb-2 text-[11px] font-semibold tracking-[.08em] uppercase text-text-muted">
        <span>
          {title} ({count})
        </span>
        <span className="flex items-center gap-2 normal-case tracking-normal">
          {confirmClear ? (
            <>
              <b className="text-[13px] font-semibold text-accent-red">Delete all {count}?</b>
              <button type="button" autoFocus onClick={clearAll} className={CONFIRM_YES}>
                Yes
              </button>
              <button type="button" onClick={() => setConfirmClear(false)} className={CONFIRM_NO}>
                No
              </button>
            </>
          ) : (
            <>
              {count > 0 && (
                <button
                  type="button"
                  onClick={askClear}
                  className="h-10 lg:h-7 px-2 rounded-md text-[13px] font-semibold text-text-muted hover:bg-accent-red/10 hover:text-accent-red transition-colors"
                >
                  Clear all
                </button>
              )}
            </>
          )}
        </span>
      </div>

      {count === 0 ? (
        <div className="flex-1 min-h-[120px] mx-3 min-[480px]:mx-4 mb-4 flex flex-col items-center justify-center gap-2 px-4 py-6 border border-dashed border-border-muted rounded-lg text-[13px] text-text-muted text-center">
          <EmptyIcon size={24} className="text-border-hover" />
          <span>{emptyText}</span>
        </div>
      ) : (
        <>
          <ul className="flex-none list-none m-0 px-2 min-[480px]:px-3 pb-3 flex flex-col gap-0.5">
            {children}
          </ul>
        </>
      )}
    </>
  );
}

// One row: `leading` (status icon, drag grip…), a truncating title, then
// either the caller's `trailing` + edit / delete buttons, or the inline
// "Delete?" Yes / No. `liProps` carries drag handlers when the list reorders.
export function ManagedRow({
  list,
  entity,
  label,
  leading,
  title,
  titleClass = "text-text-primary",
  trailing,
  padClass = "pl-3",
  liProps = {},
  className = "",
}) {
  const { editingId, confirmId, startEdit, askDelete, remove, cancelDelete } = list;
  const isEditing = editingId === entity.id;
  const confirming = confirmId === entity.id;

  return (
    <li
      {...liProps}
      className={`flex items-center gap-2.5 min-h-[52px] lg:min-h-12 ${padClass} pr-1 rounded-lg border transition-colors ${
        isEditing
          ? "bg-accent-blue/10 border-accent-blue/40 shadow-[inset_3px_0_0_#2f81f7]"
          : confirming
            ? "bg-accent-red/10 border-accent-red/40"
            : "border-transparent hover:bg-bg-hover"
      } ${className}`}
    >
      {leading}
      <span title={title} className={`flex-1 min-w-0 truncate text-sm font-medium ${titleClass}`}>
        {title}
      </span>
      {confirming ? (
        <div className="flex-none flex items-center gap-1.5">
          <b className="text-[13px] font-semibold text-accent-red mr-0.5">Delete?</b>
          <button type="button" autoFocus onClick={() => remove(entity.id)} className={CONFIRM_YES}>
            Yes
          </button>
          <button type="button" onClick={cancelDelete} className={CONFIRM_NO}>
            No
          </button>
        </div>
      ) : (
        <>
          {trailing}
          <div className="flex-none flex gap-0.5">
            <button
              type="button"
              aria-label={`Edit ${label}`}
              onClick={() => startEdit(entity)}
              className={`${ICON_BTN} hover:bg-bg-hover hover:text-text-primary`}
            >
              <Pencil size={16} />
            </button>
            <button
              type="button"
              aria-label={`Delete ${label}`}
              onClick={() => askDelete(entity.id)}
              className={`${ICON_BTN} hover:bg-accent-red/10 hover:text-accent-red`}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </>
      )}
    </li>
  );
}
