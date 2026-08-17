"use client";

import { useQuery } from "convex/react";
import BoardList from "@/components/BoardList";
import EmptyEvent from "@/components/EmptyEvent";
import SiteHeader from "@/components/SiteHeader";
import { api } from "@/convex/_generated/api";
import { eventApplyPath, eventBoardPath } from "@/lib/paths";
import { eyebrow, pageMain } from "@/lib/styles";

export default function BoardEventPage({ slug }: { slug?: string }) {
  const event = useQuery(
    api.events.bySlug,
    slug !== undefined ? { slug } : {},
  );
  const house = slug === undefined;
  const applyHref = house || event === null || event === undefined
    ? "/apply"
    : eventApplyPath(event.slug);
  const boardHref = house || event === null || event === undefined
    ? "/board"
    : eventBoardPath(event.slug);

  if (event === undefined) {
    return (
      <>
        <SiteHeader applyHref={applyHref} boardHref={boardHref} />
        <main className={`${pageMain} max-w-4xl`}>
          <p className="text-muted">Loading the lineup...</p>
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
      <SiteHeader applyHref={applyHref} boardHref={boardHref} />
      <main className={`${pageMain} max-w-4xl`}>
        <p className={eyebrow}>{roomLine}</p>
        <h1 className="font-display mt-3 text-5xl tracking-[-0.035em] sm:text-7xl">
          TONIGHT&apos;S BOARD
        </h1>
        <div className="mt-10">
          <BoardList slug={slug} capacity={event.capacity} />
        </div>
      </main>
    </>
  );
}
