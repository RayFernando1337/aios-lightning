# Agent instructions

## Cursor Cloud specific instructions

- Install: `./scripts/cloud-agent-install.sh`. That puts Bun on PATH, runs `bun install --frozen-lockfile`, then `bunx convex dev --once` so a local Convex backend exists (a placeholder `CLERK_JWT_ISSUER_DOMAIN` is set when Clerk is missing so the push still happens). Never commit secrets.
- Convex AI files: `bunx convex ai-files install` writes `convex/_generated/ai/guidelines.md` and the Convex section in this file. Read those guidelines before changing `convex/`. Keep `bunx convex dev` running and use `bunx convex logs` / `bunx convex run` to read function errors.
- Checks: `bun run lint`, `bun run typecheck`, `bun run build`. All three must pass. There is no test suite; the build is the gate.
- All three checks pass with zero env vars. With Clerk keys missing, every page renders a setup checklist instead of the app.
- Dev servers: `bunx convex dev` in one terminal and `bun dev` in another, or `./scripts/cloud-agent-start.sh` (`bunx convex dev --start 'bun dev'` when `CLERK_JWT_ISSUER_DOMAIN` is set; otherwise `bun dev` so public pages still come up).
- Cloud agents cannot run `convex login`. Leave `CONVEX_DEPLOY_KEY` unset so the CLI provisions a [local backend](https://docs.convex.dev/cli/agent-mode) automatically.
- Routes: `/` and `/board` are public. `/apply` and `/host` are Clerk-gated (see `proxy.ts`).
- Host access: `HOST_EMAILS` is required. It gates `/host` in Next.js and every host function in Convex. With it unset, nobody can open the host view.
- Convex: the client reads `NEXT_PUBLIC_CONVEX_URL` from env (written into `.env.local` by `bunx convex dev`). `convex/_generated` is committed, so no codegen runs at install time beyond the `--once` push.
- After changing `convex/`, keep `bunx convex dev` running so the local backend stays in sync. A code change alone does not update a cloud Convex deployment.
- When Clerk secrets are missing in the environment, prefer verifying UI changes against the Vercel preview deployment instead of running the gated flows locally.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
