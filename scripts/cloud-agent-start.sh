#!/usr/bin/env bash
set -euo pipefail

# Per-boot Convex watcher plus Next.js. --start keeps both in one process.
# https://docs.convex.dev/cli/reference/dev
# https://docs.convex.dev/quickstart/bun

export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
export PATH="$BUN_INSTALL/bin:$PATH"

# auth.config.ts reads CLERK_JWT_ISSUER_DOMAIN during the function push.
# Skip Convex when the issuer is unset so public pages still come up with
# zero secrets. Install uses the same guard.
if [[ -z "${CLERK_JWT_ISSUER_DOMAIN:-}" ]]; then
  echo "CLERK_JWT_ISSUER_DOMAIN is unset; starting bun dev without Convex." >&2
  exec bun dev
fi

exec bunx convex dev --start 'bun dev'
