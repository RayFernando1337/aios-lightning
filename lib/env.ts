/**
 * The two public keys the app cannot run without. Both are inlined at build
 * time, so a build with either one missing renders the setup checklist instead
 * of the app.
 */
export function missingPublicEnv(): string[] {
  const missing: string[] = [];

  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    missing.push("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
  }
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    missing.push("NEXT_PUBLIC_CONVEX_URL");
  }

  return missing;
}
