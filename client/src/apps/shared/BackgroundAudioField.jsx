import { Music2, Pause, Play, Volume2, VolumeX } from "lucide-react";

import StyledSelect from "../../components/StyledSelect.jsx";

// A dropdown to pick a background-audio file + inline Play/Pause and Mute
// buttons. The parent screen owns all the actual state (which file,
// playing, muted) — this component is just the UI for it, so it can be
// reused by any app that supports background audio, not just Weather.
function BackgroundAudioField({
  options,
  value,
  onChange,
  playing,
  onTogglePlay,
  muted,
  onToggleMute,
  portalContainer,
}) {
  const noAudio = value === "None";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <div className="flex-1 min-w-0">
          <StyledSelect
            value={value}
            onChange={onChange}
            options={options.map((a) => ({ value: a, label: a }))}
            icon={Music2}
            label="Background audio"
            portalContainer={portalContainer}
            bgClassName="bg-bg-primary"
            collapseOnMobile={false}
          />
        </div>
        <button
          type="button"
          aria-label={playing ? "Pause" : "Play"}
          disabled={noAudio}
          onClick={onTogglePlay}
          className={`w-9 h-9 flex-none flex items-center justify-center rounded-lg border border-border-muted transition-colors ${
            playing ? "text-accent-blue" : "text-text-muted hover:bg-bg-hover"
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {playing ? <Pause size={15} /> : <Play size={15} />}
        </button>
        <button
          type="button"
          aria-label="Mute"
          disabled={noAudio}
          onClick={onToggleMute}
          className={`w-9 h-9 flex-none flex items-center justify-center rounded-lg border border-border-muted transition-colors ${
            muted ? "text-accent-blue" : "text-text-muted hover:bg-bg-hover"
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
      </div>
      <span className="text-xs text-text-muted">
        {noAudio
          ? "No background audio"
          : playing
            ? muted
              ? "Playing · muted"
              : "Playing in preview"
            : "From content library"}
      </span>
    </div>
  );
}

export default BackgroundAudioField;
