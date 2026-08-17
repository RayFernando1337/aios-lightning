"use client";

import Link from "next/link";
import ApplyCta from "@/components/ApplyCta";
import FilmLeader from "@/components/FilmLeader";
import NowPlayingStrip from "@/components/NowPlayingStrip";
import SiteHeader from "@/components/SiteHeader";
import type { PublicEvent } from "@/convex/events";
import { SITE } from "@/lib/content";
import { eventApplyPath, eventBoardPath } from "@/lib/paths";
import { buttonSecondary, eyebrow } from "@/lib/styles";

export default function EventLanding({
  event,
  house,
  alreadyPlayed,
}: {
  event: PublicEvent;
  house: boolean;
  alreadyPlayed: boolean;
}) {
  const applyHref = house ? "/apply" : eventApplyPath(event.slug);
  const boardHref = house ? "/board" : eventBoardPath(event.slug);
  const roomLine = event.room.length > 0 ? `${event.where} · ${event.room}` : event.where;

  return (
    <>
      <FilmLeader alreadyPlayed={alreadyPlayed} />
      <SiteHeader boardHref={boardHref} applyHref={applyHref} />

      <main>
        <section className="relative min-h-[100svh]">
          <div
            className="absolute inset-0 bg-ink bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(rgb(23 23 23 / 0.35), rgb(23 23 23 / 0.35)), url(${event.heroImage})`,
            }}
          />
          <div className="projector-scrim absolute inset-0" />

          <div className="relative grid min-h-[100svh] items-end gap-10 px-[var(--pad)] pt-28 pb-16 lg:grid-cols-[1fr_minmax(16rem,18vw)] lg:items-center">
            <div>
              <p className="marquee-chip">{event.when}</p>
              <h1 className="font-display mt-6 text-[clamp(4.2rem,14vw,11rem)] leading-[0.86] tracking-[-0.035em] text-paper">
                LIGHTNING
                <span className="mt-1 block text-transparent [-webkit-text-stroke:2px_var(--color-paper)]">
                  NIGHT
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-cream/90 sm:text-xl">
                {event.capacity} demos. Two to three minutes each. Working software
                only. {roomLine}.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <ApplyCta href={applyHref} />
                <Link href={boardHref} className={buttonSecondary}>
                  See the board
                </Link>
              </div>
            </div>

            <aside className="border border-dashed border-paper/25 bg-ink/55 p-5 backdrop-blur-[16px] lg:sticky lg:top-28">
              <div className="flex items-start justify-between gap-3">
                <p className={eyebrow}>House card</p>
                <span className="vip-seal">VIP</span>
              </div>
              <p className="font-display mt-4 text-5xl tracking-[-0.035em] text-paper">
                {event.capacity}
              </p>
              <p className="mt-1 font-mono text-[11px] tracking-[0.22em] text-muted uppercase">
                Slots · live only
              </p>
              <div className="mt-5 border-t border-dashed border-paper/20 pt-4 text-sm text-cream/85">
                {event.phase === "closed"
                  ? "Applications are closed."
                  : `Slots close when the ${event.capacity} are picked.`}
              </div>
              <div className="mt-5">
                <ApplyCta href={applyHref} />
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
            {event.rules.map((rule, index) => (
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
            {event.dryRun}
          </p>
        </section>

        <NowPlayingStrip
          slug={house ? undefined : event.slug}
          capacity={event.capacity}
          boardHref={boardHref}
        />

        <section className="border-t border-line px-[var(--pad)] py-24">
          <p className={eyebrow}>How this night works</p>
          <ol className="mt-10 space-y-10">
            {event.flow.map((step, index) => (
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
            <ApplyCta href={applyHref} />
            <p className="font-mono text-[11px] tracking-[0.22em] text-muted uppercase">
              {event.phase === "closed"
                ? "Applications are closed."
                : `Slots close when the ${event.capacity} are picked.`}
            </p>
          </div>
        </section>
      </main>

      <footer className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 px-[var(--pad)] pb-12 font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
        <p>
          {event.name}. Hosted at {roomLine}.
        </p>
        <a
          href={SITE.repoUrl}
          target="_blank"
          rel="noreferrer"
          className="font-bold text-admit transition hover:text-paper"
        >
          Fork this template on GitHub →
        </a>
      </footer>
    </>
  );
}
