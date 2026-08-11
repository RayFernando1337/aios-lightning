/**
 * Host allowlist, shared by the Convex functions and the Next.js `/host` page.
 *
 * `HOST_EMAILS` is read from whichever runtime imports this module, so it has to
 * be set in two places: the Convex dashboard (for the functions) and the Next.js
 * environment (for the page gate). See README.
 */

// Kept in code so the host view still works if HOST_EMAILS is never set.
const ALWAYS_HOSTS = ["smile@rayfernando.ai"];

export function hostEmails(): string[] {
  const fromEnv = (process.env.HOST_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);

  return [...new Set([...ALWAYS_HOSTS, ...fromEnv])];
}

export function isHostEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return hostEmails().includes(email.trim().toLowerCase());
}
