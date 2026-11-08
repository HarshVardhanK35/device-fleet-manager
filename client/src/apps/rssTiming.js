// Per-item dwell time, matching the real values already baked into the
// widget's own rendering — TickerLayout.vue's SCROLL_DURATION (a Ticker
// item advances once its headline finishes scrolling, timed per speed) and
// RssWidget.vue's ROTATION_MS (Split always advances on a flat 8s timer,
// independent of the speed setting — Split's own settings UI doesn't even
// expose a speed control). Keep these in sync if either widget file's
// timing ever changes — there's no shared constant across the two repos.
export const TICKER_SECONDS_PER_ITEM = { slow: 45, medium: 30, fast: 15 };
export const SPLIT_SECONDS_PER_ITEM = 8;

// Seconds one feed item stays on screen for `config` ({ layout, speed }).
export function rssSecondsPerItem(config) {
  return config.layout === "ticker"
    ? TICKER_SECONDS_PER_ITEM[config.speed] ?? TICKER_SECONDS_PER_ITEM.medium
    : SPLIT_SECONDS_PER_ITEM;
}

// Used by: apps/appModals/rss-modal.jsx, components/content/ContentDetailsPanel.jsx.
