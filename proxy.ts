import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isSignedInOnly = createRouteMatcher(["/apply(.*)", "/host(.*)"]);

const clerkKeysPresent = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

// With no Clerk keys the app renders a setup checklist, so requests pass
// through rather than every route failing here.
export default clerkKeysPresent
  ? clerkMiddleware(async (auth, request) => {
      if (isSignedInOnly(request)) {
        await auth.protect();
      }
    })
  : () => NextResponse.next();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Always run for Clerk's frontend API routes
    "/__clerk/(.*)",
  ],
};
