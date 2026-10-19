import { useEffect, useState } from "react";
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
import { resolveAppUrlByName } from "../resolveAppUrl.js";
import { createContent, updateContent } from "../../api/content.js";

// Matches the chosen mock's own font list exactly (variant B's decorative
// set), per his explicit call to pixel-match it rather than use the
// earlier-agreed standard ~10-font list.
const FONTS = [
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
];

const REFRESH_OPTIONS = ["5 min", "15 min", "30 min", "1 hour"];

// No audio Content support exists yet (see future-implementations.md) — so
// there's nothing real to list here. This stays "None" only until that's
// built; no fabricated filenames.
const AUDIO_OPTIONS = ["None"];

const INITIAL_FORM = {
  location: null,
  unit: "C",
  refresh: "15 min",
  range: "Today",
  time: "12h",
  font: "Assistant",
  audio: "None",
};

// Last-resort fallback when geolocation isn't available/granted — matches
// the app's own DEFAULT_CONFIG.location.
const NY_FALLBACK = { name: "New York", lat: 40.7128, lon: -74.006 };

// Apps have no duration field in this settings screen yet (unlike
// image/video, which have one) — backend requires durationInMillis for
// type "app" with no default, so this is a placeholder until a real
// duration control is built here.
const APP_DEFAULT_DURATION_MS = 60000;

// Resolves to Weather's dev/staging/prod URL depending on how this copy of
// DFM is running — see apps/resolveAppUrl.js. Computed once at module load
// since the environment doesn't change while the page is open.
const WEATHER_APP_URL = resolveAppUrlByName("Weather");

// `existingContent` (a Content document) means this screen is editing an
// already-saved Weather app tile, opened via its tile's pencil icon — form
// state starts from its configBlob instead of the defaults, and Save
// updates that same row from the first click. Undefined/null means a fresh
// app, opened via "Add an App".
function formFromContent(existingContent) {
  if (!existingContent) return INITIAL_FORM;
  const blob = existingContent.configBlob || {};
  return {
    location: blob.location ?? INITIAL_FORM.location,
    unit: blob.unit ?? INITIAL_FORM.unit,
    refresh: blob.refresh ?? INITIAL_FORM.refresh,
    range: blob.range ?? INITIAL_FORM.range,
    time: blob.time ?? INITIAL_FORM.time,
    font: blob.font ?? INITIAL_FORM.font,
    audio: blob.audio ?? INITIAL_FORM.audio,
  };
}

// `open`/`onOpenChange` are passed straight through to AppSettingsShell.
// Fresh form state on every open comes from OUTSIDE this file: Content.jsx
// gives this component a `key` that changes between open/closed/edit-target,
// so React fully remounts it (throwing away all its state) each time
// instead of this component having to reset itself.
function WeatherSettingsScreen({ open, onOpenChange, onSaved, existingContent }) {
  // `base` is the last-saved snapshot; comparing `form` against it is what
  // drives the Save button's enabled/disabled state (dirty-check pattern).
  const [base, setBase] = useState(() => formFromContent(existingContent));
  const [form, setForm] = useState(() => formFromContent(existingContent));
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [appName, setAppName] = useState(existingContent?.name ?? "Weather");
  // Set from the start when editing an existing row (so the very first
  // Save updates it) — otherwise set once the first Save succeeds, so a
  // later Save in the same session updates instead of creating a new one.
  const [contentId, setContentId] = useState(existingContent?._id ?? null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  // Only used before the user picks a real location of their own — a
  // one-time read of the browser's geolocation (the person configuring
  // this in DFM, not the deployed screen) so the preview defaults to
  // somewhere relevant instead of always "New York". Needs the browser's
  // permission prompt, so it only ever helps here (a human at a computer)
  // — never on a real unattended signage screen, which always uses the
  // explicitly saved location anyway.
  const [geoFallback, setGeoFallback] = useState(NY_FALLBACK);

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

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const dirty = Object.keys(INITIAL_FORM).some((k) => form[k] !== base[k]);

  // What actually gets sent to the app over postMessage — same shape as
  // its own config, falling back to a default location so the preview
  // still works before the user has searched/picked one of their own.
  const previewConfig = {
    location: form.location ?? geoFallback,
    unit: form.unit,
    range: form.range,
    time: form.time,
    font: form.font,
    refresh: form.refresh,
  };

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        name: appName,
        type: "app",
        durationInMillis: APP_DEFAULT_DURATION_MS,
        configBlob: { ...form, appType: "weather" },
      };

      const saved = contentId
        ? await updateContent(contentId, payload)
        : await createContent(payload);

      setContentId(saved._id);
      setBase(form);
      onSaved?.();
      return true;
    } catch {
      setSaveError("Couldn't save — check your connection and try again.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveAndClose() {
    const ok = await handleSave();
    if (ok) onOpenChange(false);
  }

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
      preview={(previewSize) => (
        <>
          <AppPreviewFrame size={previewSize} src={WEATHER_APP_URL} config={previewConfig} />
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
                options={["Today", "5-Day", "7-Day"]}
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
