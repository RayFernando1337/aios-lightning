# Agent instructions

## Cursor Cloud specific instructions

- Install: `npm ci`. The lockfile is committed. Never commit secrets.
- Checks: `npm run lint`, `npm run typecheck`, `npm run build`. All three must pass. There is no test suite; the build is the gate.
- All three checks pass with zero env vars. With Clerk keys missing, every page renders a setup checklist instead of the app.
- Routes: `/` and `/board` are public. `/apply` and `/host` are Clerk-gated (see `proxy.ts`).
- Host access: `HOST_EMAILS` is required. It gates `/host` in Next.js and every host function in Convex. With it unset, nobody can open the host view.
- Convex: the client reads `NEXT_PUBLIC_CONVEX_URL` from env. `convex/_generated` is committed, so no codegen runs at install time.
- After changing `convex/`, the functions must be deployed by someone with `CONVEX_DEPLOY_KEY` or local Convex auth (`npx convex dev` or `npx convex deploy`). A code change alone does not update the deployment.
- When Clerk secrets are missing in the environment, prefer verifying UI changes against the Vercel preview deployment instead of running the gated flows locally.
