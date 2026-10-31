// Non-component pieces shared with announcements-modal.jsx's template
// registry — kept out of StatusListSettings.jsx for the same reason as
// rotatingNoticesConfig.js (a file mixing component + non-component exports
// breaks React Fast Refresh).
// Spec: z-announcement-designs/status/SPEC.md.

export const MAX_ITEMS = 10;
export const NAME_CAP = 30;
export const BANNER_CAP = 60;
export const MAX_DISCOUNT = 90;

export const PURPOSES = ["kitchen", "customers"];
export const PURPOSE_LABELS = { kitchen: "Kitchen", customers: "Customers" };
// What each purpose starts with — the title only follows a purpose switch
// while it's still the other purpose's untouched default.
export const PURPOSE_DEFAULTS = {
  kitchen: { title: "Kitchen Inventory", priority: "Out first" },
  customers: { title: "Menu Board", priority: "Deals first" },
};


// Discount tier from a percentage (spec §3.3): Small 1-15, Medium 16-35,
// Big 36+. 0 / blank means no discount, so no tier.
export function tierOf(pct) {
  if (!pct || pct <= 0) return null;
  if (pct <= 15) return "Small";
  if (pct <= 35) return "Medium";
  return "Big";
}

// Blank item — used for every "Add product" click.
export function newItem() {
  return { id: crypto.randomUUID(), name: "", status: "in", discount: 0 };
}


export const STATUS_LIST_INITIAL_FORM = {
  template: "status-list",
  theme: "dark",
  font: "Inter",
  title: PURPOSE_DEFAULTS.customers.title,
  layout: "List",
  // Chosen once on a new tile, locked after the first save (see
  // StatusListSettings.jsx) — decides whether discounts exist at all.
  purpose: "customers",
  dimOutOfStock: true,
  priority: PURPOSE_DEFAULTS.customers.priority,
  items: [],
  // Attention features (spec §8).
  rowFlash: true,
  outOfStockPulse: true,
  bigDealShimmer: true,
  banner: false,
  bannerText: "",
  audio: "None",
};

// Status Lists are static boards, not rotations — a flat on-screen time,
// same as Weather/Clock. 30 s for a new tile; after that the user owns it
// (Content pane → Display duration), so saving settings keeps the saved value.
export function computeStatusListDuration(_form, existingContent) {
  return existingContent?.durationInMillis || 30000;
}
