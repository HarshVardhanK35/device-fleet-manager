import { FolderOpen, FilePlus2, LayoutGrid, ArrowRight } from "lucide-react";

function ContentEmptyState({ onUploadClick, onAddAppClick }) {
  return (
    <div className="flex flex-col items-center text-center pt-16">
      <div className="w-11 h-11 rounded-lg bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center mb-4">
        <FolderOpen size={20} className="text-accent-blue" />
      </div>
      <h2 className="text-text-primary font-bold text-lg mb-1">
        Nothing in your library yet
      </h2>
      <p className="text-text-muted text-sm max-w-sm mb-5">
        Content you add here becomes available to every playlist. Start with
        a file or a live app.
      </p>

      <div className="flex flex-col gap-2 w-full max-w-md">
        <button
          onClick={onUploadClick}
          className="group flex items-center gap-3 bg-bg-panel border border-border-muted hover:border-accent-blue rounded-lg px-4 py-3 text-left transition-colors"
        >
          <span className="w-9 h-9 rounded-md bg-accent-blue/15 flex items-center justify-center flex-shrink-0">
            <FilePlus2 size={18} className="text-accent-blue" />
          </span>
          <span className="flex-1">
            <span className="block text-text-primary font-semibold text-sm">
              Upload images or videos
            </span>
            <span className="block text-text-muted text-xs">
              JPG, PNG, MP4, WebM. Or drop files here
            </span>
          </span>
          <ArrowRight
            size={16}
            className="text-text-muted group-hover:text-text-primary transition-colors"
          />
        </button>

        <button
          onClick={onAddAppClick}
          className="group flex items-center gap-3 bg-bg-panel border border-border-muted hover:border-accent-green rounded-lg px-4 py-3 text-left transition-colors"
        >
          <span className="w-9 h-9 rounded-md bg-accent-green/15 flex items-center justify-center flex-shrink-0">
            <LayoutGrid size={18} className="text-accent-green" />
          </span>
          <span className="flex-1">
            <span className="block text-text-primary font-semibold text-sm">
              Add an App
            </span>
            <span className="block text-text-muted text-xs">
              Clocks, weather, transit and other live widgets
            </span>
          </span>
          <ArrowRight
            size={16}
            className="text-text-muted group-hover:text-text-primary transition-colors"
          />
        </button>
      </div>
    </div>
  );
}

export default ContentEmptyState;

// Empty-library state for the Content page: icon, heading, copy, and two
// action rows (Upload, Add an App). `onAddAppClick` is currently a no-op at
// the call site — no "Add an App" route exists yet.
// Used by: pages/Content.jsx.
