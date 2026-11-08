import { Music2, Pause, Play, Volume2, VolumeX } from "lucide-react";

import StyledSelect from "../../../components/ui/StyledSelect.jsx";

// Background audio is switched off for now (the app is being wrapped up): the
// whole field is shown but disabled, with a "Coming soon" note. Set this to
// false to bring the working field back; nothing else needs to change.
const COMING_SOON = true;

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
  // Optional — pass these when a sibling dropdown elsewhere in the same
  // settings panel needs this one to close when it opens (and vice versa).
  // Omit both to stay uncontrolled, same as every other StyledSelect usage.
  open,
  onOpenChange,
}) {
  const noAudio = value === "None";
  const off = COMING_SOON;

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
            disabled={off}
            portalContainer={portalContainer}
            bgClassName="bg-bg-primary"
            collapseOnMobile={false}
            open={open}
            onOpenChange={onOpenChange}
          />
        </div>
        <button
          type="button"
          aria-label={playing ? "Pause" : "Play"}
          disabled={off || noAudio}
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
          disabled={off || noAudio}
          onClick={onToggleMute}
          className={`w-9 h-9 flex-none flex items-center justify-center rounded-lg border border-border-muted transition-colors ${
            muted ? "text-accent-blue" : "text-text-muted hover:bg-bg-hover"
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
      </div>
      {off ? (
        <span className="flex items-center gap-2 text-xs text-text-muted">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-bg-hover text-text-muted">
            Coming soon
          </span>
          Background audio is not available yet.
        </span>
      ) : (
      <span className="text-xs text-text-muted">
        {noAudio
          ? "No background audio"
          : playing
            ? muted
              ? "Playing · muted"
              : "Playing in preview"
            : "From content library"}
      </span>
      )}
    </div>
  );
}

export default BackgroundAudioField;
