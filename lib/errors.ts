import { ConvexError } from "convex/values";

/** Convex functions throw ConvexError with a plain string meant for the user. */
export function readableError(error: unknown): string {
  if (error instanceof ConvexError && typeof error.data === "string") {
    return error.data;
  }
  return "That did not go through. Try again.";
}
