"use client";

import { SignInButton, UserButton } from "@clerk/nextjs";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import Link from "next/link";
import TicketMark from "@/components/TicketMark";

export default function SiteHeader() {
  return (
    <header className="site-chrome fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
      <Link
        href="/"
        className="nav-pill group px-4 py-2.5 text-sm font-semibold tracking-tight"
      >
        <TicketMark />
        <span>
          AiOS SF <span className="font-display tracking-tight">Lightning</span>
        </span>
      </Link>

      <nav className="glass-pill px-4 py-2 text-sm">
        <Link
          href="/board"
          className="font-mono text-[10px] font-bold tracking-[0.22em] text-paper/80 uppercase transition hover:text-paper"
        >
          Board
        </Link>

        <AuthLoading>
          <span className="font-mono text-[10px] tracking-[0.22em] text-muted uppercase">
            Wait
          </span>
        </AuthLoading>

        <Authenticated>
          <Link
            href="/apply"
            className="font-mono text-[10px] font-bold tracking-[0.22em] text-paper/80 uppercase transition hover:text-paper"
          >
            My slot
          </Link>
          <UserButton />
        </Authenticated>

        <Unauthenticated>
          <SignInButton mode="modal" forceRedirectUrl="/apply">
            <button className="font-mono text-[10px] font-bold tracking-[0.22em] text-paper uppercase">
              Sign in
            </button>
          </SignInButton>
        </Unauthenticated>
      </nav>
    </header>
  );
}
