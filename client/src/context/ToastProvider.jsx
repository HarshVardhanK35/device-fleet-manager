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

  function showToast(message, tone = "success") {
    const id = nextId.current++;
    setToasts((list) => [...list, { id, message, tone }].slice(-MAX_TOASTS));
    setTimeout(() => dismiss(id), SHOW_MS);
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 left-4 right-4 z-[100] flex flex-col items-end gap-2 md:left-auto md:w-[380px]">
        {toasts.map(({ id, message, tone }) => {
          const { Icon, color } = TONES[tone] || TONES.success;
          return (
            <button
              key={id}
              type="button"
              role="status"
              onClick={() => dismiss(id)}
              className="cw-pop-in pointer-events-auto flex w-full items-start gap-2.5 rounded-lg border border-border-muted bg-bg-panel px-4 py-3 text-left text-sm text-text-primary shadow-2xl"
            >
              <Icon size={18} className={`mt-px flex-none ${color}`} />
              <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">{message}</span>
            </button>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

// Used by: App.jsx (wraps the whole app).
