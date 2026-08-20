# Contributing

This is a small template for lightning-demo nights. Fixes and improvements that
help every event are welcome. Night-specific copy belongs on the event in
`/host`, not in a fork of the repo.

## Before you open a PR

```bash
bun install
bun run lint
bun run typecheck
bun run build
```

All three checks must pass. There is no test suite; the build is the gate.
`npm ci` still works from `package-lock.json` if you are not using Bun.

## Ground rules

- Keep diffs small and single-purpose.
- Convex functions keep validators on both args and returns.
- The `board` query is public. It must never return `email`, `userId`, or
  host-only fields.
- No secrets in the repo. `.env.local` stays untracked.
