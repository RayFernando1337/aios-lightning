"use client";

import { useMutation } from "convex/react";
import { useEffect } from "react";
import { api } from "@/convex/_generated/api";

export default function SeedIfEmpty() {
  const ensurePublicSeed = useMutation(api.events.ensurePublicSeed);

  useEffect(() => {
    void ensurePublicSeed({});
  }, [ensurePublicSeed]);

  return null;
}
