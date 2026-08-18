"use client";

import { useQuery } from "convex/react";
import ApplyForm from "@/components/ApplyForm";
import EmptyEvent from "@/components/EmptyEvent";
import MainNightLink from "@/components/MainNightLink";
import SiteHeader from "@/components/SiteHeader";
import { api } from "@/convex/_generated/api";
import { eventApplyPath, eventBoardPath } from "@/lib/paths";
import { eyebrow, pageMain } from "@/lib/styles";

export default function ApplyEventPage({ slug }: { slug?: string }) {
  const event = useQuery(
    api.events.bySlug,
    slug !== undefined ? { slug } : {},
  );
  const applyHref =
    slug !== undefined ? eventApplyPath(slug) : "/apply";
  const boardHref =
    slug !== undefined ? eventBoardPath(slug) : "/board";
  const house = slug === undefined;

  if (event === undefined) {
    return (
      <>
        <SiteHeader applyHref={applyHref} boardHref={boardHref} />
        <main className={pageMain}>
          <p className="text-muted">Loading the night...</p>
        </main>
      </>
    );
  }

  if (event === null) {
    return <EmptyEvent />;
  }

  const roomLine =
    event.room.length > 0 ? `${event.when} · ${event.room}` : event.when;

  return (
    <>
      <SiteHeader
        applyHref={applyHref}
        boardHref={boardHref}
        eventName={event.name}
        kind={house ? "house" : "room"}
      />
      <main className={pageMain}>
        <MainNightLink />
        <p className={`${eyebrow} mt-4`}>01 · {event.name}</p>
        <h1 className="font-display mt-3 text-5xl tracking-[-0.035em] sm:text-7xl">
          APPLY TO DEMO
        </h1>
        <p className="mt-4 max-w-xl text-cream/85">
          {roomLine}. {event.capacity} slots, two to three minutes each. Tell
          us what will be running on screen and what the room learns from it.
        </p>
        <div className="mt-10">
          <ApplyForm
            slug={slug}
            eventId={event._id}
            applyHref={applyHref}
            boardHref={boardHref}
            capacity={event.capacity}
            dryRun={event.dryRun}
            phase={event.phase}
            eventName={event.name}
            eventWhen={event.when}
            eventRoom={event.room}
          />
        </div>
      </main>
    </>
  );
}
