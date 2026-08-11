import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Do not write AGENTS.md and CLAUDE.md into the repo on dev server start.
  agentRules: false,
};

export default nextConfig;
