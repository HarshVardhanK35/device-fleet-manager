import { useEffect, useState } from "react";
import { Calendar, Type, Trash2, Plus } from "lucide-react";

import AppSettingsShell from "../shared/AppSettingsShell.jsx";
import AppPreviewFrame from "../shared/AppPreviewFrame.jsx";
import SettingsCard from "../shared/SettingsCard.jsx";
import Field from "../shared/Field.jsx";
import SegmentedControl from "../shared/SegmentedControl.jsx";
import ToggleSwitch from "../shared/ToggleSwitch.jsx";
import ComingSoonToggle from "../shared/ComingSoonToggle.jsx";
import BackgroundAudioField from "../shared/BackgroundAudioField.jsx";
import LocationSearchField from "../shared/LocationSearchField.jsx";
import StyledSelect from "../../components/StyledSelect.jsx";
import CancelButton from "../../components/CancelButton.jsx";
import { resolveAppUrlByName } from "../resolveAppUrl.js";
import { useAppSettingsForm } from "../shared/useAppSettingsForm.js";

// Matches the approved Clock Widget mock's own font list exactly.
const FONTS = [
  "Inter",
  "Alfa Slab One",
  "Assistant",
  "Assistant ExtraBold",
  "Yeseva One",
  "Black Ops One",
  "Playfair Display",
  "Cormorant Garamond",
  "Josefin Sans",
  "Nunito Sans",
  "Oswald",
  "Montserrat",
  "Lato",
  "Cinzel",
  "DM Serif Display",
  "Source Sans 3",
];

const DATE_FORMATS = ["Short", "Long", "Numeric"];
const MAX_TIMEZONES = 3;

// No audio Content support exists yet (see future-implementations.md) — so
// there's nothing real to list here. This stays "None" only until that's
// built; no fabricated filenames. Matches weather-modal.jsx's own list.
const AUDIO_OPTIONS = ["None"];

const INITIAL_FORM = {
  location: null,
  timezones: [],
  multiTimezone: false,
  clockStyle: "Digital",
  time: "12h",
  showSeconds: true,
  showDate: true,
  dateFormat: "Numeric",
  font: "Source Sans 3",
  audio: "None",
};

const CLOCK_APP_URL = resolveAppUrlByName("Clock");

// Last-resort fallback when geolocation isn't available/granted — matches
// Weather's own NY_FALLBACK.
const NY_FALLBACK = { name: "New York", lat: 40.7128, lon: -74.006 };

function ClockSettingsScreen({ open, onOpenChange, onSaved, existingContent }) {
  const {
    form,
    setForm,
    set,
    dirty,
    appName,
    setAppName,
    saving,
    saveError,
    handleSave,
    handleSaveAndClose,
  } = useAppSettingsForm({
    appType: "clock",
    initialForm: INITIAL_FORM,
    defaultAppName: "Clock",
    existingContent,
    onSaved,
    onOpenChange,
  });

  // Only used before the user picks a real city of their own — a one-time
  // read of the browser's geolocation (the person configuring this in DFM,
  // not the deployed screen) so the preview defaults to somewhere relevant
  // instead of always "New York". Same pattern as weather-modal.jsx.
  const [geoFallback, setGeoFallback] = useState(NY_FALLBACK);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoFallback({
          name: "Your location",
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      },
      () => {
        // Denied, timed out, or unsupported — NY_FALLBACK (already the
        // initial state) stays as-is.
      },
    );
  }, []);

  function handleMultiTimezoneToggle(checked) {
    setForm((prev) => ({
      ...prev,
      multiTimezone: checked,
      // Carries the already-picked single-mode city into City 1 instead of
      // starting that slot empty — the user already did the work of
      // picking it, switching modes shouldn't throw it away.
      timezones: checked && prev.timezones.length === 0 ? [prev.location] : prev.timezones,
    }));
  }

  function updateTimezone(index, location) {
    setForm((prev) => ({
      ...prev,
      timezones: prev.timezones.map((tz, i) => (i === index ? location : tz)),
    }));
  }

  function addTimezone() {
    setForm((prev) => ({ ...prev, timezones: [...prev.timezones, null] }));
  }

  function removeTimezone(index) {
    setForm((prev) => ({
      ...prev,
      timezones: prev.timezones.filter((_, i) => i !== index),
    }));
  }

  // What actually gets sent to the app over postMessage. Same geoFallback
  // used for preview-only purposes as the single-location case above — an
  // empty city slot shows the browser's own location instead of "No
  // location configured yet", so the preview isn't blank just because
  // nothing's been picked yet. The saved form data itself (form.timezones)
  // is untouched — only previewConfig substitutes the fallback.
  const previewConfig = {
    location: form.location ?? geoFallback,
    timezones: form.timezones.map((tz) => tz ?? geoFallback),
    multiTimezone: form.multiTimezone,
    clockStyle: form.clockStyle,
    time: form.time,
    showSeconds: form.showSeconds,
    showDate: form.showDate,
    dateFormat: form.dateFormat,
    font: form.font,
    audio: form.audio,
  };

  return (
    <AppSettingsShell
      open={open}
      onOpenChange={onOpenChange}
      appName={appName}
      onAppNameChange={setAppName}
      dirty={dirty}
      onSaveAndClose={handleSaveAndClose}
      onSaveOnly={handleSave}
      saving={saving}
      saveError={saveError}
      preview={(previewSize, fullPreview) => (
        <AppPreviewFrame
          size={previewSize}
          src={CLOCK_APP_URL}
          config={previewConfig}
          fullscreen={fullPreview}
        />
      )}
    >
      {(portalContainer) => (
        <>
          <SettingsCard kicker="Time zones">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col">
                <span className="text-text-primary text-sm font-medium">Multiple time zones</span>
                <span className="text-text-muted text-xs">Show up to 3 clocks side by side</span>
              </div>
              <ToggleSwitch checked={form.multiTimezone} onChange={handleMultiTimezoneToggle} />
            </div>

            {!form.multiTimezone && (
              <div className="flex flex-col gap-1.5">
                <div className="flex flex-col">
                  <span className="text-text-primary text-sm font-medium">City</span>
                  <span className="text-text-muted text-xs">Start typing to search for a location.</span>
                </div>
                <LocationSearchField
                  value={form.location}
                  onChange={(loc) => set("location", loc)}
                  showHint={false}
                />
              </div>
            )}

            {form.multiTimezone && (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-text-muted m-0">Start typing to search for a location.</p>
                {form.timezones.map((tz, i) => (
                  <div key={i} className="flex items-end gap-2">
                    <div className="flex-1">
                      <Field label={`City ${i + 1}`}>
                        <LocationSearchField
                          value={tz}
                          onChange={(loc) => updateTimezone(i, loc)}
                          showHint={false}
                        />
                      </Field>
                    </div>
                    <CancelButton
                      onClick={() => removeTimezone(i)}
                      title="Remove city"
                      icon={Trash2}
                      iconSize={14}
                    />
                  </div>
                ))}
                {form.timezones.length < MAX_TIMEZONES && (
                  <button
                    type="button"
                    onClick={addTimezone}
                    className="flex items-center justify-center gap-2 text-sm font-semibold text-text-primary bg-bg-primary border border-border-muted hover:border-border-hover hover:bg-bg-hover rounded-lg px-3 py-2 transition-colors"
                  >
                    <Plus size={14} />
                    Add city
                  </button>
                )}
              </div>
            )}
          </SettingsCard>

          <SettingsCard kicker="Display">
            <ComingSoonToggle />
            <Field label="Clock style">
              <SegmentedControl
                options={["Digital", "Analog"]}
                value={form.clockStyle}
                onChange={(v) => set("clockStyle", v)}
              />
            </Field>
            <Field label="Time format">
              <SegmentedControl
                options={["12h", "24h"]}
                value={form.time}
                onChange={(v) => set("time", v)}
              />
            </Field>
            {form.clockStyle === "Digital" && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-text-primary text-sm font-medium">Show seconds</span>
                <ToggleSwitch checked={form.showSeconds} onChange={(v) => set("showSeconds", v)} />
              </div>
            )}
          </SettingsCard>

          <SettingsCard kicker="Date">
            <div className="flex items-center justify-between gap-2">
              <span className="text-text-primary text-sm font-medium">Show date</span>
              <ToggleSwitch checked={form.showDate} onChange={(v) => set("showDate", v)} />
            </div>
            {form.showDate && (
              <Field label="Date format">
                <StyledSelect
                  value={form.dateFormat}
                  onChange={(v) => set("dateFormat", v)}
                  options={DATE_FORMATS.map((f) => ({ value: f, label: f }))}
                  icon={Calendar}
                  label="Date format"
                  portalContainer={portalContainer}
                  bgClassName="bg-bg-primary"
                  collapseOnMobile={false}
                />
              </Field>
            )}
          </SettingsCard>

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
              />
            </Field>
          </SettingsCard>

          <SettingsCard kicker="Background audio">
            <BackgroundAudioField
              options={AUDIO_OPTIONS}
              value={form.audio}
              onChange={(v) => {
                set("audio", v);
                setPlaying(false);
              }}
              playing={playing}
              onTogglePlay={() => setPlaying((p) => !p)}
              muted={muted}
              onToggleMute={() => setMuted((m) => !m)}
              portalContainer={portalContainer}
            />
          </SettingsCard>
        </>
      )}
    </AppSettingsShell>
  );
}

export default ClockSettingsScreen;

// Clock app's settings screen — built the same way as weather-modal.jsx,
// both sharing apps/shared/useAppSettingsForm.js for form state, the
// dirty-check, and the save flow.
//
// Used by: pages/Content.jsx (wired from AppsPickerModal's onSelectApp and
// ContentDetailsPanel's "Edit app settings" button, same as Weather).
