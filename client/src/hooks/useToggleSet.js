import { useCallback, useState } from "react";

// Shared "toggle an id in/out of a Set, toggle-all" logic — this exact
// pattern (new Set(prev), has/delete/add, compare size to toggle-all) was
// duplicated across Content.jsx and Playlists.jsx (twice there: playlist
// checkboxes and content-slot checkboxes).
export function useToggleSet(initial = []) {
  const [set, setSet] = useState(() => new Set(initial));

  const toggle = useCallback((id) => {
    setSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback((ids) => {
    setSet((prev) => (prev.size === ids.length ? new Set() : new Set(ids)));
  }, []);

  const clear = useCallback(() => setSet(new Set()), []);

  return [set, { toggle, toggleAll, clear, setSet }];
}
