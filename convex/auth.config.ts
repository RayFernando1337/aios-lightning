import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      // Clerk Frontend API URL, set as CLERK_JWT_ISSUER_DOMAIN on the Convex dashboard.
      // Dev looks like https://verb-noun-00.clerk.accounts.dev
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
