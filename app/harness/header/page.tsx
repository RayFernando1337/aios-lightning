"use client";

import { notFound, useSearchParams } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { pageMain } from "@/lib/styles";

const NIGHT = {
  slug: null,
  name: "Build with Grok Bot @ Hawaii Tech Week",
  brand: "Grok Bot HTW",
  house: true,
};

/** Header IA proof. Live /host and Clerk stay off this page. */
export default function HeaderHarness() {
  const role = useSearchParams().get("role");

  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const host = role === "host";

  return (
    <>
      <SiteHeader
        night={NIGHT}
        preview={{ host, signedIn: true }}
      />
      <main
        className={pageMain}
        data-header-harness={host ? "host" : "guest"}
      >
        <p className="font-mono text-[11px] tracking-[0.12em] text-muted uppercase">
          {host ? "Host session" : "Guest session"}
        </p>
        <h1 className="font-display mt-3 text-5xl tracking-[-0.035em]">
          LIGHTNING
          <span className="ml-3 text-transparent [-webkit-text-stroke:2px_#f5eedc]">
            NIGHT
          </span>
        </h1>
      </main>
    </>
  );
}
