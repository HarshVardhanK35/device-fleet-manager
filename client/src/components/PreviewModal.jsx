import * as Dialog from "@radix-ui/react-dialog";
import { Eye } from "lucide-react";
import CancelButton from "./CancelButton.jsx";

function PreviewModal({ open, onOpenChange, icon: Icon = Eye, title, subtitle, media, meta = [] }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-panel border border-border-muted rounded-xl max-w-[calc(100vw-32px)] max-h-[85vh] overflow-auto z-40 w-[520px]">
          <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-border-muted">
            <Icon size={16} className="text-text-muted flex-none" />
            <div className="flex-1 min-w-0">
              <div className="text-text-primary text-sm font-semibold">{title}</div>
              {subtitle && <div className="text-text-muted text-xs">{subtitle}</div>}
            </div>
            <CancelButton as={Dialog.Close} />
          </div>
          <div className="p-4 flex flex-col gap-3">
            <div className="aspect-video rounded-lg overflow-hidden border border-border-muted">
              {media}
            </div>
            {meta.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-text-muted">
                {meta.map((item, i) => (
                  <span key={i}>{item}</span>
                ))}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default PreviewModal;

// Shared read-only preview — one media frame (whatever is currently/actively
// shown) with a title/subtitle header and a meta row underneath. Not a
// carousel: each caller passes exactly the single frame it wants shown, via
// `media` (any node — ScreenThumb today, an <img>/<video> for content-library
// items later) and `meta` (array of short strings/nodes for the footer row).
// Used by: pages/PlayerSlots.jsx (device preview). Future: an eye icon on
// each image/video content item and on each playlist, opening this same
// modal to preview that single item/playlist without affecting live devices.
