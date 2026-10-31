import { GripVertical, LayoutList } from "lucide-react";

import ColumnModal, {
  FieldLabel,
  ManagedForm,
  ListSection,
  ManagedRow,
} from "../../../shared/columnModal/ColumnModal.jsx";
import { useManagedList } from "../../../shared/columnModal/useManagedList.js";
import { INPUT_CLASS, TEXTAREA_CLASS } from "../../../shared/columnModal/columnModalStyles.js";
import SliderField from "../../../shared/SliderField.jsx";
import { useDragReorder } from "../../../shared/useDragReorder.js";
import { MAX_BOARDS, BOARD_NAME_CAP, MESSAGE_CAPS, newBoard } from "./rotatingNoticesConfig.js";

const EMPTY_FORM = { name: "", urgent: "", warning: "", info: "", duration: 10 };

const MESSAGE_FIELDS = [
  { key: "urgent", label: "Urgent", placeholder: "Fire alarm test at 2:00 PM — no evacuation needed" },
  { key: "warning", label: "Warning", placeholder: "Wet floors in the east corridor until 11:00 AM" },
  { key: "info", label: "Info", placeholder: "Guest Wi-Fi: LobbyGuest · password at the front desk" },
];

// "Manage boards" — Rotating Notices' column-anchored modal. The chrome and
// the add / edit / delete behaviour are shared (columnModal/); this file is
// only the board fields, the drag-to-reorder list, and row contents.
// `boards`/`setForm` are the real form; `onDraftChange` reports what's being
// typed so the preview can pin to that board.
function BoardsModal({ layerEl, boards, setForm, onClose, onDraftChange, onModalOpenChange }) {
  const managed = useManagedList({
    listKey: "boards",
    items: boards,
    setForm,
    max: MAX_BOARDS,
    emptyForm: EMPTY_FORM,
    clean: (d) => ({
      name: d.name.trim().replace(/\s+/g, " ").slice(0, BOARD_NAME_CAP),
      urgent: d.urgent.trim(),
      warning: d.warning.trim(),
      info: d.info.trim(),
      duration: d.duration,
    }),
    // A board needs all three messages (one per tier) to rotate sensibly.
    canSubmit: (v) => Boolean(v.urgent && v.warning && v.info),
    newEntity: newBoard,
    toDraft: (b) => ({ name: b.name, urgent: b.urgent, warning: b.warning, info: b.info, duration: b.duration }),
    previewDraft: ({ editing, editingId, values, full }) => {
      if (editing) return { mode: "editing", id: editingId, ...values };
      if ((values.urgent || values.warning || values.info) && !full) return { mode: "draft", ...values };
      return null;
    },
    // A board form is tall — fold it away after Add / Save to show the list.
    collapseOnSubmit: true,
    onDraftChange,
  });
  // The form's Cancel button closes the modal too — back to the settings panel.
  const list = { ...managed, cancelEdit: () => { managed.cancelEdit(); onClose(); } };

  const { draft, patch, focusRef } = list;

  const { dragPropsFor } = useDragReorder((from, to) => {
    setForm((prev) => {
      const next = prev.boards.slice();
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return { ...prev, boards: next };
    });
  });

  return (
    <ColumnModal
      layerEl={layerEl}
      title="Manage boards"
      count={boards.length}
      max={MAX_BOARDS}
      onClose={onClose}
      onModalOpenChange={onModalOpenChange}
      onEscape={list.escape}
      scrollbarClass="dark-scrollbar-thin"
    >
      <ManagedForm
        list={list}
        addLabel="Add board"
        editTitle="Edit board"
        collapsible
        limitText={`Maximum of ${MAX_BOARDS} boards reached. Delete one to add more.`}
      >
        <label className="flex flex-col gap-1.5">
          <FieldLabel
            label="Board name"
            hint={`${draft.name.length}/${BOARD_NAME_CAP}`}
            hintClass={draft.name.length >= BOARD_NAME_CAP ? "text-accent-amber" : "text-text-muted"}
          />
          <input
            ref={focusRef}
            type="text"
            value={draft.name}
            maxLength={BOARD_NAME_CAP}
            placeholder="e.g. Lobby morning"
            autoComplete="off"
            onChange={(e) => patch({ name: e.target.value.slice(0, BOARD_NAME_CAP) })}
            className={INPUT_CLASS}
          />
        </label>

        {MESSAGE_FIELDS.map(({ key, label, placeholder }) => (
          <label key={key} className="flex flex-col gap-1.5">
            <FieldLabel
              label={label}
              hint={`${draft[key].length}/${MESSAGE_CAPS[key]}`}
              hintClass={draft[key].length >= MESSAGE_CAPS[key] ? "text-accent-amber" : "text-text-muted"}
            />
            <textarea
              rows={2}
              value={draft[key]}
              maxLength={MESSAGE_CAPS[key]}
              placeholder={placeholder}
              onChange={(e) => patch({ [key]: e.target.value.slice(0, MESSAGE_CAPS[key]) })}
              className={TEXTAREA_CLASS}
            />
          </label>
        ))}

        <SliderField
          label="Duration"
          value={draft.duration}
          onChange={(v) => patch({ duration: v })}
          min={10}
          max={60}
          step={1}
          suffix="s"
        />
      </ManagedForm>

      <ListSection
        list={list}
        title="Added boards"
        count={boards.length}
        EmptyIcon={LayoutList}
        emptyText="No boards yet. Add your first one above."
      >
        {boards.map((b, i) => {
          const dp = dragPropsFor(i);
          const name = b.name.trim() || `Board ${i + 1}`;
          return (
            <ManagedRow
              key={b.id}
              list={list}
              entity={b}
              label={name}
              title={name}
              padClass="pl-2"
              leading={
                <span title="Drag to reorder — boards rotate in this order." className="flex-none cursor-grab">
                  <GripVertical size={16} className="text-text-muted" />
                </span>
              }
              trailing={<span className="flex-none text-xs text-text-muted tabular-nums">{b.duration}s</span>}
              liProps={{
                draggable: dp.draggable && list.confirmId !== b.id,
                onDragStart: dp.onDragStart,
                onDragOver: dp.onDragOver,
                onDrop: dp.onDrop,
                onDragEnd: dp.onDragEnd,
              }}
              className={`${dp.isDragging ? "opacity-40" : ""} ${dp.isDragOver ? "ring-2 ring-accent-blue" : ""}`}
            />
          );
        })}
      </ListSection>
    </ColumnModal>
  );
}

export default BoardsModal;

// Used by: BoardsSection.jsx.
