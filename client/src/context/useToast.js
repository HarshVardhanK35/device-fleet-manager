import { useContext } from "react";

import { ToastContext } from "./toastContextInstance.js";

// const toast = useToast();  toast("Refresh sent to Lobby");  toast("Offline", "error");
// Tones: "success" (default), "error", "info".
export function useToast() {
  return useContext(ToastContext).showToast;
}
