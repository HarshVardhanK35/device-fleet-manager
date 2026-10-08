import Button from "./Button.jsx";
import MobileBackButton from "./MobileBackButton.jsx";
import MobileActionBar from "./MobileActionBar.jsx";

// Shared "entity detail" shell for a right-hand pane (Playlists, Assignments
// — meant for future panes too): back row (mobile only), title + badge +
// meta line, one primary action (inline in the header at md+, moved to a
// sticky bottom bar below md), and an optional section label/meta divider
// row. The actual body (grid+toolbar, timeline list, whatever) is just
// `children` — this component owns layout, not content.
function DetailPane({
  backLabel,
  onBack,
  title,
  badge,
  meta,
  actionLabel,
  actionIcon,
  onAction,
  actionDisabled,
  sectionLabel,
  sectionMeta,
  className = "",
  bodyClassName = "",
  headerClassName = "",
  children,
}) {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {onBack && (
        <MobileBackButton onClick={onBack} className="self-start">
          {backLabel}
        </MobileBackButton>
      )}

      <div className={headerClassName}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-text-primary text-lg font-bold m-0">
                {title}
              </h2>
              {badge}
            </div>
            {meta && <p className="text-text-muted text-sm m-0">{meta}</p>}
          </div>

          {actionLabel && (
            <div className="hidden md:block flex-shrink-0">
              <Button icon={actionIcon} onClick={onAction} disabled={actionDisabled}>
                {actionLabel}
              </Button>
            </div>
          )}
        </div>

        {(sectionLabel || sectionMeta) && (
          <div className="flex items-baseline justify-between gap-3 flex-wrap mt-4 pb-3 border-b border-border-muted">
            {sectionLabel && (
              <h3 className="text-text-muted text-xs font-semibold uppercase tracking-wide m-0">
                {sectionLabel}
              </h3>
            )}
            {sectionMeta && (
              <span className="text-text-muted text-xs">{sectionMeta}</span>
            )}
          </div>
        )}
      </div>

      <div
        className={`${actionLabel ? "pb-20 md:pb-0" : ""} ${bodyClassName}`}
      >
        {children}
      </div>

      {actionLabel && (
        <MobileActionBar>
          <Button
            icon={actionIcon}
            onClick={onAction}
            disabled={actionDisabled}
            className="w-full"
          >
            {actionLabel}
          </Button>
        </MobileActionBar>
      )}
    </div>
  );
}

export default DetailPane;

// Used by: pages/Playlists.jsx, pages/Assignments.jsx. Both panes drop
// their old bordered-card wrapper here — per the Claude Design review, the
// card-wrapped-vs-not split between them was an inconsistency, not a
// deliberate choice, so both now sit unframed on the page background.
// `headerClassName` (optional) extends the wrapper around BOTH the title/
// action row and the section-label/meta row — Playlists passes `pr-4`
// there to match its grid's own scrollbar-gutter inset, so the "Add from
// library" button and the "N items" text both line up with the tiles below
// instead of running past their right edge.
