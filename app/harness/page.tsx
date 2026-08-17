"use client";

import { notFound } from "next/navigation";
import { useState } from "react";
import { SubmissionRow, toTriageCard } from "@/components/HostDashboard";
import { DEFAULT_CAPACITY } from "@/convex/lib/limits";
import { Id } from "@/convex/_generated/dataModel";
import { SubmissionStatus } from "@/lib/status";
import { card } from "@/lib/styles";
import { FIXTURES } from "./fixtures";

/** Exists because /host needs a Clerk host session and a live Convex deployment. */
export default function Harness() {
  const [rows, setRows] = useState(FIXTURES);
  const [refused, setRefused] = useState<Id<"submissions"> | null>(null);

  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  function change(id: Id<"submissions">, status: SubmissionStatus) {
    const selected = rows.filter((row) => row.status === "selected").length;

    if (status === "selected" && selected >= DEFAULT_CAPACITY) {
      setRefused(id);
      return;
    }

    setRefused(null);
    setRows((current) =>
      current.map((row) => (row._id === id ? { ...row, status } : row)),
    );
  }

  return (
    <main
      data-harness-ready="true"
      className="mx-auto w-full max-w-2xl px-[var(--pad)] pt-8 pb-16"
    >
      <script
        id="fixtures"
        type="application/json"
        // Escaped so a fixture containing "</script>" cannot break out of the tag.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(FIXTURES).replace(/</g, "\\u003c"),
        }}
      />
      <ul className="space-y-3">
        {rows.map((submission) => (
          <li key={submission._id} className={card} data-row={submission._id}>
            <SubmissionRow
              card={toTriageCard(submission)}
              pending={false}
              failure={
                refused === submission._id
                  ? `All ${DEFAULT_CAPACITY} slots are taken. Move someone out of selected first.`
                  : null
              }
              onChange={(status) => change(submission._id, status)}
            />
          </li>
        ))}
      </ul>
    </main>
  );
}
