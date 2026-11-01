import { useState } from "react";

// Wraps an async action so a button can show "Deleting…" while it runs.
// `run(...args)` ignores a second click while busy and always clears `busy`,
// even when the action throws.
export function useAsyncAction(action) {
  const [busy, setBusy] = useState(false);

  async function run(...args) {
    if (busy) return undefined;
    setBusy(true);
    try {
      return await action?.(...args);
    } finally {
      setBusy(false);
    }
  }

  return [run, busy];
}

// Used by: ConfirmDeleteModal.jsx, RemoveConfirmModal.jsx, TakeOverModal.jsx,
// ContentPickerModal.jsx.
