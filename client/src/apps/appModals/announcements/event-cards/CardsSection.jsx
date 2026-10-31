import { useState } from "react";
import { GripVertical, Plus } from "lucide-react";

import SettingsCard from "../../../shared/SettingsCard.jsx";
import { ClearAllControl, ManagedRow } from "../../../shared/columnModal/ColumnModal.jsx";
import { useDragReorder } from "../../../shared/useDragReorder.js";
import CardsModal from "./CardsModal.jsx";
import { useCardsList } from "./useCardsList.js";
import { TYPE_ICON } from "./eventCardsIcons.js";
import { MAX_CARDS, TYPE_META } from "./eventCardsConfig.js";

// The "Cards" settings card: the added cards on top (drag to reorder, edit,
// delete, Clear all), and an "Add card" button below. The add / edit form
// itself opens in a column-anchored modal (CardsModal.jsx) — it never grows
// the settings panel, and the preview stays visible beside it.
function CardsSection({
  form,
  setForm,
  layerContainer,
  onDraftChange,
  onModalOpenChange,
  portalContainer,
  library,
}) {
  const [open, setOpen] = useState(false);
  const cards = form.cards;

  const list = useCardsList({
    cards,
    setForm,
    onDraftChange,
    // A successful Add / Save changes closes the form.
    onSubmitted: () => setOpen(false),
  });

  const { dragPropsFor } = useDragReorder((from, to) => {
    setForm((prev) => {
      const next = prev.cards.slice();
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return { ...prev, cards: next };
    });
  });

  function openAdd() {
    list.cancelEdit();
    setOpen(true);
  }

  // Closing always drops whatever was half-typed.
  function closeModal() {
    list.cancelEdit();
    setOpen(false);
  }

  // The row's pencil loads that card into the form AND opens the modal.
  const rowList = {
    ...list,
    startEdit: (card) => {
      list.startEdit(card);
      setOpen(true);
    },
  };

  // The form's Cancel button closes the modal too — back to the settings panel.
  const modalList = { ...list, cancelEdit: closeModal };

  const full = cards.length >= MAX_CARDS;

  return (
    <>
      <SettingsCard
        kicker={`Cards (${cards.length} / ${MAX_CARDS})`}
        action={cards.length > 0 && <ClearAllControl list={list} count={cards.length} />}
      >
        {cards.length === 0 ? (
          <p className="m-0 text-[13px] text-text-muted">No cards yet</p>
        ) : (
          <ul className="list-none m-0 p-0 flex flex-col gap-0.5">
            {cards.map((c, i) => {
              const dp = dragPropsFor(i);
              const name = c.title.trim() || "New card";
              const Icon = TYPE_ICON[c.type];
              return (
                <ManagedRow
                  key={c.id}
                  list={rowList}
                  entity={c}
                  label={name}
                  title={name}
                  padClass="pl-1.5"
                  leading={
                    <span title="Drag to reorder — cards play in this order." className="flex-none cursor-grab">
                      <GripVertical size={16} className="text-text-muted" />
                    </span>
                  }
                  trailing={
                    <span className="flex-none flex items-center gap-1.5 text-xs text-text-muted whitespace-nowrap">
                      <Icon size={13} />
                      {TYPE_META[c.type].label} · {c.duration}s
                    </span>
                  }
                  liProps={{
                    draggable: dp.draggable && list.confirmId !== c.id,
                    onDragStart: dp.onDragStart,
                    onDragOver: dp.onDragOver,
                    onDrop: dp.onDrop,
                    onDragEnd: dp.onDragEnd,
                  }}
                  className={`${dp.isDragging ? "opacity-40" : ""} ${dp.isDragOver ? "ring-2 ring-accent-blue" : ""}`}
                />
              );
            })}
          </ul>
        )}

        <button
          type="button"
          onClick={openAdd}
          disabled={full}
          title={full ? `Maximum of ${MAX_CARDS} cards reached. Delete one to add more.` : undefined}
          className="flex items-center justify-center gap-2 h-10 text-sm font-semibold text-text-primary bg-bg-primary border border-border-muted hover:border-border-hover hover:bg-bg-hover rounded-lg px-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-bg-primary disabled:hover:border-border-muted"
        >
          <Plus size={16} />
          Add card
        </button>
      </SettingsCard>

      {open && (
        <CardsModal
          layerEl={layerContainer}
          list={modalList}
          count={cards.length}
          onClose={closeModal}
          onModalOpenChange={onModalOpenChange}
          portalContainer={portalContainer}
          library={library}
        />
      )}
    </>
  );
}

export default CardsSection;

// Used by: EventCardsSettings.jsx.
