import Button from "./Button.jsx";

// Dashed-border "nothing here yet" box — left-aligned title/description +
// a solid primary Button, matching the Playlists page's empty-playlist
// panel exactly (the look to standardize on app-wide, per Harsha).
function EmptyState({
  title,
  description,
  actionLabel,
  actionIcon,
  onAction,
  minHeight,
  className = "",
}) {
  return (
    <div
      style={minHeight ? { minHeight } : undefined}
      className={`border border-dashed border-border-muted rounded-xl flex flex-col items-start justify-center gap-3 px-8 py-10 ${className}`}
    >
      <h3 className="text-text-primary font-semibold text-base m-0">
        {title}
      </h3>
      <p className="text-text-muted text-sm max-w-md">{description}</p>
      {actionLabel && (
        <Button icon={actionIcon} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;

// Used by: pages/Playlists.jsx, pages/Assignments.jsx — meant to be reused
// by any future page/panel that needs a "nothing here yet" state instead of
// hand-rolling its own box.
