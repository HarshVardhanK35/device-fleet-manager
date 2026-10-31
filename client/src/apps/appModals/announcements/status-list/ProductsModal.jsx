import { CircleCheck, OctagonX, Package, TriangleAlert } from "lucide-react";

import ColumnModal, {
  FieldLabel,
  ManagedForm,
  ListSection,
  ManagedRow,
} from "../../../shared/columnModal/ColumnModal.jsx";
import { useManagedList } from "../../../shared/columnModal/useManagedList.js";
import { INPUT_CLASS } from "../../../shared/columnModal/columnModalStyles.js";
import { MAX_ITEMS, NAME_CAP, MAX_DISCOUNT, newItem, tierOf } from "./statusListConfig.js";

const EMPTY_FORM = { name: "", status: "in", discount: "" };

const STATUS_BUTTONS = [
  { value: "in", label: "In", icon: CircleCheck, text: "text-accent-green", active: "border-accent-green bg-accent-green/10 text-accent-green" },
  { value: "low", label: "Low", icon: TriangleAlert, text: "text-accent-amber", active: "border-accent-amber bg-accent-amber/10 text-accent-amber" },
  { value: "out", label: "Out", icon: OctagonX, text: "text-accent-red", active: "border-accent-red bg-accent-red/10 text-accent-red" },
];

const CHIP_CLASS = {
  Small: "text-[#79c0ff] shadow-[inset_0_0_0_1px_#79c0ff]",
  Medium: "text-[#c6c7ff] bg-[rgba(139,140,246,.24)] shadow-[inset_0_0_0_1px_#8b8cf6]",
  Big: "text-[#0d1117] bg-[#b083f0]",
};

// "Manage products" — the Status List's column-anchored modal. The chrome and
// the add / edit / delete behaviour are shared (columnModal/); this file is
// only the product fields and row contents. `items`/`setForm` are the real
// form; `onDraftChange` reports what's being typed so the preview can show it.
function ProductsModal({ layerEl, items, setForm, onClose, onDraftChange, onModalOpenChange, discountsOn }) {
  const managed = useManagedList({
    listKey: "items",
    items,
    setForm,
    max: MAX_ITEMS,
    emptyForm: EMPTY_FORM,
    clean: (d) => {
      const n = Math.round(Number(d.discount) || 0);
      return {
        name: d.name.trim().replace(/\s+/g, " ").slice(0, NAME_CAP),
        status: d.status,
        discount: !discountsOn || d.status === "out" ? 0 : Math.max(0, Math.min(MAX_DISCOUNT, n)),
      };
    },
    canSubmit: (v) => Boolean(v.name),
    newEntity: newItem,
    toDraft: (it) => ({ name: it.name, status: it.status, discount: it.discount ? String(it.discount) : "" }),
    // Out of Stock never carries a discount (disabled + cleared).
    normalize: (d) => (d.status === "out" ? { ...d, discount: "" } : d),
    previewDraft: ({ editing, editingId, values, full }) => {
      if (editing) return { mode: "editing", id: editingId, ...values };
      if (values.name && !full) return { mode: "draft", ...values };
      return null;
    },
    onDraftChange,
  });
  // The form's Cancel button closes the modal too — back to the settings panel.
  const list = { ...managed, cancelEdit: () => { managed.cancelEdit(); onClose(); } };

  const { draft, patch, focusRef } = list;
  const out = draft.status === "out";

  return (
    <ColumnModal
      layerEl={layerEl}
      title="Manage products"
      count={items.length}
      max={MAX_ITEMS}
      onClose={onClose}
      onModalOpenChange={onModalOpenChange}
      onEscape={list.escape}
      scrollbarClass="dark-scrollbar-thin"
    >
      <ManagedForm
        list={list}
        addLabel="Add product"
        limitText={`Maximum of ${MAX_ITEMS} products reached. Delete one to add more.`}
      >
        <label className="flex flex-col gap-1.5">
          <FieldLabel
            label="Product name"
            hint={`${draft.name.length}/${NAME_CAP}`}
            hintClass={draft.name.length >= NAME_CAP ? "text-accent-amber" : "text-text-muted"}
          />
          <input
            ref={focusRef}
            type="text"
            value={draft.name}
            maxLength={NAME_CAP}
            placeholder="e.g. Greek Yogurt"
            autoComplete="off"
            onChange={(e) => patch({ name: e.target.value.slice(0, NAME_CAP) })}
            className={INPUT_CLASS}
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-text-primary">Status</span>
          <div role="radiogroup" className="grid grid-cols-3 gap-2">
            {STATUS_BUTTONS.map(({ value, label, icon: Icon, active }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={draft.status === value}
                onClick={() => patch({ status: value })}
                className={`h-10 lg:h-9 flex items-center justify-center gap-1.5 rounded-lg border text-[13px] font-medium transition-colors ${
                  draft.status === value
                    ? active
                    : "border-border-muted text-text-muted hover:bg-bg-hover hover:border-border-hover hover:text-text-primary"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {discountsOn && (
          <label className="flex flex-col gap-1.5">
            <FieldLabel
              label="Discount (%)"
              hint={out ? "Unavailable when out of stock" : `0–${MAX_DISCOUNT}`}
            />
            <input
              type="number"
              min={0}
              max={MAX_DISCOUNT}
              step={1}
              inputMode="numeric"
              disabled={out}
              value={draft.discount}
              placeholder={out ? "" : "0"}
              onChange={(e) =>
                patch({
                  discount:
                    e.target.value === ""
                      ? ""
                      : String(Math.max(0, Math.min(MAX_DISCOUNT, Math.round(Number(e.target.value)) || 0))),
                })
              }
              className={INPUT_CLASS}
            />
          </label>
        )}
      </ManagedForm>

      <ListSection
        list={list}
        title="Added products"
        count={items.length}
        EmptyIcon={Package}
        emptyText="No products yet. Add your first one above."
      >
        {items.map((it) => {
          const sb = STATUS_BUTTONS.find((s) => s.value === it.status);
          const Icon = sb.icon;
          const tier = it.status === "out" ? null : tierOf(it.discount);
          return (
            <ManagedRow
              key={it.id}
              list={list}
              entity={it}
              label={it.name || "product"}
              leading={<Icon size={16} className={`flex-none ${sb.text}`} />}
              title={it.name || "New product"}
              titleClass={it.status === "out" ? "text-text-muted" : "text-text-primary"}
              trailing={
                tier && (
                  <span className={`flex-none h-5 px-1.5 rounded inline-flex items-center text-xs font-semibold tabular-nums ${CHIP_CLASS[tier]}`}>
                    −{it.discount}%
                  </span>
                )
              }
            />
          );
        })}
      </ListSection>
    </ColumnModal>
  );
}

export default ProductsModal;

// Used by: ProductsSection.jsx.
