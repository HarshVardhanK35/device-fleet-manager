import { Timer } from "lucide-react";

import SettingsCard from "../../../shared/SettingsCard.jsx";
import ToggleSwitch from "../../../shared/ToggleSwitch.jsx";
import StyledSelect from "../../../../components/StyledSelect.jsx";
import Hint from "../common/Hint.jsx";

const REALERT_OPTIONS = ["Off", "10 s", "30 s", "1 min", "2 min"];

// The "Attention" settings card — staggered entrance, urgent glow pulse,
// reduce motion (the master suppressor for the two above), re-alert sweep,
// critical mode. `openField`/`onOpenFieldChange` coordinate this card's own
// dropdown (re-alert sweep) with sibling dropdowns elsewhere in the panel
// (Font family) — same shared-state pattern as ContentFilterSortBar.
function AttentionSection({
  form,
  set,
  portalContainer,
  openField,
  onOpenFieldChange,
}) {
  return (
    <SettingsCard kicker="Attention">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`text-sm font-medium ${
              form.reduceMotion ? "text-text-muted" : "text-text-primary"
            }`}
          >
            Staggered entrance
          </span>
          <ToggleSwitch
            checked={form.staggeredEntrance}
            onChange={(v) => set("staggeredEntrance", v)}
            disabled={form.reduceMotion}
          />
        </div>
        <Hint
          text="Cards slide in one after another on load, instead of all at once."
          dim={form.reduceMotion}
        />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`text-sm font-medium ${
              form.reduceMotion ? "text-text-muted" : "text-text-primary"
            }`}
          >
            Urgent glow pulse
          </span>
          <ToggleSwitch
            checked={form.urgentGlowPulse}
            onChange={(v) => set("urgentGlowPulse", v)}
            disabled={form.reduceMotion}
          />
        </div>
        <Hint
          text="Urgent cards softly breathe (border + shadow) to draw the eye."
          dim={form.reduceMotion}
        />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-text-primary text-sm font-medium">
            Reduce motion
          </span>
          <ToggleSwitch
            checked={form.reduceMotion}
            onChange={(v) => set("reduceMotion", v)}
          />
        </div>
        <Hint text="Turns off every animation above — for sensitive audiences." />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`text-sm font-medium ${
              form.reduceMotion ? "text-text-muted" : "text-text-primary"
            }`}
          >
            Re-alert sweep
          </span>
          <div className="w-[140px]">
            <StyledSelect
              value={form.urgentRealertInterval}
              onChange={(v) => set("urgentRealertInterval", v)}
              options={REALERT_OPTIONS.map((o) => ({ value: o, label: o }))}
              icon={Timer}
              label="Re-alert sweep"
              portalContainer={portalContainer}
              bgClassName="bg-bg-primary"
              collapseOnMobile={false}
              matchTriggerWidth
              disabled={form.reduceMotion}
              open={openField === "realert"}
              onOpenChange={(o) => onOpenFieldChange(o ? "realert" : null)}
            />
          </div>
        </div>
        <Hint
          text="A light sweep crosses Urgent cards at this interval, for re-attention."
          dim={form.reduceMotion}
        />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-text-primary text-sm font-medium">
            Critical mode
          </span>
          <ToggleSwitch
            checked={form.criticalMode}
            onChange={(v) => set("criticalMode", v)}
          />
        </div>
        <Hint text="Shows a full-width red alert bar across the top. Emergencies only." />
      </div>
    </SettingsCard>
  );
}

export default AttentionSection;

// Used by: RotatingNoticesSettings.jsx.
