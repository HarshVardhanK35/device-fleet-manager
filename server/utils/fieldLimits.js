// Character limits for the text fields people type (mirrored in
// client/src/utils/limits.js, which only gives the typing box the same cap).
export const LIMITS = {
  contentName: 60,
  playlistName: 60,
  playlistDescription: 200,
  screenName: 30,
  firstName: 20,
  lastName: 20,
};

// A max-length validator that only checks a field when it is new or has been
// changed. Documents saved before a limit existed (a long old name) stay
// valid when something else on them is saved, such as a screen connecting.
export function maxLengthWhenChanged(path, max, label) {
  return {
    validator(value) {
      if (!this.isNew && !this.isModified(path)) return true;
      return !value || value.length <= max;
    },
    message: `${label} must be ${max} characters or fewer`,
  };
}

// The first validation message on its own ("Name must be 60 characters or
// fewer") instead of Mongoose's long "X validation failed: path: ..." text.
export function validationMessage(error) {
  if (error?.name === "ValidationError" && error.errors) {
    const first = Object.values(error.errors)[0];
    if (first?.message) return first.message;
  }
  return error.message;
}
