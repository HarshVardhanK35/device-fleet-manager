import { useState } from "react";
import { Type } from "lucide-react";

import SettingsCard from "../../../shared/SettingsCard.jsx";
import Field from "../../../shared/Field.jsx";
import SegmentedControl from "../../../shared/SegmentedControl.jsx";
import ToggleSwitch from "../../../shared/ToggleSwitch.jsx";
import BackgroundAudioField from "../../../shared/BackgroundAudioField.jsx";
import StyledSelect from "../../../../components/StyledSelect.jsx";
import ProductsSection from "./ProductsSection.jsx";
import { PURPOSES, PURPOSE_LABELS, PURPOSE_DEFAULTS } from "./statusListConfig.js";
import AttentionSection from "./AttentionSection.jsx";

// Matches SPEC.md §4 (Inter default, then the 14 alternates).
const FONTS = [
  "Inter",
  "Atkinson Hyperlegible",
  "Barlow",
  "Archivo",
  "Manrope",
  "Space Grotesk",
  "Bricolage Grotesque",
  "Lexend",
  "Outfit",
  "Figtree",
  "Plus Jakarta Sans",
  "Sora",
  "Rubik",
  "Oswald",
  "IBM Plex Sans",
];

// Per-option tooltips for the Purpose control (hover).
const PURPOSE_TIPS = {
  kitchen: "Inventory for kitchen staff — no discounts.",
  customers: "Menu board for customers — shows discounts.",
};

const LAYOUTS = ["List", "Grid"];

// No audio Content support exists yet (see future-implementations.md).
const AUDIO_OPTIONS = ["None"];

const TITLE_CAP = 30;

// Just the field layout — no shell, no hook, no preview. Rendered by
// announcements-modal.jsx inside its own single shared AppSettingsShell.
function StatusListFields({
  form,
  setForm,
  set,
  portalContainer,
  layerContainer,
  onDraftChange,
  onModalOpenChange,
  purposeLocked,
}) {
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  // Coordinates the dropdowns in this panel (font, background audio) —
  // opening one closes the other.
  const [openField, setOpenField] = useState(null);

  function setPurpose(p) {
    setForm((prev) => {
      const other = p === "kitchen" ? "customers" : "kitchen";
      return {
        ...prev,
        purpose: p,
        priority: PURPOSE_DEFAULTS[p].priority,
        title: prev.title === PURPOSE_DEFAULTS[other].title ? PURPOSE_DEFAULTS[p].title : prev.title,
      };
    });
  }

  return (
    <>
      <SettingsCard kicker="Purpose">
        <SegmentedControl
          options={PURPOSES}
          value={form.purpose}
          onChange={setPurpose}
          labelFor={(p) => PURPOSE_LABELS[p]}
          disabledOptions={purposeLocked ? PURPOSES.filter((p) => p !== form.purpose) : []}
          titleFor={(p) =>
            purposeLocked && p !== form.purpose
              ? "Locked once saved — create a new Status List to use the other purpose."
              : `${PURPOSE_TIPS[p]} ${purposeLocked ? "" : "Can't be changed after saving."}`.trim()
          }
        />
      </SettingsCard>

      <ProductsSection
        form={form}
        setForm={setForm}
        layerContainer={layerContainer}
        onDraftChange={onDraftChange}
        onModalOpenChange={onModalOpenChange}
      />

      <SettingsCard kicker="Display">
        <Field label="Board title">
          <input
            type="text"
            value={form.title}
            maxLength={TITLE_CAP}
            onChange={(e) => set("title", e.target.value.slice(0, TITLE_CAP))}
            className="w-full bg-bg-primary border border-border-muted hover:border-border-hover focus:border-accent-blue rounded-lg px-3 py-2 text-sm text-text-primary outline-none transition-colors"
          />
        </Field>

        <div className="flex flex-col gap-1.5">
          <span className="text-text-primary text-sm font-medium">Layout</span>
          <SegmentedControl
            options={LAYOUTS}
            value={form.layout}
            onChange={(v) => set("layout", v)}
            disabled={form.items.length <= 3}
            titleFor={() =>
              form.items.length <= 3
                ? "Disabled with 3 or fewer products — the board shows large spotlight cards instead."
                : undefined
            }
          />
        </div>


        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <span
              title="Greys out and strikes through the name of Out of Stock items."
              className="text-text-primary text-sm font-medium"
            >
              Dim out-of-stock items
            </span>
            <ToggleSwitch
              checked={form.dimOutOfStock}
              onChange={(v) => set("dimOutOfStock", v)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-text-primary text-sm font-medium">Light theme (iframe only)</span>
            <ToggleSwitch
              checked={form.theme === "light"}
              onChange={(v) => set("theme", v ? "light" : "dark")}
            />
          </div>
        </div>
      </SettingsCard>

      <AttentionSection form={form} set={set} />

      <SettingsCard kicker="Font">
        <Field label="Font family">
          <StyledSelect
            value={form.font}
            onChange={(v) => set("font", v)}
            options={FONTS.map((f) => ({ value: f, label: f }))}
            icon={Type}
            label="Font family"
            portalContainer={portalContainer}
            bgClassName="bg-bg-primary"
            collapseOnMobile={false}
            matchTriggerWidth
            open={openField === "font"}
            onOpenChange={(o) => setOpenField(o ? "font" : null)}
          />
        </Field>
      </SettingsCard>

      <SettingsCard kicker="Background audio">
        <BackgroundAudioField
          options={AUDIO_OPTIONS}
          value={form.audio}
          onChange={(v) => {
            set("audio", v);
            setAudioPlaying(false);
          }}
          playing={audioPlaying}
          onTogglePlay={() => setAudioPlaying((p) => !p)}
          muted={audioMuted}
          onToggleMute={() => setAudioMuted((m) => !m)}
          portalContainer={portalContainer}
          open={openField === "audio"}
          onOpenChange={(o) => setOpenField(o ? "audio" : null)}
        />
      </SettingsCard>
    </>
  );
}

export default StatusListFields;

// Status List template's field layout, for the Announcements app's single
// shared settings shell (see announcements-modal.jsx). Spec:
// z-announcement-designs/status/SPEC.md.
