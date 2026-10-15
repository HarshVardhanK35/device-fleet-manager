import appsRegistry from "./appsRegistry.json";

// Fixed category order + "coming soon" placeholder slots, matching the
// chosen Apps-Picker design exactly (variant C — "Shelves"). Real apps come
// from appsRegistry.json; placeholders are static since no backend tracks
// unbuilt apps. "Social" exists purely to show room for growth — it has no
// real app yet.
const CATEGORY_ORDER = ["Live Data", "News", "Utility", "Social"];

const PLACEHOLDERS = {
  "Live Data": [{ name: null }],
  Utility: [{ name: null }],
  Social: [{ name: "Instagram" }, { name: "Facebook" }],
};

export function buildAppSections({
  category = "All",
  availableOnly = false,
  sort = "default",
}) {
  const categories =
    category === "All"
      ? CATEGORY_ORDER
      : CATEGORY_ORDER.filter((c) => c === category);

  return categories
    .map((cat) => {
      const liveApps = appsRegistry
        .filter((a) => a.category === cat)
        .map((a) => ({
          id: a.appId,
          name: a.name,
          live: true,
          thumbnail: a.thumbnail,
        }));

      const placeholders = availableOnly
        ? []
        : (PLACEHOLDERS[cat] || []).map((p) => ({
            id: null,
            name: p.name,
            live: false,
            thumbnail: null,
          }));

      let items = [...liveApps, ...placeholders];
      if (sort === "az") {
        items = [...items].sort(
          (a, b) =>
            !a.name - !b.name || (a.name || "").localeCompare(b.name || ""),
        );
      }

      const liveCount = liveApps.length;
      return {
        category: cat,
        items,
        meta: liveCount ? `${liveCount} available` : "Coming soon",
      };
    })
    .filter((s) => s.items.length > 0);
}

export function getCategoryList() {
  return ["All", ...CATEGORY_ORDER];
}

export function getAppCounts(availableOnly) {
  const counts = {};
  for (const cat of CATEGORY_ORDER) {
    const liveCount = appsRegistry.filter((a) => a.category === cat).length;
    const placeholderCount = availableOnly
      ? 0
      : (PLACEHOLDERS[cat] || []).length;
    counts[cat] = liveCount + placeholderCount;
  }
  counts.All = Object.values(counts).reduce((a, b) => a + b, 0);
  return counts;
}
