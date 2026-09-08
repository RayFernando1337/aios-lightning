"use client";

import { useQuery } from "convex/react";
import { ReactNode } from "react";
import SiteHeader from "@/components/SiteHeader";
import { api } from "@/convex/_generated/api";

export default function HostChrome({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  const event = useQuery(api.events.hostBySlug, { slug });
  const featured = useQuery(api.events.featured);
  const loaded = event !== undefined && event !== null;
  const featuredReady = featured !== undefined;
  const house =
    loaded &&
    featuredReady &&
    featured !== null &&
    featured._id === event._id;

  return (
    <>
      {/* The name (and its house/room tag) waits for the featured query so the
          eyebrow never flickers between labels; hrefs use the route slug so
          they are room-scoped from the first paint. */}
      <SiteHeader
        night={
          loaded && featuredReady
            ? {
                slug: event.slug,
                name: event.name,
                brand: event.guestCopy.brand,
                house,
              }
            : { slug }
        }
      />
      {children}
    </>
  );
}
