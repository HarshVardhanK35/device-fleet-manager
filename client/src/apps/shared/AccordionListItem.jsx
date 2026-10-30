import { ChevronDown, ChevronUp, GripVertical, Trash2 } from "lucide-react";

import CancelButton from "../../components/CancelButton.jsx";

// A single draggable, collapsible item in a repeatable list — e.g. Rotating
// Notices' boards, Event Cards' up-to-3 cards. Extracted out of
// RotatingNoticesSettings.jsx's own BoardCard so both templates (and any
// future one) share the exact same drag/expand/remove mechanics and visual
// treatment instead of re-implementing it per template.
//
// `dragProps` comes from useDragReorder.js's `dragPropsFor(index)`.
// `title`/`children` are the only per-item-type content — everything else
// (grip handle, remove button, expand chevron, drag visual states) is
// identical across every usage.
function AccordionListItem({ title, canRemove, onRemove, expanded, onToggle, dragProps, children }) {
  return (
    <div
      draggable={dragProps.draggable}
      onDragStart={dragProps.onDragStart}
      onDragOver={dragProps.onDragOver}
      onDrop={dragProps.onDrop}
      onDragEnd={dragProps.onDragEnd}
      className={`flex flex-col bg-bg-primary border border-border-muted rounded-lg overflow-hidden ${
        dragProps.isDragging ? "opacity-40" : ""
      } ${dragProps.isDragOver ? "ring-2 ring-accent-blue" : ""}`}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onToggle();
        }}
        className="flex items-center gap-2 p-2 text-left cursor-pointer"
      >
        <GripVertical size={14} className="text-text-muted flex-none cursor-grab" />
        <span className="flex-1 text-sm font-semibold text-text-primary">{title}</span>
        <div className="flex items-center flex-none">
          {canRemove && (
            <CancelButton
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              title="Remove"
              icon={Trash2}
            />
          )}
          <span className="w-6 h-6 rounded-md flex items-center justify-center text-text-muted hover:bg-bg-hover hover:text-text-primary transition-colors flex-none">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        </div>
      </div>

      {expanded && <div className="flex flex-col gap-3 px-3 pb-3">{children}</div>}
    </div>
  );
}

export default AccordionListItem;

// Used by: apps/appModals/announcements/rotating-notices/BoardsSection.jsx,
// and intended for Event Cards' own up-to-3-cards list once that template
// is integrated.
