import { ChevronDown, CloudUpload, LayoutGrid } from "lucide-react";

import ActionMenu from "./ActionMenu.jsx";

function UploadSplitButton({ onUploadClick, onAddAppClick }) {
  return (
    <div className="flex">
      <button
        onClick={onUploadClick}
        className="flex items-center gap-2 bg-[#1f6feb] border border-accent-blue hover:bg-[#1a5fd0] text-white font-semibold text-sm px-3 md:px-4 h-9 rounded-l-lg transition-colors"
      >
        <CloudUpload size={16} />
        <span className="hidden md:inline">UPLOAD</span>
      </button>
      <ActionMenu
        label="Upload options"
        align="end"
        trigger={
          <button className="flex items-center justify-center bg-[#1f6feb] border border-accent-blue border-l-0 hover:bg-[#1a5fd0] text-white px-2 h-9 rounded-r-lg transition-colors">
            <ChevronDown size={14} />
          </button>
        }
        items={[
          {
            label: "Image/Video",
            icon: CloudUpload,
            onClick: onUploadClick,
          },
          {
            label: "Add an App",
            icon: LayoutGrid,
            onClick: onAddAppClick,
          },
        ]}
      />
    </div>
  );
}

export default UploadSplitButton;

// Blue "UPLOAD" button (icon-only below `md`) + chevron dropdown (Image/
// Video, Add an App) — stays an icon+dropdown at every screen size per
// product decision (only the "UPLOAD" text collapses).
// Used by: pages/Content.jsx.
