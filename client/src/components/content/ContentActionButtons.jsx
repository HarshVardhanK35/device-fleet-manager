import { useEffect, useState } from "react";
import { CloudUpload, LayoutGrid, Plus } from "lucide-react";

const PRIMARY =
  "flex items-center justify-center gap-2 bg-[#1f6feb] border border-accent-blue hover:bg-[#1a5fd0] text-white font-semibold text-sm rounded-lg transition-colors";
const SECONDARY =
  "flex items-center justify-center gap-2 bg-accent-green/10 border border-accent-green/50 hover:bg-accent-green/20 hover:border-accent-green text-accent-green font-semibold text-sm rounded-lg transition-colors";

// Phones: one round + button above the tab bar. Tapped, it turns into a ×, the page behind it
// blurs and the two actions rise out of it as labelled pills (a speed dial). Not a dropdown.
function AddButton({ onUploadClick, onCreateAppClick }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const choose = (action) => () => {
    setOpen(false);
    action();
  };

  // The lower option rises first, the upper one a moment later.
  const options = [
    { label: "Create an app", Icon: LayoutGrid, onClick: choose(onCreateAppClick), tone: "bg-accent-green text-bg-primary", delay: 60 },
    { label: "Upload", Icon: CloudUpload, onClick: choose(onUploadClick), tone: "bg-[#1f6feb] text-white", delay: 0 },
  ];

  return (
    <div className="md:hidden">
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-[24] bg-black/55 backdrop-blur-sm transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* The wrapper itself never catches a tap or a scroll (it is much bigger than the + while the
          options are hidden); only the + and the open options do. */}
      {/* z-[24] / z-[25]: above the page and its sticky bars (z-20), below every dialog and the details
          modal (scrim z-30), so a modal dims the + button too */}
      <div className="pointer-events-none fixed right-4 z-[25] flex flex-col items-end gap-3 bottom-[calc(3.5rem+env(safe-area-inset-bottom)+1rem)]">
        {options.map(({ label, Icon, onClick, tone, delay }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            tabIndex={open ? 0 : -1}
            style={{ transitionDelay: open ? `${delay}ms` : "0ms" }}
            className={`flex items-center gap-3 transition-all duration-200 ${
              open ? "pointer-events-auto translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-3 scale-90 opacity-0"
            }`}
          >
            <span className="rounded-full border border-border-muted bg-bg-panel px-3.5 py-1.5 text-sm font-semibold text-text-primary shadow-lg shadow-black/40">
              {label}
            </span>
            <span className={`flex h-12 w-12 items-center justify-center rounded-full shadow-lg shadow-black/40 ${tone}`}>
              <Icon size={20} />
            </span>
          </button>
        ))}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close" : "Add media"}
          aria-expanded={open}
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#1f6feb] text-white shadow-xl shadow-black/50 transition-colors active:bg-[#1a5fd0]"
        >
          <Plus size={24} className={`transition-transform duration-200 ${open ? "rotate-45" : ""}`} />
        </button>
      </div>
    </div>
  );
}

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

      <AddButton onUploadClick={onUploadClick} onCreateAppClick={onCreateAppClick} />
    </>
  );
}

export default ContentActionButtons;

// The Media page's two actions: blue "Upload" (image/video) and green "Create" (apps — the same
// green as the APP badge on every app tile). md+: two buttons inline in the toolbar. Below md: a
// round + button above the bottom tab bar that opens a speed dial (the page blurs, the two actions
// rise out of the button as labelled pills).
// Used by: pages/Content.jsx.
