"use client";

import { useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ReactNode, useState } from "react";

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  // Built lazily so the client is only constructed once NEXT_PUBLIC_CONVEX_URL
  // is known to be set (the layout renders the setup checklist otherwise).
  const [convex] = useState(
    () => new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!),
  );

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
