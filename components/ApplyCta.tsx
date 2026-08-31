"use client";

import { SignInButton } from "@clerk/nextjs";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import Link from "next/link";
import { buttonPrimary } from "@/lib/styles";

export default function ApplyCta({
  href = "/apply",
  label = "Apply for a slot",
  signedOutLabel = "Sign in and apply",
}: {
  href?: string;
  label?: string;
  signedOutLabel?: string;
}) {
  return (
    <>
      <AuthLoading>
        <span className={`${buttonPrimary} pointer-events-none opacity-60`}>
          Loading
        </span>
      </AuthLoading>

      <Authenticated>
        <Link href={href} className={buttonPrimary}>
          {label}
        </Link>
      </Authenticated>

      <Unauthenticated>
        <SignInButton mode="modal" forceRedirectUrl={href}>
          <button className={buttonPrimary}>{signedOutLabel}</button>
        </SignInButton>
      </Unauthenticated>
    </>
  );
}
