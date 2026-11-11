import Button from "../ui/Button.jsx";
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
  titleExtra,
  refresh,
  headerDivider = false,
  actionInToolbar = false,
  meta,
  metaClassName = "",
  actionLabel,
  actionIcon,
  onAction,
  actionDisabled,
  headerExtra,
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
        <div className="flex items-center justify-between gap-3">
          <MobileBackButton onClick={onBack} className="self-start">
            {backLabel}
          </MobileBackButton>
          {refresh && <div className="md:hidden">{refresh}</div>}
        </div>
      )}

      <div className={headerClassName}>
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1 md:flex-none flex flex-col gap-1.5">
            <div className="flex items-center gap-x-2.5 gap-y-1 flex-wrap">
              <h2 className="min-w-0 [overflow-wrap:anywhere] text-text-primary text-sm md:text-lg font-bold m-0">
                {title}
              </h2>
              {badge}
              {titleExtra}
            </div>
            {meta && <p className={`text-text-muted text-sm m-0 ${metaClassName}`}>{meta}</p>}
          </div>

          {/* One right-hand group (never three siblings, or justify-between would
              push the action button into the middle). h-7 = the title's own line
              height, so the buttons centre on the title row. */}
          {((actionLabel && !actionInToolbar) || refresh || headerExtra) && (
            // the 16px gap to the title only when something in the group shows (on a phone the group is
            // often all hidden, and a gap there kept the Save button off the right edge)
            <div className="flex-shrink-0 self-start h-7 flex items-center gap-2 md:ml-4 has-[>:not(.hidden)]:ml-4">
              {actionLabel && !actionInToolbar && (
                <div className="hidden md:block">
                  <Button icon={actionIcon} onClick={onAction} disabled={actionDisabled}>
                    {actionLabel}
                  </Button>
                </div>
              )}
              {refresh && <div className="hidden md:block">{refresh}</div>}
              {headerExtra}
            </div>
          )}
        </div>

        {headerDivider && !sectionLabel && !sectionMeta && (
          <div className="mt-3 md:mt-4 border-b border-border-muted" />
        )}

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

// Used by: pages/Playlists.jsx, pages/Assignments.jsx, pages/PlayerSlots.jsx.
// All three panes drop the old bordered-card wrapper here — per the Claude
// Design review, the card-wrapped-vs-not split between them was an
// inconsistency, not a deliberate choice, so all now sit unframed on the
// page background.
// `refresh` (optional, a node — e.g. <RefreshButton/>): shown at the right end
// of the back-button row on mobile, and at the right end of the header from
// md up.
// `titleExtra` (optional) renders on the title row itself, after the badge —
// right-aligned on mobile, left (beside the title/badge) from md up, so the
// action Button stays at the right end. Playlists puts its item count there.
// `actionInToolbar` (optional) drops the header Button from md up because the
// page renders the same action inside its toolbar row; the mobile bottom bar
// still shows it.
// `headerDivider` (optional) draws the separating line under the header when
// there is no section-label row to draw it.
// `headerClassName` (optional) extends the wrapper around BOTH the title/
// action row and the section-label/meta row — Playlists passes `pr-4`
// there to match its grid's own scrollbar-gutter inset, so the "Add from
// library" button and the "N items" text both line up with the tiles below
// instead of running past their right edge.
// `headerExtra` (optional) renders instead of/alongside the actionLabel
// Button, for panes that need something other than a single primary action
// in the header — e.g. PlayerSlots' "Cancel" button while a screen is
// awaiting pairing, or its "⋯" ActionMenu once a screen is paired. Unlike
// `actionLabel`, it never moves into the mobile sticky bar — it's assumed
// to already work fine inline at every width (a small button, a dropdown
// trigger), not a full-width primary action.
