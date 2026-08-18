"use client";

import { SignInButton, UserButton } from "@clerk/nextjs";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import Link from "next/link";
import TicketMark from "@/components/TicketMark";
import { eventPath, hostEventPath } from "@/lib/paths";

const navLink =
  "font-mono text-[10px] font-bold tracking-[0.22em] text-paper/80 uppercase transition hover:text-paper";

export default function SiteHeader({
  boardHref = "/board",
  applyHref = "/apply",
  eventName,
  kind,
  host = false,
  eventSlug,
  publicHref,
}: {
  boardHref?: string;
  applyHref?: string;
  eventName?: string;
  kind?: "house" | "room";
  host?: boolean;
  eventSlug?: string;
  publicHref?: string;
}) {
  const kindLabel =
    kind === "house" ? "main night" : kind === "room" ? "room" : null;

  return (
    <header className="site-chrome fixed inset-x-0 top-0 z-40 flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href="/"
          className="nav-pill group px-4 py-2.5 text-sm font-semibold tracking-tight"
        >
          <TicketMark />
          <span>
            AiOS SF <span className="font-display tracking-tight">Lightning</span>
          </span>
        </Link>
        {eventName !== undefined && (
          <p className="hidden min-w-0 truncate font-mono text-[10px] font-bold tracking-[0.22em] text-admit uppercase sm:block">
            {eventName}
            {kindLabel !== null ? (
              <span className="text-muted"> · {kindLabel}</span>
            ) : null}
          </p>
        )}
      </div>

      <nav className="glass-pill flex-wrap px-4 py-2 text-sm">
        <Link href="/" className={navLink}>
          Main night
        </Link>
        {host && (
          <Link href="/host" className={navLink}>
            Host desk
          </Link>
        )}
        {host && eventSlug !== undefined && (
          <>
            <Link href={publicHref ?? eventPath(eventSlug)} className={navLink}>
              Public
            </Link>
            <Link href={hostEventPath(eventSlug)} className={navLink}>
              Triage
            </Link>
          </>
        )}
        <Link href={boardHref} className={navLink}>
          Board
        </Link>

        <AuthLoading>
          <span className="font-mono text-[10px] tracking-[0.22em] text-muted uppercase">
            Wait
          </span>
        </AuthLoading>

        <Authenticated>
          <Link href={applyHref} className={navLink}>
            My slot
          </Link>
          <UserButton />
        </Authenticated>

        <Unauthenticated>
          <SignInButton mode="modal" forceRedirectUrl={applyHref}>
            <button className="font-mono text-[10px] font-bold tracking-[0.22em] text-paper uppercase">
              Sign in
            </button>
          </SignInButton>
        </Unauthenticated>
      </nav>
    </header>
  );
}
