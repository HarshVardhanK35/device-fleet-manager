import SettingsCard from "../../../shared/SettingsCard.jsx";
import ToggleSwitch from "../../../shared/ToggleSwitch.jsx";
import CardsSection from "./CardsSection.jsx";
import EffectsSection from "./EffectsSection.jsx";

// Just the field layout — no shell, no hook, no preview. Rendered by
// announcements-modal.jsx inside its own single shared AppSettingsShell.
// Order: Cards, Display, Attention (effects). The per-card font lives in the
// Manage cards modal, so there's no font card here.
function EventCardsFields({
  form,
  setForm,
  set,
  portalContainer,
  layerContainer,
  onDraftChange,
  onModalOpenChange,
  library,
}) {
  return (
    <>
      <CardsSection
        form={form}
        setForm={setForm}
        layerContainer={layerContainer}
        onDraftChange={onDraftChange}
        onModalOpenChange={onModalOpenChange}
        portalContainer={portalContainer}
        library={library}
      />

      <SettingsCard kicker="Display">
        <div className="flex items-center justify-between gap-2">
          <span className="text-text-primary text-sm font-medium">Light theme (iframe only)</span>
          <ToggleSwitch
            checked={form.theme === "light"}
            onChange={(v) => set("theme", v ? "light" : "dark")}
          />
        </div>
      </SettingsCard>

      <EffectsSection form={form} set={set} />
    </>
  );
}

export default EventCardsFields;

// Event Cards template's field layout, for the Announcements app's single
// shared settings shell (see announcements-modal.jsx). Spec:
// z-announcement-designs/events/SPEC.md.
