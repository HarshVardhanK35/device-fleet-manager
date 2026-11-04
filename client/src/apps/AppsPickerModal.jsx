import { useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Filter, ArrowUpDown, Lock, ChevronRight, CloudSun, Clock, Rss, Megaphone, AppWindow } from "lucide-react";

import CancelButton from "../components/ui/CancelButton.jsx";
import ScrollBox from "../components/layout/ScrollBox.jsx";
import StyledSelect from "../components/ui/StyledSelect.jsx";
import ToggleSwitch from "./shared/ToggleSwitch.jsx";
import { buildAppSections, getCategoryList, getAppCounts } from "./appCategories.js";

// Stand-in for an app's thumbnail until it has one: an app whose registry entry
// has a `thumbnail` shows that picture in the square instead (appsRegistry.json).
const APP_ICONS = { Weather: CloudSun, Clock, RSS: Rss, Announcements: Megaphone };

// Reuses StyledSelect — the same Filter/Sort dropdown component the Content
// page uses — instead of a custom dropdown, for visual/behavior consistency
// across the app. "Available now" is a standalone toggle next to the pill
// rather than nested inside the Filter dropdown, since StyledSelect (a
// plain Radix Select item list) can't host an embedded switch.
function FilterSortBar({
  category,
  setCategory,
  availableOnly,
  setAvailableOnly,
  sort,
  setSort,
  portalContainer,
}) {
  const [openMenu, setOpenMenu] = useState(null); // "filter" | "sort" | null
  const counts = getAppCounts(availableOnly);

  const filterOptions = getCategoryList().map((c) => ({
    value: c,
    label: c === "All" ? "All apps" : c,
  }));
  const sortOptions = [
    { value: "default", label: "Default order" },
    { value: "az", label: "Alphabetical (A–Z)" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="flex items-center">
        <StyledSelect
          value={category}
          onChange={setCategory}
          options={filterOptions}
          labelFor={(o) => `${o.label} (${counts[o.value] ?? 0})`}
          icon={Filter}
          label="Filter apps"
          open={openMenu === "filter"}
          onOpenChange={(open) => setOpenMenu(open ? "filter" : null)}
          roundedSide="left"
          portalContainer={portalContainer}
        />
        <StyledSelect
          value={sort}
          onChange={setSort}
          options={sortOptions}
          icon={ArrowUpDown}
          label="Sort apps"
          open={openMenu === "sort"}
          onOpenChange={(open) => setOpenMenu(open ? "sort" : null)}
          roundedSide="right"
          portalContainer={portalContainer}
        />
      </div>

      <ToggleSwitch
        checked={availableOnly}
        onChange={setAvailableOnly}
        label="Available now"
      />
    </div>
  );
}

// Owns filter/sort state. Rendered only while `open` is true, so it mounts
// fresh (fresh initial state) every time the modal opens — resets filter,
// sort, and availability back to defaults on every reopen instead of
// carrying over whatever was applied last time. Same pattern as
// ContentPickerModal.jsx's PickerFormBody.
function AppsPickerBody({ onSelectApp, portalContainer }) {
  const [category, setCategory] = useState("All");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState("default");

  const sections = useMemo(
    () => buildAppSections({ category, availableOnly, sort }),
    [category, availableOnly, sort],
  );

  return (
    <>
      <div className="px-4 sm:px-6 md:px-8 pb-4">
        <FilterSortBar
          category={category}
          setCategory={setCategory}
          availableOnly={availableOnly}
          setAvailableOnly={setAvailableOnly}
          sort={sort}
          setSort={setSort}
          portalContainer={portalContainer}
        />
      </div>

      <main className="flex flex-col gap-8 px-4 sm:px-6 md:px-8 pb-12 overflow-x-hidden">
        {sections.map((s) => (
          <section
            key={s.category}
            className="flex flex-col lg:flex-row gap-3 lg:gap-6 min-w-0 border-t border-border-muted pt-5"
          >
            <div className="flex-none lg:w-[170px] flex flex-row lg:flex-col items-baseline lg:items-start gap-2.5 lg:gap-1.5">
              <span className="w-4 h-0.5 rounded-full bg-accent-blue" />
              <h2 className="m-0 text-lg font-semibold text-text-primary">{s.category}</h2>
              <span className="text-xs text-text-muted">{s.meta}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {s.items.map((it, i) => {
                  const Icon = APP_ICONS[it.name] || AppWindow;
                  return it.live ? (
                    <button
                      key={it.id}
                      type="button"
                      onClick={() => onSelectApp?.(it)}
                      className="group min-w-0 flex items-center gap-4 p-4 text-left bg-bg-panel border border-border-muted rounded-xl hover:border-accent-blue hover:shadow-[0_0_24px_-8px_rgba(47,129,247,0.6)] transition-all"
                    >
                      <span className="flex-none w-14 h-14 rounded-lg bg-bg-primary border border-border-muted overflow-hidden flex items-center justify-center text-accent-blue">
                        {it.thumbnail ? (
                          <img src={it.thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Icon size={26} />
                        )}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-base font-semibold text-text-primary truncate">{it.name}</span>
                        {it.description && (
                          <span className="block mt-0.5 text-sm text-text-muted leading-snug line-clamp-2">
                            {it.description}
                          </span>
                        )}
                      </span>
                      <ChevronRight size={18} className="flex-none text-text-muted group-hover:text-accent-blue transition-colors" />
                    </button>
                  ) : (
                    <div
                      key={`${s.category}-soon-${i}`}
                      aria-disabled="true"
                      className="min-w-0 flex items-center gap-4 p-4 border border-dashed border-border-muted rounded-xl opacity-45 cursor-not-allowed select-none"
                    >
                      <span className="flex-none w-14 h-14 rounded-lg border border-dashed border-border-muted flex items-center justify-center text-text-muted">
                        <Lock size={20} />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-base font-semibold text-text-muted truncate">{it.name || "More apps"}</span>
                        <span className="block mt-0.5 text-sm text-text-muted">Coming soon...</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ))}

        {sections.length === 0 && (
          <p className="text-text-muted text-sm mt-6">
            Nothing available in this view yet. Turn off "Available now" to see what's coming.
          </p>
        )}
      </main>
    </>
  );
}

function AppsPickerModal({ open, onOpenChange, onSelectApp }) {
  // Radix Select's own Portal defaults to document.body, but Dialog's modal
  // pointer-events lockdown treats a body-level sibling portal as "outside"
  // content and disables pointer events on it — silently killing hover
  // highlighting on the Filter/Sort dropdowns (see StyledSelect.jsx's
  // `portalContainer` comment). Keeping the Select's portal inside this
  // Dialog's own content node avoids that.
  const [contentEl, setContentEl] = useState(null);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-40" />
        <Dialog.Content
          ref={setContentEl}
          className="fixed inset-0 bg-bg-primary z-50 flex flex-col overflow-hidden"
        >
          <div className="flex items-start justify-between gap-3 px-4 sm:px-6 md:px-8 pt-6 pb-4">
            <Dialog.Title className="m-0 text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
              Apps
            </Dialog.Title>
            <CancelButton as={Dialog.Close} size="lg" title="Close" />
          </div>

          <ScrollBox className="flex-1 min-h-0">
            {open && <AppsPickerBody onSelectApp={onSelectApp} portalContainer={contentEl} />}
          </ScrollBox>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default AppsPickerModal;

// Full-screen "Apps" picker (Radix Dialog, inset:0 instead of centered —
// matches the chosen variant-C "Shelves" design decoded from
// Apps-Picker.html). Reads real apps from appsRegistry.json via
// appCategories.js, grouped into fixed category rows with static
// "Coming soon" placeholder slots. Real app cards call `onSelectApp(app)`;
// placeholder cards are inert. Filter (category) and Sort (Default/A-Z)
// reuse StyledSelect — same dropdown component as the Content page's own
// Filter/Sort — merged into one pill via roundedSide. "Available now" is a
// separate standalone toggle next to the pill, not nested inside Filter.
// Used by: pages/Content.jsx (wired from "Add an App").
