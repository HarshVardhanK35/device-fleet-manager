import { formatDuration } from "../utils/formatDuration.js";

function PickerSelectionStatus({
  nameRequired,
  hasName,
  selectedCount,
  selectedDurationMs,
  onClear,
  alertKey = 0,
}) {
  const missingName = nameRequired && !hasName;
  const missingContent = selectedCount === 0;

  if (missingName || missingContent) {
    const message =
      missingName && missingContent
        ? "Add a name and pick at least 1 item to continue"
        : missingName
          ? "Add a name to continue"
          : "Pick at least 1 item to continue";

    return (
      <span
        key={alertKey}
        className={`text-sm ${
          alertKey > 0 ? "text-accent-red shake font-semibold" : "text-text-muted"
        }`}
      >
        {message}
      </span>
    );
  }

  return (
    <span className="text-text-muted text-sm">
      {selectedCount} item{selectedCount === 1 ? "" : "s"} selected ·{" "}
      {formatDuration(selectedDurationMs)}{" "}
      <button
        type="button"
        onClick={onClear}
        className="text-accent-blue hover:underline font-semibold"
      >
        Clear
      </button>
    </span>
  );
}

export default PickerSelectionStatus;

// Footer status text for the content-picker modals: while the submit
// conditions aren't met (missing name and/or no content picked), shows a
// plain-language reason why instead of relying on a hover tooltip
// (tooltips don't work on touch, which matters since this app is
// responsive) — once met, shows the normal "N items selected · duration ·
// Clear" summary. `alertKey`: the submit button stays clickable even
// while blocked (native `disabled` swallows the click entirely, so there'd
// be nothing to react to); bump this number each time the user clicks
// while still blocked, and the message flashes red + shakes to grab
// attention — a changed `key` forces React to remount the span so the CSS
// animation replays even on repeated clicks.
// Used by: components/ContentPickerModal.jsx (Create Playlist + Add
// Content — same component, shared via props).
