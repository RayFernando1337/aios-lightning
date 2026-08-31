"use client";

import { SignInButton, UserButton } from "@clerk/nextjs";
import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useQuery,
} from "convex/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import TicketMark from "@/components/TicketMark";
import { api } from "@/convex/_generated/api";
import { eventApplyPath, eventBoardPath } from "@/lib/paths";

const navHit =
  "inline-flex shrink-0 items-center px-3 py-2 font-mono text-[10px] font-bold tracking-[0.12em] uppercase";

function navClass(active: boolean): string {
  return active
    ? `${navHit} bg-admit text-paper`
    : `${navHit} text-paper transition hover:text-admit`;
}

function isBoardPath(pathname: string): boolean {
  return pathname === "/board" || pathname.endsWith("/board");
}

function isApplyPath(pathname: string): boolean {
  return pathname === "/apply" || pathname.endsWith("/apply");
}

function isDeskPath(pathname: string): boolean {
  return pathname === "/host" || pathname.startsWith("/host/");
}

export default function SiteHeader({
  night,
  preview,
}: {
  night?: {
    slug: string | null;
    name?: string;
    brand?: string;
    house?: boolean;
  };
  preview?: {
    host: boolean;
    signedIn: boolean;
  };
}) {
  const pathname = usePathname();
  const liveHost = useQuery(api.hosts.amHost) === true;
  const isHost = preview?.host ?? liveHost;
  const slug = night?.slug ?? null;
  const house = night?.house ?? slug === null;
  const applyHref = slug === null ? "/apply" : eventApplyPath(slug);
  const boardHref = slug === null ? "/board" : eventBoardPath(slug);

  return (
    <header className="site-chrome fixed inset-x-0 top-0 z-40 flex flex-col items-stretch gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href="/"
          className="nav-pill group px-4 py-2.5 text-sm font-semibold tracking-tight"
        >
          <TicketMark />
          <span>{night?.brand ?? "AiOS SF Lightning"}</span>
        </Link>
        {night?.name !== undefined && (
          <p className="hidden min-w-0 truncate font-mono text-[10px] font-bold tracking-[0.12em] text-admit uppercase sm:block">
            {night.name}
            <span className="text-muted"> · {house ? "main night" : "room"}</span>
          </p>
        )}
      </div>

      <nav
        data-site-nav={isHost ? "host" : "guest"}
        className="glass-pill flex-nowrap gap-x-3 overflow-hidden px-2 py-1"
      >
        {isHost && (
          <Link href="/host" className={navClass(isDeskPath(pathname))}>
            Desk
          </Link>
        )}
        <Link href={boardHref} className={navClass(isBoardPath(pathname))}>
          Board
        </Link>

        {preview !== undefined ? (
          preview.signedIn ? (
            <>
              <Link href={applyHref} className={navClass(isApplyPath(pathname))}>
                My slot
              </Link>
              <span
                aria-hidden="true"
                className="size-7 shrink-0 bg-paper/25"
              />
            </>
          ) : (
            <span className={navClass(false)}>Sign in</span>
          )
        ) : (
          <>
            <AuthLoading>
              <span className={`${navHit} text-muted`}>Wait</span>
            </AuthLoading>
            <Authenticated>
              <Link href={applyHref} className={navClass(isApplyPath(pathname))}>
                My slot
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "size-7 rounded-none",
                    userButtonTrigger: "rounded-none",
                  },
                }}
              />
            </Authenticated>
            <Unauthenticated>
              <SignInButton mode="modal" forceRedirectUrl={applyHref}>
                <button type="button" className={navClass(false)}>
                  Sign in
                </button>
              </SignInButton>
            </Unauthenticated>
          </>
        )}
      </nav>
    </header>
  );
}
