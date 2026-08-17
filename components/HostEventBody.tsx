"use client";

import { Authenticated, AuthLoading, useQuery } from "convex/react";
import HostDashboard from "@/components/HostDashboard";
import HostEventControls from "@/components/HostEventControls";
import { api } from "@/convex/_generated/api";
import { card } from "@/lib/styles";

export default function HostEventBody({ slug }: { slug: string }) {
  return (
    <>
      <AuthLoading>
        <p className="text-muted">Checking your session...</p>
      </AuthLoading>
      <Authenticated>
        <Loaded slug={slug} />
      </Authenticated>
    </>
  );
}

function Loaded({ slug }: { slug: string }) {
  const event = useQuery(api.events.bySlug, { slug });
  const rows = useQuery(api.events.listForHost);

  if (event === undefined || rows === undefined) {
    return <p className="text-muted">Loading this night...</p>;
  }

  if (event === null) {
    return (
      <div className={card}>
        <p className="font-semibold">Event not found.</p>
      </div>
    );
  }

  const row = rows.find((item) => item.event._id === event._id);

  return (
    <div className="space-y-6">
      <HostEventControls
        eventId={event._id}
        slug={event.slug}
        phase={event.phase}
        featured={row?.featured ?? false}
      />
      <HostDashboard eventId={event._id} capacity={event.capacity} />
    </div>
  );
}
