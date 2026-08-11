"use client";

import { SignInButton, UserButton } from "@clerk/nextjs";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import Link from "next/link";

/** Height is fixed at h-14 so sticky bars below can offset against it exactly. */
export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 h-14 border-b border-white/10 bg-[#08090c]/85 backdrop-blur">
      <div className="mx-auto flex h-full w-full max-w-3xl items-center justify-between gap-3 px-5">
        <Link href="/" className="text-sm font-bold tracking-tight sm:text-base">
          AiOS SF <span className="text-amber-300">· Lightning</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/board"
            className="text-sm text-zinc-400 transition hover:text-zinc-100"
          >
            Board
          </Link>

          <AuthLoading>
            <span className="text-sm text-zinc-500">...</span>
          </AuthLoading>

          <Authenticated>
            <Link
              href="/apply"
              className="text-sm text-zinc-300 transition hover:text-white"
            >
              My slot
            </Link>
            <UserButton />
          </Authenticated>

          <Unauthenticated>
            <SignInButton mode="modal" forceRedirectUrl="/apply">
              <button className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-medium transition hover:bg-white/10">
                Sign in
              </button>
            </SignInButton>
          </Unauthenticated>
        </div>
      </div>
    </header>
  );
}
