"use client";

import { useQuery } from "convex/react";
import EmptyEvent from "@/components/EmptyEvent";
import EventLanding from "@/components/EventLanding";
import SiteHeader from "@/components/SiteHeader";
import { api } from "@/convex/_generated/api";
import { pageMain } from "@/lib/styles";

export default function ResolvedLanding({
  slug,
  house,
  alreadyPlayed,
}: {
  slug?: string;
  house: boolean;
  alreadyPlayed: boolean;
}) {
  const event = useQuery(
    api.events.bySlug,
    slug !== undefined ? { slug } : {},
  );

  if (event === undefined) {
    return (
      <>
        <SiteHeader night={{ slug: slug ?? null }} />
        <main className={pageMain}>
          <p className="text-muted">Loading the night...</p>
        </main>
      </>
    );
  }

  if (event === null) {
    return <EmptyEvent />;
  }

  return (
    <EventLanding
      event={event}
      house={house}
      alreadyPlayed={alreadyPlayed}
    />
  );
}
