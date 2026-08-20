import HostDesk from "@/components/HostDesk";
import HostErrorBoundary from "@/components/HostErrorBoundary";
import SiteHeader from "@/components/SiteHeader";
import { hostGate } from "@/lib/hostAccess";
import { card, eyebrow, pageMain } from "@/lib/styles";

export const metadata = {
  title: "Host · AiOS SF Lightning",
};

export const dynamic = "force-dynamic";

export default async function HostPage() {
  const gate = await hostGate();

  return (
    <>
      <SiteHeader host />
      <main className={pageMain}>
        <p className={eyebrow}>Host</p>
        <h1 className="font-display mt-3 text-5xl tracking-[-0.035em]">
          NIGHTS
        </h1>
        <div className="mt-8">
          {gate.allowed ? (
            <HostErrorBoundary>
              <HostDesk />
            </HostErrorBoundary>
          ) : (
            <div className={card}>
              <p className="font-semibold">{gate.title}</p>
              <p className="mt-1 text-sm text-muted">{gate.detail}</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
