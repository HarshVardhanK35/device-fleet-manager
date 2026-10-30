import SettingsCard from "../../../shared/SettingsCard.jsx";
import ToggleSwitch from "../../../shared/ToggleSwitch.jsx";
import Hint from "../common/Hint.jsx";
import { BANNER_CAP } from "./statusListConfig.js";

// A label + switch + one-line hint — the same row repeated for every
// attention feature.
function ToggleRow({ label, hint, checked, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <span className="text-text-primary text-sm font-medium">{label}</span>
        <ToggleSwitch checked={checked} onChange={onChange} />
      </div>
      <Hint text={hint} />
    </div>
  );
}

// The "Attention" settings card — the features from spec §8 (row flash,
// out-of-stock pulse, big-deal shimmer, banner)
function AttentionSection({ form, set }) {
  const kitchen = form.purpose === "kitchen";
  return (
    <SettingsCard kicker="Attention">
      <ToggleRow
        label="Row flash on status change"
        hint="A 3s colour wash marks the item whose status just changed."
        checked={form.rowFlash}
        onChange={(v) => set("rowFlash", v)}
      />
      <ToggleRow
        label="Out-of-stock pulse"
        hint="Icon and label breathe with a red glow on every Out of Stock item."
        checked={form.outOfStockPulse}
        onChange={(v) => set("outOfStockPulse", v)}
      />
      <ToggleRow
        label="Big-deal shimmer"
        hint="A light sweep every 5s crosses Big-tier discount tags."
        checked={form.bigDealShimmer}
        onChange={(v) => set("bigDealShimmer", v)}
      />

      <ToggleRow
        label="Announcement banner"
        hint={
          kitchen
            ? "A full-width message above the list for staff notices."
            : "A full-width message above the list, for news bigger than any one item."
        }
        checked={form.banner}
        onChange={(v) => set("banner", v)}
      />
      {form.banner && (
        <label className="flex flex-col gap-1.5">
          <span className="flex items-baseline justify-between gap-2">
            <span className="text-text-primary text-sm font-medium">Banner text</span>
            <span
              className={`text-[11px] tabular-nums ${
                form.bannerText.length >= BANNER_CAP ? "text-accent-red" : "text-text-muted"
              }`}
            >
              {form.bannerText.length} / {BANNER_CAP}
            </span>
          </span>
          <input
            type="text"
            value={form.bannerText}
            maxLength={BANNER_CAP}
            placeholder={
              kitchen
                ? "e.g. Walk-in restock arrives at 3 PM"
                : "e.g. Happy Hour: 30% off cold drinks until 6 pm"
            }
            onChange={(e) => set("bannerText", e.target.value.slice(0, BANNER_CAP))}
            className="w-full bg-bg-primary border border-border-muted hover:border-border-hover focus:border-accent-blue rounded-lg px-3 py-2 text-sm text-text-primary outline-none transition-colors"
          />
        </label>
      )}

    </SettingsCard>
  );
}

export default AttentionSection;

// Used by: StatusListSettings.jsx.
