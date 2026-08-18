"use client";

import { useQuery } from "convex/react";
import { ReactNode } from "react";
import SiteHeader from "@/components/SiteHeader";
import { api } from "@/convex/_generated/api";
import { eventApplyPath, eventBoardPath, eventPath } from "@/lib/paths";

export default function HostChrome({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  const event = useQuery(api.events.bySlug, { slug });
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
      <SiteHeader
        host
        eventName={loaded ? event.name : undefined}
        kind={
          loaded && featuredReady ? (house ? "house" : "room") : undefined
        }
        eventSlug={loaded ? event.slug : undefined}
        applyHref={loaded ? eventApplyPath(event.slug) : "/apply"}
        boardHref={loaded ? eventBoardPath(event.slug) : "/board"}
        publicHref={loaded ? eventPath(event.slug) : undefined}
      />
      {children}
    </>
  );
}
