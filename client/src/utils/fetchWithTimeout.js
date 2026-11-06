// fetch() that gives up after `ms` milliseconds (rejects like a network error),
// so a half-dead connection can't leave a screen waiting forever. Uses
// AbortController (not AbortSignal.timeout) so it also works on older TV browsers.
export async function fetchWithTimeout(url, options = {}, ms = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// Used by: api/devices.js, hooks/useScreenConnection.js.
