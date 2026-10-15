import { useEffect, useMemo, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Filter, ArrowUpDown, ChevronDown, Check, Lock } from "lucide-react";

import CancelButton from "../components/CancelButton.jsx";
import ScrollBox from "../components/ScrollBox.jsx";
import { buildAppSections, getCategoryList, getAppCounts } from "./appCategories.js";

// Font size scales with the CARD's own rendered width (container query
// units, cqw) instead of a fixed breakpoint — a `sm:`/`lg:` tier kept
// breaking at in-between widths (tablet, laptop) because the card's actual
// pixel size at a given breakpoint isn't fixed (it depends on the grid's
// column count there too). cqw sizing tracks the real box, not the
// viewport. Still tiered by character count on top of that — a longer name
// needs a smaller fraction of the box's width per character than a short
// one. Requires the card itself to have `@container` (container-type:
// inline-size) applied — see appLabelSizeClass's call sites.
function appLabelSizeClass(name = "") {
  const len = name.length;
  if (len <= 6) return "text-[clamp(10px,18cqw,18px)]";
  if (len <= 9) return "text-[clamp(9px,13cqw,15px)]";
  if (len <= 13) return "text-[clamp(8px,10cqw,13px)]";
  return "text-[clamp(7px,8cqw,11px)]";
}

function FilterSortBar({ category, setCategory, availableOnly, setAvailableOnly, sort, setSort }) {
  const [menu, setMenu] = useState(null); // "filter" | "sort" | null
  const counts = getAppCounts(availableOnly);
  const categories = getCategoryList();
  const barRef = useRef(null);

  function stop(e) {
    e.stopPropagation();
  }

  // Close on outside click or on any scroll (scroll doesn't bubble, so the
  // listener needs capture:true to still see it from the modal's scrollable
  // container — same pattern already used for DateTimeField's popup).
  useEffect(() => {
    if (!menu) return;
    function handleOutside(e) {
      if (barRef.current && !barRef.current.contains(e.target)) {
        setMenu(null);
      }
    }
    function handleScroll() {
      setMenu(null);
    }
    document.addEventListener("mousedown", handleOutside);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [menu]);

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div ref={barRef} className="relative flex border border-border-muted rounded-lg bg-bg-panel">
        <div className="relative flex-1">
          <button
            type="button"
            onClick={(e) => {
              stop(e);
              setMenu(menu === "filter" ? null : "filter");
            }}
            className={`flex items-center gap-2 px-3 h-9 rounded-l-lg text-sm font-medium whitespace-nowrap transition-colors ${
              menu === "filter" ? "bg-bg-hover" : "hover:bg-bg-hover"
            }`}
          >
            <Filter size={15} className="text-text-muted" />
            <span className="text-text-muted">Filter</span>
            <ChevronDown size={12} className="text-text-muted" />
          </button>

          {menu === "filter" && (
            <div
              onClick={stop}
              className="absolute z-50 top-[calc(100%+6px)] left-0 w-[220px] p-1.5 bg-bg-panel border border-border-muted rounded-[10px] shadow-[0_8px_24px_rgba(1,4,9,0.55),0_1px_3px_rgba(1,4,9,0.4)]"
            >
              <div className="px-2 pt-1 pb-1.5 text-[11px] font-semibold tracking-wide uppercase text-text-muted">
                Category
              </div>
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className="flex items-center justify-between w-full px-2 py-2 rounded-md text-sm font-medium text-text-primary hover:bg-bg-hover transition-colors"
                >
                  <span>{c === "All" ? "All apps" : c}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">{counts[c] ?? 0}</span>
                    {category === c && <Check size={14} className="text-accent-blue" />}
                  </span>
                </button>
              ))}
              <div className="h-px my-1.5 mx-1 bg-border-muted" />
              <button
                type="button"
                role="switch"
                aria-checked={availableOnly}
                onClick={() => setAvailableOnly((v) => !v)}
                className="flex items-center justify-between w-full px-2 py-2 rounded-md text-sm font-medium text-text-primary hover:bg-bg-hover transition-colors"
              >
                Available now
                <span
                  className={`relative w-[34px] h-5 rounded-full transition-colors ${
                    availableOnly ? "bg-accent-blue/70" : "bg-bg-hover"
                  }`}
                >
                  <span
                    className={`absolute top-[3px] w-3.5 h-3.5 rounded-full bg-text-primary transition-all ${
                      availableOnly ? "left-[17px]" : "left-[3px]"
                    }`}
                  />
                </span>
              </button>
            </div>
          )}
        </div>

        <div className="w-px bg-border-muted" />

        <div className="relative flex-1">
          <button
            type="button"
            onClick={(e) => {
              stop(e);
              setMenu(menu === "sort" ? null : "sort");
            }}
            className={`flex items-center gap-2 px-3 h-9 rounded-r-lg text-sm font-medium whitespace-nowrap transition-colors ${
              menu === "sort" ? "bg-bg-hover" : "hover:bg-bg-hover"
            }`}
          >
            <ArrowUpDown size={15} className="text-text-muted" />
            <span className="text-text-muted">Sort</span>
            <ChevronDown size={12} className="text-text-muted" />
          </button>

          {menu === "sort" && (
            <div
              onClick={stop}
              className="absolute z-50 top-[calc(100%+6px)] right-0 w-[180px] p-1.5 bg-bg-panel border border-border-muted rounded-[10px] shadow-[0_8px_24px_rgba(1,4,9,0.55),0_1px_3px_rgba(1,4,9,0.4)]"
            >
              {[
                { value: "default", label: "Default order" },
                { value: "az", label: "Alphabetical (A–Z)" },
              ].map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    setSort(o.value);
                    setMenu(null);
                  }}
                  className="flex items-center justify-between w-full px-2 py-2 rounded-md text-sm font-medium text-text-primary hover:bg-bg-hover transition-colors"
                >
                  <span>{o.label}</span>
                  {sort === o.value && <Check size={14} className="text-accent-blue" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {availableOnly && (
        <button
          type="button"
          onClick={() => setAvailableOnly(false)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-accent-blue/15 text-accent-blue text-xs font-semibold"
        >
          Available now
          <span className="text-[10px]">✕</span>
        </button>
      )}
    </div>
  );
}

// Owns filter/sort state. Rendered only while `open` is true, so it mounts
// fresh (fresh initial state) every time the modal opens — resets filter,
// sort, and availability back to defaults on every reopen instead of
// carrying over whatever was applied last time. Same pattern as
// ContentPickerModal.jsx's PickerFormBody.
function AppsPickerBody({ onSelectApp }) {
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
              <div className="grid grid-flow-col auto-cols-[130px] overflow-x-auto scrollbar-hidden snap-x snap-mandatory pb-2 gap-3 sm:grid-flow-row sm:auto-cols-auto sm:overflow-visible sm:snap-none sm:pb-0 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
                {s.items.map((it, i) =>
                  it.live ? (
                    <button
                      key={it.id}
                      type="button"
                      onClick={() => onSelectApp?.(it)}
                      className="group relative min-w-0 snap-start @container aspect-[4/3] rounded-lg bg-bg-panel border border-border-muted hover:border-accent-blue hover:shadow-[0_0_24px_-8px_rgba(47,129,247,0.6)] flex items-center justify-center overflow-hidden px-2 transition-all"
                    >
                      <span
                        className={`block w-full text-center text-text-primary font-bold tracking-wide uppercase leading-tight whitespace-nowrap ${appLabelSizeClass(it.name)}`}
                      >
                        {it.name}
                      </span>
                    </button>
                  ) : (
                    <div
                      key={`${s.category}-soon-${i}`}
                      aria-disabled="true"
                      className="relative min-w-0 snap-start @container aspect-[4/3] rounded-lg border border-dashed border-border-muted opacity-45 cursor-not-allowed overflow-hidden flex flex-col items-center justify-center gap-1.5 px-2 select-none"
                    >
                      {it.name && (
                        <span className="absolute top-2 left-2 flex items-center gap-1 text-[11px] text-text-muted">
                          <Lock size={11} />
                        </span>
                      )}
                      {it.name && (
                        <span
                          className={`block w-full text-center font-bold tracking-wide uppercase whitespace-nowrap text-text-muted ${appLabelSizeClass(it.name)}`}
                        >
                          {it.name}
                        </span>
                      )}
                      <span className="text-xs text-text-muted">Coming soon...</span>
                    </div>
                  ),
                )}
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
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-40" />
        <Dialog.Content className="fixed inset-0 bg-bg-primary z-50 flex flex-col overflow-hidden">
          <div className="flex items-start justify-between gap-3 px-4 sm:px-6 md:px-8 pt-6 pb-4">
            <Dialog.Title className="m-0 text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
              Apps
            </Dialog.Title>
            <CancelButton as={Dialog.Close} size="lg" />
          </div>

          <ScrollBox className="flex-1 min-h-0">
            {open && <AppsPickerBody onSelectApp={onSelectApp} />}
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
// placeholder cards are inert. Filter (category + "Available now") and Sort
// (Default/A-Z) are a custom merged pill — not StyledSelect, since the
// Filter panel needs an embedded toggle switch alongside the category list,
// which Radix Select's item-list-only content can't host.
// Used by: pages/Content.jsx (wired from "Add an App").
