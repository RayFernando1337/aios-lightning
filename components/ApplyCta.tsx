"use client";

import { SignInButton } from "@clerk/nextjs";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import Link from "next/link";
import { buttonPrimary } from "@/lib/styles";

export default function ApplyCta() {
  return (
    <>
      <AuthLoading>
        <span className={`${buttonPrimary} pointer-events-none opacity-60`}>
          Loading
        </span>
      </AuthLoading>

      <Authenticated>
        <Link href="/apply" className={buttonPrimary}>
          Apply for a slot
        </Link>
      </Authenticated>

      <Unauthenticated>
        <SignInButton mode="modal" forceRedirectUrl="/apply">
          <button className={buttonPrimary}>Sign in and apply</button>
        </SignInButton>
      </Unauthenticated>
    </>
  );
}
