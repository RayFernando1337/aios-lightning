"use client";

import { Component, ReactNode } from "react";
import { readableError } from "@/lib/errors";
import { card } from "@/lib/styles";

/**
 * Convex rejects host queries it does not trust, which would otherwise take the
 * whole page down mid event. The most likely cause is HOST_EMAILS being set for
 * Next.js but not on the Convex deployment, so say so.
 */
export default class HostErrorBoundary extends Component<
  { children: ReactNode },
  { message: string | null }
> {
  state = { message: null as string | null };

  static getDerivedStateFromError(error: unknown) {
    return { message: readableError(error) };
  }

  render() {
    if (this.state.message !== null) {
      return (
        <div className={card}>
          <p className="font-semibold">The host view could not load.</p>
          <p className="mt-2 text-sm text-paper">{this.state.message}</p>
          <p className="mt-3 text-sm text-muted">
            HOST_EMAILS has to be set on the Convex deployment too, not only
            here. Check the Convex dashboard, then reload.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
