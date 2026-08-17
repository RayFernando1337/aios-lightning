import { currentUser } from "@clerk/nextjs/server";
import { isHostEmail } from "@/convex/lib/hosts";

export type HostGate =
  | { allowed: true }
  | { allowed: false; title: string; detail: string };

export async function hostGate(): Promise<HostGate> {
  if (!process.env.CLERK_SECRET_KEY) {
    return {
      allowed: false,
      title: "Host access cannot be checked.",
      detail:
        "CLERK_SECRET_KEY is not set on this deployment, so there is no way to read who is signed in.",
    };
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? null;

  if (email === null) {
    return {
      allowed: false,
      title: "Host access only.",
      detail: "Sign in with a host account to triage submissions.",
    };
  }

  if (!isHostEmail(email)) {
    return {
      allowed: false,
      title: "Host access only.",
      detail: `Signed in as ${email}. Add that address to HOST_EMAILS to get in.`,
    };
  }

  return { allowed: true };
}
