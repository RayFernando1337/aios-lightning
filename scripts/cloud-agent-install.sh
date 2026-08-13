#!/usr/bin/env bash
set -euo pipefail

# Idempotent Cloud Agent bootstrap: Bun, lockfile install, one-shot Convex push.
# Cloud agents cannot log in to Convex. In a non-interactive shell the CLI
# provisions a local backend instead of prompting.
# https://docs.convex.dev/cli/agent-mode

export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
export PATH="$BUN_INSTALL/bin:$PATH"

if [[ ! -x "$BUN_INSTALL/bin/bun" ]]; then
  curl -fsSL https://bun.com/install | bash
  export PATH="$BUN_INSTALL/bin:$PATH"
fi

if [[ -f bun.lock ]]; then
  bun install --frozen-lockfile
else
  bun install
fi

# auth.config.ts reads CLERK_JWT_ISSUER_DOMAIN from the process environment
# during the function push. Cloud agents cannot log in; --once then provisions
# a local backend. Skip the push when the issuer is unset so lint/typecheck/build
# still work with zero secrets.
if [[ -z "${CLERK_JWT_ISSUER_DOMAIN:-}" ]]; then
  echo "CLERK_JWT_ISSUER_DOMAIN is unset; skipping bunx convex dev --once." >&2
  echo "Set it to your Clerk Frontend API URL (https://verb-noun-00.clerk.accounts.dev) to sync functions." >&2
  exit 0
fi

if [[ -n "${HOST_EMAILS:-}" ]]; then
  bunx convex env set HOST_EMAILS "$HOST_EMAILS" || true
fi

bunx convex env set CLERK_JWT_ISSUER_DOMAIN "$CLERK_JWT_ISSUER_DOMAIN" || true
bunx convex dev --once
