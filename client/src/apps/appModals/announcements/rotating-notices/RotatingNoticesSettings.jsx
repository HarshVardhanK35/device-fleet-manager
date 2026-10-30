import { useState } from "react";
import { Type } from "lucide-react";

import SettingsCard from "../../../shared/SettingsCard.jsx";
import Field from "../../../shared/Field.jsx";
import ToggleSwitch from "../../../shared/ToggleSwitch.jsx";
import BackgroundAudioField from "../../../shared/BackgroundAudioField.jsx";
import StyledSelect from "../../../../components/StyledSelect.jsx";
import BoardsSection from "./BoardsSection.jsx";
import AttentionSection from "./AttentionSection.jsx";

// Matches Rotating Notices - Spec.md section 10, in the same order.
const FONTS = [
  "Inter",
  "Atkinson Hyperlegible",
  "Overpass",
  "Lexend",
  "IBM Plex Sans",
  "Public Sans",
  "Source Sans 3",
  "Red Hat Display",
  "Figtree",
  "Manrope",
  "Barlow",
];

// No audio Content support exists yet (see future-implementations.md) — so
// there's nothing real to list here. Matches weather-modal.jsx/
// clock-modal.jsx's own list.
const AUDIO_OPTIONS = ["None"];

// Just the field layout — no shell, no hook, no preview. Rendered by
// announcements-modal.jsx inside its own single shared AppSettingsShell, so
// the template-selector buttons can stay visible in the same modal while
// this content swaps underneath.
//
// Split into BoardsSection.jsx / AttentionSection.jsx (each owns its own
// local state) — this file now only owns what's genuinely shared across
// cards: the dropdown-coordination state (openField) and the two small
// one-off cards (Font, Background audio) not worth their own file.
function RotatingNoticesFields({
  form,
  setForm,
  set,
  portalContainer,
  layerContainer,
  onDraftChange,
  onModalOpenChange,
}) {
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  // Coordinates every StyledSelect dropdown in this panel (re-alert sweep,
  // font family, background audio) — opening one closes any other that's
  // already open, same pattern as ContentFilterSortBar's Filter/Sort pair.
  const [openField, setOpenField] = useState(null);

  return (
    <>
      <BoardsSection
        form={form}
        setForm={setForm}
        layerContainer={layerContainer}
        onDraftChange={onDraftChange}
        onModalOpenChange={onModalOpenChange}
      />

      <SettingsCard kicker="Display">
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

      <AttentionSection
        form={form}
        set={set}
        portalContainer={portalContainer}
        openField={openField}
        onOpenFieldChange={setOpenField}
      />

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

export default RotatingNoticesFields;

// Rotating Notices template's field layout, for the Announcements app's
// single shared settings shell (see announcements-modal.jsx — it owns the
// one AppSettingsShell/useAppSettingsForm instance, the template-selector
// buttons, and switches which template's Fields component renders here).
// Spec: z-announcement-designs/Rotating Notices - Spec.md.
