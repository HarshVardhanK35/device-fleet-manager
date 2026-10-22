import { useState } from "react";
import { Type, Clock, Image as ImageIcon } from "lucide-react";

import AppSettingsShell from "../shared/AppSettingsShell.jsx";
import AppPreviewFrame from "../shared/AppPreviewFrame.jsx";
import SettingsCard from "../shared/SettingsCard.jsx";
import Field from "../shared/Field.jsx";
import SegmentedControl from "../shared/SegmentedControl.jsx";
import ToggleSwitch from "../shared/ToggleSwitch.jsx";
import SliderField from "../shared/SliderField.jsx";
import BackgroundAudioField from "../shared/BackgroundAudioField.jsx";
import StyledSelect from "../../components/StyledSelect.jsx";
import ContentPickerModal from "../../components/ContentPickerModal.jsx";
import { resolveAppUrlByName } from "../resolveAppUrl.js";
import { useAppSettingsForm } from "../shared/useAppSettingsForm.js";

// Matches the approved Media RSS mock's own font list exactly.
const FONTS = [
  "Inter",
  "Assistant",
  "Assistant ExtraBold",
  "Source Sans 3",
  "IBM Plex Sans",
  "Libre Franklin",
  "Nunito Sans",
  "Lato",
  "Montserrat",
  "Josefin Sans",
  "Oswald",
  "Barlow Condensed",
  "Source Serif 4",
  "Merriweather",
  "Playfair Display",
  "DM Serif Display",
];

// No audio Content support exists yet (see future-implementations.md) — so
// there's nothing real to list here. This stays "None" only until that's
// built; no fabricated filenames. Matches weather-modal.jsx's own list.
const AUDIO_OPTIONS = ["None"];

const REFRESH_OPTIONS = ["5 min", "15 min", "30 min", "1 hour"];

const INITIAL_FORM = {
  layout: "ticker",
  imageFit: "crop",
  feedUrl: "",
  refresh: "15 min",
  itemCount: 5,
  font: "Inter",
  speed: "medium",
  accentFrom: "#ff4d1c",
  accentTo: "#ffffff",
  audio: "None",
  brandLogo: {
    enabled: false,
    contentId: null,
    url: "",
    position: "top-left", // "top-left" | "top-right"
    size: 9,
    opacity: 60,
  },
};

const RSS_APP_URL = resolveAppUrlByName("RSS");

function RssSettingsScreen({ open, onOpenChange, onSaved, existingContent, library = [] }) {
  const {
    form,
    set,
    dirty,
    appName,
    setAppName,
    saving,
    saveError,
    handleSave,
    handleSaveAndClose,
  } = useAppSettingsForm({
    appType: "rss",
    initialForm: INITIAL_FORM,
    defaultAppName: "Media RSS",
    existingContent,
    onSaved,
    onOpenChange,
  });

  const [feedUrlError, setFeedUrlError] = useState(null);
  const [logoPickerOpen, setLogoPickerOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  // Only images from the library can be picked as a brand logo — same
  // ContentPickerModal used for playlists, just handed a pre-filtered list
  // so its own grid never shows video/app tiles to choose from here.
  const imageLibrary = library.filter((c) => c.type === "image");

  function setBrandLogo(key, value) {
    set("brandLogo", { ...form.brandLogo, [key]: value });
  }

  function validateFeedUrl() {
    if (!form.feedUrl) {
      setFeedUrlError("Enter a feed URL first.");
      return;
    }
    try {
      new URL(form.feedUrl);
      setFeedUrlError(null);
    } catch {
      setFeedUrlError("That doesn't look like a valid URL.");
    }
  }

  const previewConfig = {
    layout: form.layout,
    imageFit: form.imageFit,
    feedUrl: form.feedUrl,
    refresh: form.refresh,
    itemCount: form.itemCount,
    font: form.font,
    speed: form.speed,
    accentFrom: form.accentFrom,
    accentTo: form.accentTo,
    audio: form.audio,
    brandLogo: form.brandLogo,
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
      preview={(previewSize) => (
        <AppPreviewFrame size={previewSize} src={RSS_APP_URL} config={previewConfig} />
      )}
    >
      {(portalContainer) => (
        <>
          <SettingsCard kicker="Feed">
            <Field label="Feed URL">
              <div className="flex gap-1.5">
                <input
                  type="url"
                  value={form.feedUrl}
                  onChange={(e) => {
                    set("feedUrl", e.target.value);
                    setFeedUrlError(null);
                  }}
                  placeholder="https://feeds.example.com/rss"
                  className={`flex-1 min-w-0 h-9 px-3 bg-bg-primary border rounded-lg text-text-primary text-sm outline-none transition-colors focus-visible:border-accent-blue ${
                    feedUrlError ? "border-accent-red" : "border-border-muted"
                  }`}
                />
                <button
                  type="button"
                  onClick={validateFeedUrl}
                  className="px-3 h-9 rounded-lg border border-border-muted text-sm font-medium text-text-primary hover:bg-bg-hover transition-colors"
                >
                  Load
                </button>
              </div>
              {feedUrlError && <span className="text-xs text-accent-red">{feedUrlError}</span>}
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
            <SliderField
              label="Items per rotation"
              value={form.itemCount}
              onChange={(v) => set("itemCount", v)}
              min={3}
              max={15}
            />
          </SettingsCard>

          <SettingsCard kicker="Layout">
            <Field label="Layout">
              <SegmentedControl
                options={["ticker", "split"]}
                value={form.layout}
                onChange={(v) => set("layout", v)}
                labelFor={(o) => (o === "ticker" ? "Ticker" : "Split")}
              />
            </Field>
            <Field label="Image fit">
              <SegmentedControl
                options={["blurred", "bars", "crop"]}
                value={form.imageFit}
                onChange={(v) => set("imageFit", v)}
                labelFor={(o) => (o === "blurred" ? "Blurred" : o === "bars" ? "Bars" : "Crop")}
              />
            </Field>
          </SettingsCard>

          <SettingsCard kicker="Display">
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
            <Field label="Scroll speed">
              <SegmentedControl
                options={["slow", "medium", "fast"]}
                value={form.speed}
                onChange={(v) => set("speed", v)}
                labelFor={(o) => o[0].toUpperCase() + o.slice(1)}
              />
            </Field>
            <Field label="Accent colors">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.accentFrom}
                  onChange={(e) => set("accentFrom", e.target.value)}
                  className="w-9 h-9 rounded-lg border border-border-muted bg-bg-primary cursor-pointer"
                />
                <input
                  type="color"
                  value={form.accentTo}
                  onChange={(e) => set("accentTo", e.target.value)}
                  className="w-9 h-9 rounded-lg border border-border-muted bg-bg-primary cursor-pointer"
                />
                <div
                  className="flex-1 h-9 rounded-lg"
                  style={{
                    background: `linear-gradient(90deg, ${form.accentFrom}, ${form.accentTo})`,
                  }}
                />
              </div>
            </Field>
          </SettingsCard>

          <SettingsCard kicker="Brand logo">
            <div className="flex items-center justify-between gap-2">
              <span className="text-text-primary text-sm font-medium">Show brand logo</span>
              <ToggleSwitch
                checked={form.brandLogo.enabled}
                onChange={(v) => setBrandLogo("enabled", v)}
              />
            </div>

            {form.brandLogo.enabled && (
              <>
                <Field label="Logo image">
                  <button
                    type="button"
                    onClick={() => setLogoPickerOpen(true)}
                    className="flex items-center gap-2 px-3 h-9 rounded-lg border border-border-muted bg-bg-primary text-sm text-text-primary hover:bg-bg-hover transition-colors"
                  >
                    <ImageIcon size={14} />
                    {form.brandLogo.contentId ? "Change image" : "Choose from library"}
                  </button>
                </Field>

                <Field label="Position">
                  <SegmentedControl
                    options={["top-left", "top-right"]}
                    value={form.brandLogo.position}
                    onChange={(v) => setBrandLogo("position", v)}
                    labelFor={(o) => (o === "top-left" ? "Top left" : "Top right")}
                  />
                </Field>

                <SliderField
                  label="Size"
                  value={form.brandLogo.size}
                  onChange={(v) => setBrandLogo("size", v)}
                  min={4}
                  max={20}
                />
                <SliderField
                  label="Opacity"
                  value={form.brandLogo.opacity}
                  onChange={(v) => setBrandLogo("opacity", v)}
                  min={10}
                  max={100}
                  suffix="%"
                />
              </>
            )}
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

          <ContentPickerModal
            open={logoPickerOpen}
            onOpenChange={setLogoPickerOpen}
            content={imageLibrary}
            title="Choose a logo"
            subtitle="Pick an image from your content library"
            submitLabel="Use this image"
            showNameField={false}
            showTypeFilter={false}
            onSubmit={(_name, _description, selectedIds) => {
              const picked = imageLibrary.find((c) => c._id === selectedIds[0]);
              if (picked) {
                setBrandLogo("contentId", picked._id);
                setBrandLogo("url", picked.mediaUrl);
              }
              setLogoPickerOpen(false);
            }}
          />
        </>
      )}
    </AppSettingsShell>
  );
}

export default RssSettingsScreen;

// Media RSS app's settings screen — built the same way as weather-modal.jsx
// and clock-modal.jsx, sharing apps/shared/useAppSettingsForm.js for form
// state, the dirty-check, and the save flow.
//
// Feed URL is the FIRST card (unlike Weather/Clock, where the
// location-dependent field leads) — nothing in this app renders without a
// feed, same reasoning, just a different field.
//
// Brand logo only supports picking an existing image from the content
// library (via the shared ContentPickerModal, pre-filtered to images) —
// NOT a raw file upload or an arbitrary image URL. A direct-upload/URL
// option was in the first draft and was deliberately removed; logged in
// future-implementations.md as a possible later addition.
//
// Accent colors: two plain color pickers + a live gradient preview of the
// pair. No preset quick-pick swatches — removed after initial feedback
// that a row of default gradients wasn't wanted.
//
// `library` (the full Content list) is passed in from pages/Content.jsx —
// this screen filters it down to images itself rather than the caller
// doing it, so the filtering logic lives next to the one place that needs
// it.
//
// Used by: pages/Content.jsx (wired from AppsPickerModal's onSelectApp and
// ContentDetailsPanel's "Edit app settings" button, same as Weather/Clock).
