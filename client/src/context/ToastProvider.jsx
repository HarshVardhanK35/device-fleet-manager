import { useRef, useState } from "react";
import { CircleAlert, CircleCheck, Info } from "lucide-react";

import { ToastContext } from "./toastContextInstance.js";

const SHOW_MS = 4000; // a toast stays this long
const MAX_TOASTS = 3; // at most this many on screen at once

const TONES = {
  success: { Icon: CircleCheck, color: "text-accent-green" },
  error: { Icon: CircleAlert, color: "text-accent-red" },
  info: { Icon: Info, color: "text-accent-blue" },
};

// Short messages that appear at the bottom right and fade by themselves
// ("Refresh sent to Lobby"). Use them through useToast().
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  function dismiss(id) {
    setToasts((list) => list.filter((t) => t.id !== id));
  }

  function showToast(message, tone = "success", shortMessage) {
    const id = nextId.current++;
    setToasts((list) => [...list, { id, message, shortMessage, tone }].slice(-MAX_TOASTS));
    setTimeout(() => dismiss(id), SHOW_MS);
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom)+12px)] [body:has(.cw-action-bar)_&]:bottom-[calc(3.5rem+4.5rem+env(safe-area-inset-bottom)+12px)] left-4 right-4 z-[100] flex flex-col items-center gap-2 md:items-end md:bottom-4 md:left-auto md:w-[380px]">
        {toasts.map(({ id, message, shortMessage, tone }) => {
          const { Icon, color } = TONES[tone] || TONES.success;
          return (
            <button
              key={id}
              type="button"
              role="status"
              onClick={() => dismiss(id)}
              // Phones: one line, shown just above the bottom action bar (e.g.
              // "Add content"), so that button stays uncovered.
              className="cw-pop-in pointer-events-auto flex w-fit max-w-full min-h-[46px] items-center gap-2.5 rounded-lg border border-border-muted bg-bg-panel px-4 py-2 text-left text-sm text-text-primary shadow-2xl md:items-start md:py-3"
            >
              <Icon size={18} className={`flex-none ${color} md:mt-px`} />
              <span className="min-w-0 [overflow-wrap:anywhere]">
                {shortMessage ? (
                  <>
                    <span className="md:hidden">{shortMessage}</span>
                    <span className="hidden md:inline">{message}</span>
                  </>
                ) : (
                  message
                )}
              </span>
            </button>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

// Used by: App.jsx (wraps the whole app).
