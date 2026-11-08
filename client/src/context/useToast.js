import { useContext } from "react";

import { ToastContext } from "./toastContextInstance.js";

// const toast = useToast();  toast("Refresh sent to Lobby");  toast("Offline", "error");
// Tones: "success" (default), "error", "info".
// A third argument is a shorter text used on phones:
// toast("Skipped. Item(s) stay in the playlist but won't play", "success", "Skipped");
export function useToast() {
  return useContext(ToastContext).showToast;
}
