import { useEffect, useRef, useState } from "react";

// The add / edit / delete / clear-all state machine shared by every "Manage
// …" modal (Status List's products, Rotating Notices' boards, and any
// future template's list). It owns the form draft, which row is being edited
// or confirming a delete, and writes into the real form's `listKey` array via
// `setForm` — the caller supplies only what differs per entity:
//
//   listKey       which array on the form this edits ("items" / "boards")
//   items         that array's current value
//   max           item cap
//   emptyForm     a blank draft
//   clean(draft)  raw draft -> the values that would be saved
//   canSubmit(v)  whether those values may be added / saved
//   newEntity()   a blank entity ({ id, ...defaults }) for "add"
//   toDraft(e)    saved entity -> draft (for "edit")
//   previewDraft({ editing, editingId, values, full })
//                 what to report to the live preview (or null)
//   normalize(d)  optional rule applied after every field change
//   collapseOnSubmit  close the (collapsible) form after Add / Save changes
//   onSubmitted       called after a successful Add / Save changes
export function useManagedList({
  listKey,
  items,
  setForm,
  max,
  emptyForm,
  clean,
  canSubmit,
  newEntity,
  toDraft,
  previewDraft,
  normalize = (d) => d,
  collapseOnSubmit = false,
  onSubmitted,
  onDraftChange,
}) {
  const [draft, setDraft] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);
  // The form section is collapsible (chevron) — open on arrival, and
  // starting an edit always re-opens it.
  // With collapseOnSubmit it starts folded when the list is already full.
  const [formOpen, setFormOpen] = useState(() => !(collapseOnSubmit && items.length >= max));
  // Attach to the form's first field — focused on open, and again after
  // add / save / starting an edit.
  const focusRef = useRef(null);

  const full = items.length >= max;
  const editing = editingId !== null;
  // Full only locks the form while ADDING — editing an existing entry is
  // still allowed at the cap.
  const locked = full && !editing;
  const values = clean(draft);
  const complete = canSubmit(values);

  // Live preview: report what's being typed / edited (never saved).
  useEffect(() => {
    onDraftChange(previewDraft({ editing, editingId, values, full }));
  }, [draft, editingId, full]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => onDraftChange(null), [onDraftChange]);

  // Focus the first field whenever the form opens or switches to an edit.
  useEffect(() => {
    if (formOpen) focusRef.current?.focus();
  }, [formOpen, editingId]);

  function patch(next) {
    setDraft((d) => normalize({ ...d, ...next }));
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(emptyForm);
  }

  function startEdit(entity) {
    setEditingId(entity.id);
    setConfirmId(null);
    setConfirmClear(false);
    setDraft(toDraft(entity));
    setFormOpen(true);
    focusRef.current?.focus();
  }

  function askDelete(id) {
    setConfirmId(id);
    setConfirmClear(false);
  }

  function askClear() {
    setConfirmClear(true);
    setConfirmId(null);
  }

  function remove(id) {
    setForm((prev) => ({ ...prev, [listKey]: prev[listKey].filter((x) => x.id !== id) }));
    if (editingId === id) cancelEdit();
    setConfirmId(null);
  }

  function clearAll() {
    setForm((prev) => ({ ...prev, [listKey]: [] }));
    cancelEdit();
    setConfirmId(null);
    setConfirmClear(false);
  }

  function submit(e) {
    e.preventDefault();
    if (!complete || locked) return;
    if (editing) {
      setForm((prev) => ({
        ...prev,
        [listKey]: prev[listKey].map((x) => (x.id === editingId ? { ...x, ...values } : x)),
      }));
      setEditingId(null);
    } else {
      setForm((prev) => ({ ...prev, [listKey]: [...prev[listKey], { ...newEntity(), ...values }] }));
    }
    setDraft(emptyForm);
    if (collapseOnSubmit) setFormOpen(false);
    else focusRef.current?.focus();
    onSubmitted?.();
  }

  // Esc: clear-confirm -> delete-confirm -> edit mode. Returns true when it
  // handled the key, so the modal only closes on a "nothing left to cancel" Esc.
  function escape() {
    if (confirmClear) setConfirmClear(false);
    else if (confirmId !== null) setConfirmId(null);
    else if (editing) cancelEdit();
    else return false;
    return true;
  }

  return {
    draft,
    patch,
    values,
    complete,
    full,
    locked,
    editing,
    editingId,
    confirmId,
    confirmClear,
    setConfirmClear,
    focusRef,
    formOpen,
    setFormOpen,
    startEdit,
    cancelEdit,
    askDelete,
    askClear,
    clearAll,
    remove,
    submit,
    escape,
    cancelDelete: () => setConfirmId(null),
  };
}
