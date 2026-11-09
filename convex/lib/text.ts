import { ConvexError } from "convex/values";

export function requireText(
  value: string,
  label: string,
  maxLength: number,
): string {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    throw new ConvexError(`${label} is required.`);
  }
  if (trimmed.length > maxLength) {
    throw new ConvexError(`${label} must be ${maxLength} characters or fewer.`);
  }

  return trimmed;
}

/** Trims the value. An empty string clears the field (returns undefined). */
export function optionalText(
  value: string,
  label: string,
  maxLength: number,
): string | undefined {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }
  if (trimmed.length > maxLength) {
    throw new ConvexError(`${label} must be ${maxLength} characters or fewer.`);
  }
  return trimmed;
}

/** Like optionalText, but the value must be an https URL with a host. */
export function optionalHttpsUrl(
  value: string,
  label: string,
  maxLength: number,
): string | undefined {
  const trimmed = optionalText(value, label, maxLength);
  if (trimmed === undefined) {
    return undefined;
  }
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new ConvexError(`${label} must be a full https:// link.`);
  }
  if (parsed.protocol !== "https:" || parsed.hostname.length === 0) {
    throw new ConvexError(`${label} must be a full https:// link.`);
  }
  return parsed.toString();
}
