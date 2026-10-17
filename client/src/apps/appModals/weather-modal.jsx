import { useState } from "react";
import { Clock, Type } from "lucide-react";

import AppSettingsShell from "../shared/AppSettingsShell.jsx";
import AppPreviewFrame from "../shared/AppPreviewFrame.jsx";
import SettingsCard from "../shared/SettingsCard.jsx";
import Field from "../shared/Field.jsx";
import SegmentedControl from "../shared/SegmentedControl.jsx";
import ToggleSwitch from "../shared/ToggleSwitch.jsx";
import BackgroundAudioField from "../shared/BackgroundAudioField.jsx";
import LocationSearchField from "../shared/LocationSearchField.jsx";
import StyledSelect from "../../components/StyledSelect.jsx";

// Matches the ~10-option font list already agreed for app settings — not
// the mock's own decorative set, which was a demo quirk tied to its layout
// variant, not a real design requirement.
const FONTS = [
  "Inter",
  "Roboto",
  "Poppins",
  "Lato",
  "Montserrat",
  "Open Sans",
  "Nunito",
  "Raleway",
  "Source Sans",
  "Work Sans",
];

const REFRESH_OPTIONS = ["5 min", "15 min", "30 min", "1 hour"];

// No audio Content support exists yet (see future-implementations.md) — so
// there's nothing real to list here. This stays "None" only until that's
// built; no fabricated filenames.
const AUDIO_OPTIONS = ["None"];

// A true constant (module-level, not recreated every render) — needed so
// the reset effect below can depend on it safely.
const INITIAL_FORM = {
  location: null,
  unit: "F",
  refresh: "15 min",
  range: "3-Day",
  time: "12h",
  font: "Inter",
  audio: "None",
};

// `open`/`onOpenChange` are passed straight through to AppSettingsShell.
// Fresh form state on every open comes from OUTSIDE this file: Content.jsx
// gives this component a `key` that changes between open/closed, so React
// fully remounts it (throwing away all its state) each time instead of
// this component having to reset itself.
function WeatherSettingsScreen({ open, onOpenChange }) {
  // `base` is the last-saved snapshot; comparing `form` against it is what
  // drives the Save button's enabled/disabled state (dirty-check pattern).
  const [base, setBase] = useState(INITIAL_FORM);
  const [form, setForm] = useState(INITIAL_FORM);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [appName, setAppName] = useState("Weather");

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const dirty = Object.keys(INITIAL_FORM).some((k) => form[k] !== base[k]);

  function handleSave() {
    setBase(form);
    console.log("Weather settings saved:", form);
    // TODO: wire to the real Content API once this screen is reached from
    // a saved Content row (POST/PATCH configBlob).
  }

  return (
    <AppSettingsShell
      open={open}
      onOpenChange={onOpenChange}
      appName={appName}
      onAppNameChange={setAppName}
      dirty={dirty}
      onSave={handleSave}
      preview={(previewSize) => (
        <>
          <AppPreviewFrame size={previewSize} />
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-blue shadow-[0_0_8px_var(--color-accent-blue)]" />
            Previewing {previewSize} · refreshes every {form.refresh}
          </div>
        </>
      )}
    >
      {(portalContainer) => (
        <>
          <SettingsCard kicker="Location & data">
            <Field label="Location">
              <LocationSearchField
                value={form.location}
                onChange={(loc) => set("location", loc)}
              />
            </Field>
            <Field label="Refresh interval">
              <StyledSelect
                value={form.refresh}
                onChange={(v) => set("refresh", v)}
                options={REFRESH_OPTIONS.map((r) => ({ value: r, label: r }))}
                icon={Clock}
                label="Refresh interval"
                portalContainer={portalContainer}
                bgClassName="bg-bg-primary"
                collapseOnMobile={false}
              />
            </Field>
            <Field label="Forecast range">
              <SegmentedControl
                options={["Today", "3-Day", "7-Day"]}
                value={form.range}
                onChange={(v) => set("range", v)}
              />
            </Field>
          </SettingsCard>

          <SettingsCard kicker="Display">
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted/70">Theme (iframe only)</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-bg-hover text-text-muted">
                Coming soon
              </span>
              <div className="flex-1" />
              <ToggleSwitch checked={false} onChange={() => {}} disabled />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Temperature">
                <SegmentedControl
                  options={["C", "F"]}
                  value={form.unit}
                  onChange={(v) => set("unit", v)}
                  labelFor={(o) => `°${o}`}
                />
              </Field>
              <Field label="Time format">
                <SegmentedControl
                  options={["12h", "24h"]}
                  value={form.time}
                  onChange={(v) => set("time", v)}
                />
              </Field>
            </div>
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

export default WeatherSettingsScreen;

// Weather app's settings screen — built almost entirely from the shared
// pieces in apps/shared/ (AppSettingsShell, AppPreviewFrame, SettingsCard,
// Field, SegmentedControl, ToggleSwitch, BackgroundAudioField). What's left
// here is just Weather's own: the field values (location/unit/refresh/
// etc.) and the dirty-check Save logic. The preview itself shows nothing
// but AppPreviewFrame's own loading spinner until the real Weather app is
// built and posts back APP_LOAD — no fabricated preview content. Clock/RSS/
// Announcements will each be their own file shaped like this one, reusing
// the same shared pieces.
// Used by: pages/Content.jsx (wired from AppsPickerModal's onSelectApp).
