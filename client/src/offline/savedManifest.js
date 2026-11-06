// The last manifest a screen received, and which playlist it was playing, kept
// in the browser so a screen that reloads with no internet can still play.

const manifestKey = (token) => `cw.manifest.${token}`;
const playingKey = (token) => `cw.playing.${token}`;

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    if (value === null || value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or disabled: the screen just cannot restart offline
  }
}

export const saveManifest = (token, manifest) => write(manifestKey(token), manifest);
export const readManifest = (token) => read(manifestKey(token));

// The assignment that was playing the last time the screen was online.
export const savePlaying = (token, assignmentId) => write(playingKey(token), assignmentId ?? null);
export const readPlaying = (token) => read(playingKey(token));

// Forget both for a screen that was unpaired.
export function forgetSavedManifest(token) {
  write(manifestKey(token), null);
  write(playingKey(token), null);
}

// Used by: components/screens/DevicePlayback.jsx, offline/forgetScreen.js.
