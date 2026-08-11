import { currentUser } from "@clerk/nextjs/server";
import HostDashboard from "@/components/HostDashboard";
import HostErrorBoundary from "@/components/HostErrorBoundary";
import SiteHeader from "@/components/SiteHeader";
import { isHostEmail } from "@/convex/lib/hosts";
import { card, eyebrow } from "@/lib/styles";

export const metadata = {
  title: "Host · AiOS SF Lightning",
};

// Per host, per request. Never prerendered.
export const dynamic = "force-dynamic";

type Gate =
  | { allowed: true }
  | { allowed: false; title: string; detail: string };

async function hostGate(): Promise<Gate> {
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

export default async function HostPage() {
  const gate = await hostGate();

  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-2xl px-5 pt-8 pb-16">
        <p className={eyebrow}>Host</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">
          Tonight&apos;s lineup
        </h1>

        <div className="mt-6">
          {gate.allowed ? (
            <HostErrorBoundary>
              <HostDashboard />
            </HostErrorBoundary>
          ) : (
            <div className={card}>
              <p className="font-semibold">{gate.title}</p>
              <p className="mt-1 text-sm text-zinc-400">{gate.detail}</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
