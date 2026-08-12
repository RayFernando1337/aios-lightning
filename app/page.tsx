import { cookies } from "next/headers";
import Link from "next/link";
import ApplyCta from "@/components/ApplyCta";
import FilmLeader from "@/components/FilmLeader";
import NowPlayingStrip from "@/components/NowPlayingStrip";
import SiteHeader from "@/components/SiteHeader";
import { MAX_SELECTED } from "@/convex/lib/limits";
import { EVENT, FLOW, RULES } from "@/lib/content";
import { LEADER_COOKIE } from "@/lib/leader";
import { buttonSecondary, eyebrow } from "@/lib/styles";

export default async function Home() {
  const alreadyPlayed =
    (await cookies()).get(LEADER_COOKIE)?.value === "1";

  return (
    <>
      <FilmLeader alreadyPlayed={alreadyPlayed} />
      <SiteHeader />

      <section className="relative min-h-[100svh]">
        <div
          className="absolute inset-0 bg-ink bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgb(23 23 23 / 0.35), rgb(23 23 23 / 0.35)), url(${EVENT.heroImage})`,
          }}
        />
        <div className="projector-scrim absolute inset-0" />

        <div className="relative grid min-h-[100svh] items-end gap-10 px-[var(--pad)] pt-28 pb-16 lg:grid-cols-[1fr_minmax(16rem,18vw)] lg:items-center">
          <div>
            <p className="marquee-chip">{EVENT.when}</p>
            <h1 className="font-display mt-6 text-[clamp(4.2rem,14vw,11rem)] leading-[0.86] tracking-[-0.035em] text-paper">
              LIGHTNING
              <span className="mt-1 block text-transparent [-webkit-text-stroke:2px_var(--color-paper)]">
                NIGHT
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-cream/90 sm:text-xl">
              {MAX_SELECTED} demos. Two to three minutes each. Working software
              only. {EVENT.where}.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ApplyCta />
              <Link href="/board" className={buttonSecondary}>
                See tonight&apos;s board
              </Link>
            </div>
          </div>

          <aside className="border border-dashed border-paper/25 bg-ink/55 p-5 backdrop-blur-[16px] lg:sticky lg:top-28">
            <div className="flex items-start justify-between gap-3">
              <p className={eyebrow}>House card</p>
              <span className="vip-seal">VIP</span>
            </div>
            <p className="font-display mt-4 text-5xl tracking-[-0.035em] text-paper">
              {MAX_SELECTED}
            </p>
            <p className="mt-1 font-mono text-[11px] tracking-[0.22em] text-muted uppercase">
              Slots · live only
            </p>
            <div className="mt-5 border-t border-dashed border-paper/20 pt-4 text-sm text-cream/85">
              Slots close when the {MAX_SELECTED} are picked.
            </div>
            <div className="mt-5">
              <ApplyCta />
            </div>
          </aside>
        </div>
        <div className="film-edge relative" />
      </section>

      <section className="relative bg-cream px-[var(--pad)] py-24 text-ink sm:py-32">
        <p className="text-center font-mono text-[11px] font-bold tracking-[0.3em] text-velvet uppercase">
          House rules
        </p>
        <h2 className="font-display mx-auto mt-4 max-w-4xl text-center text-5xl tracking-[-0.035em] sm:text-7xl">
          THE RULES
        </h2>
        <ol className="mx-auto mt-14 grid max-w-4xl gap-8 sm:grid-cols-2">
          {RULES.map((rule, index) => (
            <li key={rule.title}>
              <p className="font-display text-5xl tracking-[-0.035em] text-velvet">
                {String(index + 1).padStart(2, "0")}
              </p>
              <p className="mt-3 text-xl font-semibold">{rule.title}</p>
              <p className="mt-2 text-ink/70">{rule.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="velvet relative px-[var(--pad)] py-24 text-paper">
        <p className="font-mono text-[11px] font-bold tracking-[0.3em] uppercase">
          Dry run gate
        </p>
        <p className="font-display mt-4 max-w-4xl text-4xl tracking-[-0.035em] sm:text-6xl">
          {EVENT.dryRun}
        </p>
      </section>

      <NowPlayingStrip />

      <section className="border-t border-line px-[var(--pad)] py-24">
        <p className={eyebrow}>How tonight works</p>
        <ol className="mt-10 space-y-10">
          {FLOW.map((step, index) => (
            <li
              key={step}
              className="grid gap-4 border-b border-line pb-10 last:border-b-0 md:grid-cols-[150px_1fr] md:items-baseline"
            >
              <p className="font-display text-5xl tracking-[-0.035em] text-admit sm:text-7xl">
                {String(index + 1).padStart(2, "0")}
              </p>
              <p className="font-display text-3xl tracking-[-0.035em] text-paper sm:text-5xl">
                {step}
              </p>
            </li>
          ))}
        </ol>
        <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center">
          <ApplyCta />
          <p className="font-mono text-[11px] tracking-[0.22em] text-muted uppercase">
            Slots close when the {MAX_SELECTED} are picked.
          </p>
        </div>
      </section>

      <footer className="px-[var(--pad)] pb-12 font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
        {EVENT.brand}. Hosted at {EVENT.where}.
      </footer>
    </>
  );
}
