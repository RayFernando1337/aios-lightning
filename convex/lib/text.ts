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
