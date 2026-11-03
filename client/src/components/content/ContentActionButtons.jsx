import { CloudUpload, LayoutGrid } from "lucide-react";

import MobileActionBar from "../layout/MobileActionBar.jsx";

const PRIMARY =
  "flex items-center justify-center gap-2 bg-[#1f6feb] border border-accent-blue hover:bg-[#1a5fd0] text-white font-semibold text-sm rounded-lg transition-colors";
const SECONDARY =
  "flex items-center justify-center gap-2 bg-accent-green/10 border border-accent-green/50 hover:bg-accent-green/20 hover:border-accent-green text-accent-green font-semibold text-sm rounded-lg transition-colors";

function ContentActionButtons({ onUploadClick, onCreateAppClick }) {
  return (
    <>
      <div className="hidden md:flex items-center gap-2">
        <button onClick={onUploadClick} className={`${PRIMARY} px-4 h-9`}>
          <CloudUpload size={16} />
          <span>Upload</span>
        </button>
        <button onClick={onCreateAppClick} className={`${SECONDARY} px-4 h-9`}>
          <LayoutGrid size={16} />
          <span>Create</span>
        </button>
      </div>

      <MobileActionBar>
        <div className="flex gap-2">
          <button onClick={onUploadClick} className={`${PRIMARY} flex-1 h-11`}>
            <CloudUpload size={18} />
            Upload
          </button>
          <button onClick={onCreateAppClick} className={`${SECONDARY} flex-1 h-11`}>
            <LayoutGrid size={18} />
            Create an app
          </button>
        </div>
      </MobileActionBar>
    </>
  );
}

export default ContentActionButtons;

// Two side-by-side actions — blue "Upload" (image/video) and green "Create"
// (apps — the same green as the APP badge on every app tile)
// "Create an app" (opens the apps picker) — so apps are visible without
// opening a dropdown. md+: inline in the toolbar. Below md: both sit in a
// sticky MobileActionBar, split evenly.
// Used by: pages/Content.jsx.
