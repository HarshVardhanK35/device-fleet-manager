import { lazy } from "react";

const RELOAD_KEY = "castwise-chunk-reload";

// React.lazy for a page that survives a new deploy: if an old open tab asks for
// a page file that no longer exists (the file names change on every build),
// reload once to pick up the new build instead of showing a blank page. A
// second failure in a row is thrown, so it can never reload in a loop.
// Used by: App.jsx.
export function lazyRetry(loader) {
  return lazy(async () => {
    try {
      const page = await loader();
      try {
        sessionStorage.removeItem(RELOAD_KEY);
      } catch {
        /* storage blocked: nothing to clear */
      }
      return page;
    } catch (err) {
      let alreadyReloaded = true;
      try {
        alreadyReloaded = sessionStorage.getItem(RELOAD_KEY) === "1";
        if (!alreadyReloaded) sessionStorage.setItem(RELOAD_KEY, "1");
      } catch {
        /* storage blocked: don't risk a reload loop */
      }
      if (alreadyReloaded) throw err;
      window.location.reload();
      return new Promise(() => {});
    }
  });
}
