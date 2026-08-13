#!/usr/bin/env bash
set -euo pipefail

# Per-boot Convex watcher plus Next.js. --start keeps both in one process.
# https://docs.convex.dev/cli/reference/dev
# https://docs.convex.dev/quickstart/bun

export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
export PATH="$BUN_INSTALL/bin:$PATH"

exec bunx convex dev --start 'bun dev'
