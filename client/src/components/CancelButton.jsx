import { X } from "lucide-react";

function CancelButton({
  as: As = "button",
  title = "Cancel",
  size = 18,
  iconSize,
  className = "",
  ...props
}) {
  return (
    <As
      type={As === "button" ? "button" : undefined}
      title={title}
      aria-label={title}
      className={`flex-shrink-0 rounded-lg flex items-center justify-center text-text-muted hover:text-accent-red hover:bg-accent-red/10 border border-transparent hover:border-accent-red/40 transition-colors ${
        size === "sm" ? "w-6 h-6" : size === "lg" ? "w-10 h-10" : "w-9 h-9"
      } ${className}`}
      {...props}
    >
      <X size={iconSize ?? (size === "sm" ? 14 : size === "lg" ? 20 : 18)} />
    </As>
  );
}

export default CancelButton;

// Shared "cancel/close" icon button — red hover highlight + tooltip, matching
// the UploadProgressModal's original cancel-upload button. `as` lets it
// render as a Radix `Dialog.Close` (for modals, where clicking must trigger
// Radix's own close behavior) or a plain `button` (default, pass `onClick`).
// `size="sm"` (24px/14px icon) is for tight inline contexts (e.g. inside a
// text input); default is 36px/18px icon.
// Used by: ConfirmDeleteModal.jsx, ContentPickerModal.jsx, Playlists.jsx,
// ContentDetailsPanel.jsx, pages/Content.jsx, UploadProgressModal.jsx.
