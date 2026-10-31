import { useState } from "react";
import { CircleCheck, List, OctagonX, TriangleAlert } from "lucide-react";

import SettingsCard from "../../../shared/SettingsCard.jsx";
import SegmentedControl from "../../../shared/SegmentedControl.jsx";
import ProductsModal from "./ProductsModal.jsx";
import { MAX_ITEMS, tierOf } from "./statusListConfig.js";

const STATUS_ICON = {
  in: { icon: CircleCheck, className: "text-accent-green" },
  low: { icon: TriangleAlert, className: "text-accent-amber" },
  out: { icon: OctagonX, className: "text-accent-red" },
};

const SUMMARY_COUNT = 3;

// Kitchen has no discounts, so no "Deals first" — "Low first" (running low
// on top) takes its place.
// Per-option tooltips for the Priority order control (hover).
const PRIORITY_TIPS = {
  Off: "Keep the order the products were added in.",
  "Deals first": "Biggest discounts on top.",
  "Out first": "Unavailable items on top.",
  "Low first": "Items running low on top.",
};

const PRIORITY_OPTIONS = {
  customers: ["Off", "Deals first", "Out first"],
  kitchen: ["Off", "Out first", "Low first"],
};

// The "Products" settings card — a short summary plus a button that opens
// the column-anchored "Manage products" modal, so adding products never
// grows the settings panel.
function ProductsSection({ form, setForm, layerContainer, onDraftChange, onModalOpenChange }) {
  const [managing, setManaging] = useState(false);
  const items = form.items;
  const discountsOn = form.purpose === "customers";

  return (
    <>
      <SettingsCard kicker={`Products (${items.length} / ${MAX_ITEMS})`}>
        <ul className="list-none m-0 p-0 flex flex-col gap-1.5">
          {items.length === 0 && <li className="text-[13px] text-text-muted">No products yet</li>}
          {items.slice(0, SUMMARY_COUNT).map((it) => {
            const { icon: Icon, className } = STATUS_ICON[it.status];
            const tier = !discountsOn || it.status === "out" ? null : tierOf(it.discount);
            return (
              <li key={it.id} className="flex items-center gap-2 min-w-0 text-[13px] text-text-primary">
                <Icon size={14} className={`flex-none ${className}`} />
                <span className="flex-1 min-w-0 truncate">{it.name || "New product"}</span>
                {tier && <span className="flex-none text-xs text-text-muted tabular-nums">−{it.discount}%</span>}
              </li>
            );
          })}
          {items.length > SUMMARY_COUNT && (
            <li className="text-[13px] text-text-muted">+ {items.length - SUMMARY_COUNT} more</li>
          )}
        </ul>
        <button
          type="button"
          onClick={() => setManaging(true)}
          className="flex items-center justify-center gap-2 h-10 text-sm font-semibold text-text-primary bg-bg-primary border border-border-muted hover:border-border-hover hover:bg-bg-hover rounded-lg px-3 transition-colors"
        >
          <List size={16} />
          {items.length === 0 ? "Add product" : "Manage products"}
        </button>

        <div className="flex flex-col gap-1.5">
          <span className="text-text-primary text-sm font-medium">Priority order</span>
          <SegmentedControl
            options={PRIORITY_OPTIONS[form.purpose] ?? PRIORITY_OPTIONS.customers}
            value={form.priority}
            onChange={(v) => setForm((prev) => ({ ...prev, priority: v }))}
            titleFor={(p) => PRIORITY_TIPS[p]}
          />
        </div>
      </SettingsCard>

      {managing && (
        <ProductsModal
          layerEl={layerContainer}
          items={items}
          setForm={setForm}
          onClose={() => setManaging(false)}
          onDraftChange={onDraftChange}
          onModalOpenChange={onModalOpenChange}
          discountsOn={discountsOn}
        />
      )}
    </>
  );
}

export default ProductsSection;

// Used by: StatusListSettings.jsx.
