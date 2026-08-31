"use client";

import { useQuery } from "convex/react";
import BoardList from "@/components/BoardList";
import EmptyEvent from "@/components/EmptyEvent";
import MainNightLink from "@/components/MainNightLink";
import SiteHeader from "@/components/SiteHeader";
import { api } from "@/convex/_generated/api";
import { eyebrow, pageMain } from "@/lib/styles";

export default function BoardEventPage({ slug }: { slug?: string }) {
  const event = useQuery(
    api.events.bySlug,
    slug !== undefined ? { slug } : {},
  );

  if (event === undefined) {
    return (
      <>
        <SiteHeader night={{ slug: slug ?? null }} />
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
      <SiteHeader
        night={{
          slug: slug ?? null,
          name: event.name,
          brand: event.guestCopy.brand,
        }}
      />
      <main className={`${pageMain} max-w-4xl`}>
        <MainNightLink />
        <p className={`${eyebrow} mt-4`}>{roomLine}</p>
        <h1 className="font-display mt-3 text-5xl tracking-[-0.035em] sm:text-7xl">
          {event.guestCopy.boardHeading}
        </h1>
        <div className="mt-10">
          <BoardList
            slug={slug}
            capacity={event.capacity}
            showTakeaway={event.guestCopy.showTakeawayOnBoard}
            liveLabel={event.guestCopy.liveReviewLabel}
            takeawayLabel={event.guestCopy.takeawayReviewLabel}
          />
        </div>
      </main>
    </>
  );
}
