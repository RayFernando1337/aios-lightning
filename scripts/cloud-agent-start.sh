#!/usr/bin/env bash
set -euo pipefail

# Per-boot Convex watcher plus Next.js. --start keeps both in one process.
# https://docs.convex.dev/cli/reference/dev
# https://docs.convex.dev/quickstart/bun

export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
export PATH="$BUN_INSTALL/bin:$PATH"

# auth.config.ts always reads CLERK_JWT_ISSUER_DOMAIN during the function push.
# Install sets a placeholder when Clerk is unset so the one-shot push succeeds.
# Keep the watcher running so later convex/ edits stay in sync; gated routes
# still need the real issuer.
export CLERK_JWT_ISSUER_DOMAIN="${CLERK_JWT_ISSUER_DOMAIN:-https://placeholder.invalid}"

exec bunx convex dev --start 'bun dev'
