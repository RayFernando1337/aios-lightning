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

# Cloud agents cannot log in; --once provisions a local backend.
# Public queries (landing, board) still push with Clerk unset.
# https://docs.convex.dev/cli/agent-mode
export CONVEX_AGENT_MODE="${CONVEX_AGENT_MODE:-anonymous}"
bunx convex init

if [[ -n "${HOST_EMAILS:-}" ]]; then
  bunx convex env set HOST_EMAILS "$HOST_EMAILS"
fi

# auth.config.ts always reads this. A placeholder lets --once push public
# functions when Clerk is unset. Gated routes still need the real issuer.
bunx convex env set CLERK_JWT_ISSUER_DOMAIN \
  "${CLERK_JWT_ISSUER_DOMAIN:-https://unused.clerk.accounts.dev}"

bunx convex dev --once
