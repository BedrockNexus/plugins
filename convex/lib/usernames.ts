import { ConvexError } from "convex/values";

const usernamePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeUsername(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 39)
    .replace(/-+$/g, "");
}

export function assertUsername(value: string) {
  if (
    value.length < 1 ||
    value.length > 39 ||
    !usernamePattern.test(value) ||
    normalizeUsername(value) !== value
  ) {
    throw new ConvexError({
      code: "INVALID_USERNAME",
      message:
        "Usernames must be 1–39 lowercase letters, numbers, or single hyphens, and cannot begin or end with a hyphen.",
    });
  }

  return value;
}
