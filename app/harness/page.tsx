"use client";

import { notFound } from "next/navigation";
import { useState } from "react";
import { SubmissionRow, toTriageCard } from "@/components/HostDashboard";
import { MAX_SELECTED } from "@/convex/lib/limits";
import { Id } from "@/convex/_generated/dataModel";
import { SubmissionStatus } from "@/lib/status";
import { card } from "@/lib/styles";
import { FIXTURES } from "./fixtures";

/**
 * The host card at any viewport without Clerk, Convex, or nine real applicants.
 * `/host` needs a signed in allowlisted account and live data, which puts the
 * one screen a host makes decisions on out of reach of a quick check. The
 * fixtures pin every text field to its `FIELD_LIMITS` maximum, which is the
 * case that decides whether the card layout holds.
 */
export default function Harness() {
  const [rows, setRows] = useState(FIXTURES);
  const [refused, setRefused] = useState<Id<"submissions"> | null>(null);

  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  function change(id: Id<"submissions">, status: SubmissionStatus) {
    const selected = rows.filter((row) => row.status === "selected").length;

    if (status === "selected" && selected >= MAX_SELECTED) {
      setRefused(id);
      return;
    }

    setRefused(null);
    setRows((current) =>
      current.map((row) => (row._id === id ? { ...row, status } : row)),
    );
  }

  return (
    // The browser harness waits on this before clicking, so it never drives a
    // tree that React has not hydrated yet.
    <main
      data-harness-ready="true"
      className="mx-auto w-full max-w-2xl px-5 pt-8 pb-16"
    >
      <script
        id="fixtures"
        type="application/json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FIXTURES) }}
      />
      <ul className="space-y-3">
        {rows.map((submission) => (
          <li key={submission._id} className={card} data-row={submission._id}>
            <SubmissionRow
              card={toTriageCard(submission)}
              pending={false}
              failure={
                refused === submission._id
                  ? `All ${MAX_SELECTED} slots are taken. Move someone out of selected first.`
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
