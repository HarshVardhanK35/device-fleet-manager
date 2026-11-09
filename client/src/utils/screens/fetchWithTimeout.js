// fetch() that gives up after `ms` milliseconds (rejects like a network error),
// so a half-dead connection can't leave a screen waiting forever. Uses
// AbortController (not AbortSignal.timeout) so it also works on older TV browsers;
// a browser with no AbortController at all (before Chromium 66) still gets the
// timeout, it just can't cancel the request underneath.
export async function fetchWithTimeout(url, options = {}, ms = 10000) {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new TypeError("Request timed out")), ms);
  });

  if (typeof AbortController === "undefined") {
    return Promise.race([fetch(url, options), timeout]);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await Promise.race([fetch(url, { ...options, signal: controller.signal }), timeout]);
  } finally {
    clearTimeout(timer);
  }
}

// Used by: api/devices.js, hooks/useScreenConnection.js.
