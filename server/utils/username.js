import crypto from "crypto";

import User from "../models/User.js";

const MAX_NAME_PART = 11; // letters taken from first + last name
const DIGITS = 4; // random digits added at the end (15 characters at most)
const TRIES = 10;

// "Harsha" + "Vardhan K" -> "harshavardh" (lowercase letters and digits only,
// first name first, cut to 11 characters).
function namePart(firstName, lastName) {
  const letters = `${firstName || ""}${lastName || ""}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  return (letters || "user").slice(0, MAX_NAME_PART);
}

// A username for a new account: the name part plus 4 random digits, such as
// "harshavardh4821". Checked against existing users and retried on a clash;
// the unique index on User.username is the final guarantee.
export async function generateUsername(firstName, lastName) {
  const base = namePart(firstName, lastName);
  for (let i = 0; i < TRIES; i++) {
    const digits = String(crypto.randomInt(0, 10 ** DIGITS)).padStart(DIGITS, "0");
    const candidate = `${base}${digits}`;
    if (!(await User.exists({ username: candidate }))) return candidate;
  }
  throw new Error("Could not generate a username, please try again");
}
