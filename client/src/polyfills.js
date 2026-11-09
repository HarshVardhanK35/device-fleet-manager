// A few newer built-ins that a TV's built-in browser may lack (Chromium 63 to
// 78, from about 2019 to 2021). Only what the player, the pairing page and their
// libraries use; each one is added only when it is missing, so a modern browser
// runs none of this. Imported first in main.jsx.

if (typeof globalThis === "undefined") {
  window.globalThis = window;
}

if (!Object.fromEntries) {
  Object.fromEntries = function fromEntries(entries) {
    const out = {};
    for (const [key, value] of entries) out[key] = value;
    return out;
  };
}

if (!Array.prototype.flat) {
  Array.prototype.flat = function flat(depth = 1) {
    return depth < 1
      ? this.slice()
      : this.reduce((acc, item) => acc.concat(Array.isArray(item) ? item.flat(depth - 1) : item), []);
  };
}

if (!Array.prototype.flatMap) {
  Array.prototype.flatMap = function flatMap(fn, thisArg) {
    return this.map(fn, thisArg).flat(1);
  };
}

if (!String.prototype.replaceAll) {
  String.prototype.replaceAll = function replaceAll(search, replacement) {
    if (search instanceof RegExp) return this.replace(search, replacement);
    return this.split(search).join(replacement);
  };
}

if (!Promise.allSettled) {
  Promise.allSettled = function allSettled(promises) {
    return Promise.all(
      Array.from(promises, (p) =>
        Promise.resolve(p).then(
          (value) => ({ status: "fulfilled", value }),
          (reason) => ({ status: "rejected", reason }),
        ),
      ),
    );
  };
}

if (typeof queueMicrotask === "undefined") {
  window.queueMicrotask = (fn) => Promise.resolve().then(fn);
}

// Used by: main.jsx.
