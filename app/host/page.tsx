import { currentUser } from "@clerk/nextjs/server";
import HostDashboard from "@/components/HostDashboard";
import SiteHeader from "@/components/SiteHeader";
import { isHostEmail } from "@/convex/lib/hosts";
import { card, eyebrow } from "@/lib/styles";

export const metadata = {
  title: "Host · AiOS SF Lightning",
};

// Per host, per request. Never prerendered.
export const dynamic = "force-dynamic";

export default async function HostPage() {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? null;

  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-2xl px-5 pt-8 pb-16">
        <p className={eyebrow}>Host</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">
          Tonight&apos;s lineup
        </h1>

        <div className="mt-6">
          {isHostEmail(email) ? (
            <HostDashboard />
          ) : (
            <div className={card}>
              <p className="font-semibold">Host access only.</p>
              <p className="mt-1 text-sm text-zinc-400">
                {email === null
                  ? "Sign in with a host account to triage submissions."
                  : `Signed in as ${email}. Add that address to HOST_EMAILS to get in.`}
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
