import { useState } from "react";

import SettingsCard from "../../../shared/SettingsCard.jsx";
import BackgroundAudioField from "../../../shared/BackgroundAudioField.jsx";
import { AUDIO_OPTIONS } from "./audioOptions.js";

// The "Background audio" settings card. Owns its own play / mute state;
// `open` / `onOpenChange` coordinate its dropdown with the panel's others.
function AudioCard({ value, onChange, portalContainer, open, onOpenChange }) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  return (
    <SettingsCard kicker="Background audio">
      <BackgroundAudioField
        options={AUDIO_OPTIONS}
        value={value}
        onChange={(v) => {
          onChange(v);
          setPlaying(false);
        }}
        playing={playing}
        onTogglePlay={() => setPlaying((p) => !p)}
        muted={muted}
        onToggleMute={() => setMuted((m) => !m)}
        portalContainer={portalContainer}
        open={open}
        onOpenChange={onOpenChange}
      />
    </SettingsCard>
  );
}

export default AudioCard;

// Used by: RotatingNoticesSettings.jsx, StatusListSettings.jsx.
