import { ChevronDown, CloudUpload, LayoutGrid, Plus } from "lucide-react";

import ActionMenu from "./ActionMenu.jsx";
import MobileActionBar from "./MobileActionBar.jsx";

function UploadSplitButton({ onUploadClick, onAddAppClick }) {
  const items = [
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
  ];

  return (
    <>
      <div className="hidden md:flex">
        <button
          onClick={onUploadClick}
          className="flex items-center gap-2 bg-[#1f6feb] border border-accent-blue hover:bg-[#1a5fd0] text-white font-semibold text-sm px-4 h-9 rounded-l-lg transition-colors"
        >
          <CloudUpload size={16} />
          <span>UPLOAD</span>
        </button>
        <ActionMenu
          label="Upload options"
          align="end"
          items={items}
          trigger={
            <button className="flex items-center justify-center bg-[#1f6feb] border border-accent-blue border-l-0 hover:bg-[#1a5fd0] text-white px-2 h-9 rounded-r-lg transition-colors">
              <ChevronDown size={14} />
            </button>
          }
        />
      </div>

      <MobileActionBar>
        <ActionMenu
          label="Upload options"
          align="center"
          items={items}
          trigger={
            <button className="w-full flex items-center justify-center gap-2 bg-[#1f6feb] border border-accent-blue hover:bg-[#1a5fd0] text-white font-semibold text-sm h-11 rounded-lg transition-colors">
              <Plus size={18} />
              Upload
            </button>
          }
        />
      </MobileActionBar>
    </>
  );
}

export default UploadSplitButton;

// Desktop/tablet (md+): blue "UPLOAD" button + chevron dropdown (Image/
// Video, Add an App), unchanged. Below md: that split button hides
// entirely and a full-width "Upload" trigger appears in a sticky
// MobileActionBar instead — tapping it opens the same two-option menu,
// matching the Detail Pane mock's mobile sticky-action-bar pattern.
// Used by: pages/Content.jsx.
