import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const clerkKeysPresent = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

/**
 * Supplies Clerk auth context to the server helpers. It guards nothing by
 * itself: `/apply` and `/host` check the signed in user where they read data,
 * and every Convex function checks again on the backend.
 *
 * With no Clerk keys the app renders a setup checklist, so requests pass
 * through rather than every route failing here.
 */
export default clerkKeysPresent ? clerkMiddleware() : () => NextResponse.next();

export const config = {
  matcher: [
    // Only the routes that read the signed in user on the server. Clerk's
    // middleware redirects a fresh browser to Clerk before rendering, so
    // keeping `/` and `/board` off this list means the landing page and the
    // projector board still render if Clerk is slow or unreachable.
    "/apply(.*)",
    "/e/(.*)/apply(.*)",
    "/host(.*)",
    "/(api|trpc)(.*)",
    // Always run for Clerk's frontend API routes
    "/__clerk/(.*)",
  ],
};
