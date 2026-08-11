"use client";

import { SignInButton, useUser } from "@clerk/nextjs";
import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useMutation,
  useQuery,
} from "convex/react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import StatusChip from "@/components/StatusChip";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { FIELD_LIMITS, MAX_SELECTED } from "@/convex/lib/limits";
import { EVENT } from "@/lib/content";
import { readableError } from "@/lib/errors";
import { APPLICANT_NEXT_STEP } from "@/lib/status";
import {
  buttonPrimary,
  buttonSecondary,
  card,
  eyebrow,
  fieldHint,
  fieldLabel,
  input,
} from "@/lib/styles";

export default function ApplyForm() {
  return (
    <>
      <AuthLoading>
        <p className="text-zinc-400">Checking your session...</p>
      </AuthLoading>

      <Unauthenticated>
        <div className={card}>
          <p className="font-semibold">Sign in to apply.</p>
          <p className="mt-1 text-sm text-zinc-400">
            One account, one slot. It keeps the list honest.
          </p>
          <div className="mt-4">
            <SignInButton mode="modal" forceRedirectUrl="/apply">
              <button className={buttonPrimary}>Sign in</button>
            </SignInButton>
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        <ApplyFlow />
      </Authenticated>
    </>
  );
}

function ApplyFlow() {
  const mine = useQuery(api.submissions.mySubmission);
  const { user } = useUser();
  const [editing, setEditing] = useState(false);

  if (mine === undefined) {
    return <p className="text-zinc-400">Loading your application...</p>;
  }

  if (mine !== null && !editing) {
    return (
      <SubmittedCard submission={mine} onEdit={() => setEditing(true)} />
    );
  }

  return (
    <Fields
      key={mine?._id ?? "new"}
      existing={mine}
      fallbackName={user?.fullName ?? user?.firstName ?? ""}
      onSaved={() => setEditing(false)}
    />
  );
}

function SubmittedCard({
  submission,
  onEdit,
}: {
  submission: Doc<"submissions">;
  onEdit: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className={card}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className={eyebrow}>You are in</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              {submission.demoTitle}
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              {submission.displayName}
            </p>
          </div>
          <StatusChip status={submission.status} />
        </div>

        <p className="mt-4 text-zinc-200">
          {APPLICANT_NEXT_STEP[submission.status]}
        </p>

        <dl className="mt-5 space-y-4 border-t border-white/10 pt-5 text-sm">
          <div>
            <dt className="font-semibold text-zinc-300">Showing live</dt>
            <dd className="mt-1 whitespace-pre-line text-zinc-400">
              {submission.whatYoullShowLive}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-zinc-300">Takeaway</dt>
            <dd className="mt-1 whitespace-pre-line text-zinc-400">
              {submission.takeaway}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-amber-300/25 bg-amber-300/[0.07] p-5 sm:p-6">
        <p className={eyebrow}>Two things left</p>
        <ol className="mt-3 space-y-2 text-sm text-zinc-200">
          <li>
            1. Hosts pick up to {MAX_SELECTED} demos. Watch the{" "}
            <Link href="/board" className="underline hover:text-amber-200">
              board
            </Link>
            .
          </li>
          <li>2. {EVENT.dryRun}</li>
        </ol>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={onEdit} className={buttonSecondary}>
          Edit my application
        </button>
        <Link href="/board" className={buttonSecondary}>
          See the board
        </Link>
      </div>
    </div>
  );
}

function Fields({
  existing,
  fallbackName,
  onSaved,
}: {
  existing: Doc<"submissions"> | null;
  fallbackName: string;
  onSaved: () => void;
}) {
  const submit = useMutation(api.submissions.submit);

  const [displayName, setDisplayName] = useState(
    existing?.displayName ?? fallbackName,
  );
  const [demoTitle, setDemoTitle] = useState(existing?.demoTitle ?? "");
  const [whatYoullShowLive, setWhatYoullShowLive] = useState(
    existing?.whatYoullShowLive ?? "",
  );
  const [takeaway, setTakeaway] = useState(existing?.takeaway ?? "");
  const [noSlides, setNoSlides] = useState(existing?.noSlides ?? false);
  const [noPitch, setNoPitch] = useState(existing?.noPitch ?? false);
  const [readyIn60s, setReadyIn60s] = useState(existing?.readyIn60s ?? false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await submit({
        displayName,
        demoTitle,
        whatYoullShowLive,
        takeaway,
        noSlides,
        noPitch,
        readyIn60s,
      });
      onSaved();
    } catch (caught) {
      setError(readableError(caught));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className={card}>
        <div className="space-y-5">
          <div>
            <label htmlFor="displayName" className={fieldLabel}>
              Your name
            </label>
            <p className={fieldHint}>How the host should read it out.</p>
            <input
              id="displayName"
              className={`${input} mt-2`}
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              maxLength={FIELD_LIMITS.displayName}
              placeholder="Ray Fernando"
              required
            />
          </div>

          <div>
            <label htmlFor="demoTitle" className={fieldLabel}>
              Demo title
            </label>
            <p className={fieldHint}>Six words or fewer lands best.</p>
            <input
              id="demoTitle"
              className={`${input} mt-2`}
              value={demoTitle}
              onChange={(event) => setDemoTitle(event.target.value)}
              maxLength={FIELD_LIMITS.demoTitle}
              placeholder="On device Whisper in a Swift app"
              required
            />
          </div>

          <div>
            <label htmlFor="whatYoullShowLive" className={fieldLabel}>
              What you will show live
            </label>
            <p className={fieldHint}>
              What is on screen, what is running, and on what device.
            </p>
            <textarea
              id="whatYoullShowLive"
              className={`${input} mt-2 min-h-28`}
              value={whatYoullShowLive}
              onChange={(event) => setWhatYoullShowLive(event.target.value)}
              maxLength={FIELD_LIMITS.whatYoullShowLive}
              placeholder="iPhone 16 on stage mirror, local model transcribing me in real time, no network."
              required
            />
          </div>

          <div>
            <label htmlFor="takeaway" className={fieldLabel}>
              One takeaway for the room
            </label>
            <p className={fieldHint}>
              What can someone go try tomorrow because they watched you?
            </p>
            <textarea
              id="takeaway"
              className={`${input} mt-2 min-h-24`}
              value={takeaway}
              onChange={(event) => setTakeaway(event.target.value)}
              maxLength={FIELD_LIMITS.takeaway}
              placeholder="How to ship a Core ML model without blowing up app size."
              required
            />
          </div>
        </div>
      </div>

      <div className={card}>
        <p className={eyebrow}>Confirm the format</p>
        <div className="mt-4 space-y-4">
          <Checkbox
            id="noSlides"
            checked={noSlides}
            onChange={setNoSlides}
            label="No slides. Laptop or phone demo only."
          />
          <Checkbox
            id="noPitch"
            checked={noPitch}
            onChange={setNoPitch}
            label="No pitch. No downloads, no waitlists, no pricing."
          />
          <Checkbox
            id="readyIn60s"
            checked={readyIn60s}
            onChange={setReadyIn60s}
            label="I can be plugged in and running in 60 seconds."
          />
        </div>
      </div>

      {error !== null && (
        <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" className={buttonPrimary} disabled={saving}>
          {saving
            ? "Sending..."
            : existing !== null
              ? "Save changes"
              : "Submit my application"}
        </button>
        {existing !== null && (
          <button
            type="button"
            className={buttonSecondary}
            onClick={onSaved}
            disabled={saving}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function Checkbox({
  id,
  checked,
  onChange,
  label,
}: {
  id: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 size-5 shrink-0 rounded border-white/20 accent-amber-300"
        required
      />
      <span className="text-sm text-zinc-200">{label}</span>
    </label>
  );
}
