import { describeBrowser } from "../utils/screenLog/screenSnapshot.js";
import { itemKey } from "./playlistItems.js";
import { isLowStorage, readStorage } from "./storageMode.js";

// What the screen tells its owner about itself: the browser, how much offline storage it has,
// and which items of the playing playlist are saved. Published (retained) on the screen's
// status topic; the Player page reads it, even while the screen is offline.
export async function buildStorageReport(items, savedKeys) {
  const browser = describeBrowser();
  const storage = await readStorage();

  const seen = new Set();
  const notSaved = [];
  let wanted = 0;
  let saved = 0;
  for (const item of items) {
    const key = itemKey(item);
    if (key === null || seen.has(key)) continue;
    seen.add(key);
    wanted += 1;
    if (savedKeys.has(key)) saved += 1;
    else notSaved.push({ name: item.name, type: item.type });
  }

  return {
    at: new Date().toISOString(),
    browser: [browser.browser, browser.version].filter(Boolean).join(" "),
    chromium: browser.chromium,
    tizen: browser.tizen,
    quotaMB: storage?.quotaMB ?? null,
    usedMB: storage?.usedMB ?? null,
    freeMB: storage?.freeMB ?? null,
    persisted: storage?.persisted ?? null,
    lowStorage: isLowStorage(),
    videoQuality: isLowStorage() ? "480p" : "original",
    wanted,
    saved,
    notSaved: notSaved.slice(0, 10),
  };
}

// Used by: hooks/useStorageReport.js.
