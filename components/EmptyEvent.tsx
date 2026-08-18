import SeedIfEmpty from "@/components/SeedIfEmpty";
import SiteHeader from "@/components/SiteHeader";
import { SITE } from "@/lib/content";
import { card, eyebrow, pageMain } from "@/lib/styles";

export default function EmptyEvent() {
  return (
    <>
      <SeedIfEmpty />
      <SiteHeader />
      <main className={pageMain}>
        <p className={eyebrow}>{SITE.brand}</p>
        <h1 className="font-display mt-3 text-5xl tracking-[-0.035em] sm:text-7xl">
          NO NIGHT ON THE MARQUEE
        </h1>
        <div className={`${card} mt-8`}>
          <p className="font-semibold">Nothing is scheduled yet.</p>
          <p className="mt-1 text-sm text-muted">
            If a night should be here, it will appear in a moment.
          </p>
        </div>
      </main>
    </>
  );
}
