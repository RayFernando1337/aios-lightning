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
import MoveSignupControl from "@/components/MoveSignupControl";
import StatusChip from "@/components/StatusChip";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { FIELD_LIMITS } from "@/convex/lib/limits";
import { readableError } from "@/lib/errors";
import { eventApplyPath } from "@/lib/paths";
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

type ApplyFormProps = {
  slug?: string;
  eventId: Id<"events">;
  applyHref: string;
  boardHref: string;
  capacity: number;
  dryRun: string;
  phase: "open" | "closed";
  eventName: string;
  eventWhen: string;
  eventRoom: string;
};

function eventLine(name: string, when: string, room: string): string {
  return room.length > 0 ? `${name} · ${when} · ${room}` : `${name} · ${when}`;
}

export default function ApplyForm(props: ApplyFormProps) {
  return (
    <>
      <AuthLoading>
        <p className="text-muted">Checking your session...</p>
      </AuthLoading>

      <Unauthenticated>
        <div className={card}>
          <p className={eyebrow}>{props.eventName}</p>
          <p className="mt-2 font-semibold">Sign in to apply.</p>
          <p className="mt-1 text-sm text-muted">
            {eventLine(props.eventName, props.eventWhen, props.eventRoom)}. One
            account, one slot on this night.
          </p>
          <div className="mt-4">
            <SignInButton mode="modal" forceRedirectUrl={props.applyHref}>
              <button className={buttonPrimary}>Sign in</button>
            </SignInButton>
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        <ApplyFlow {...props} />
      </Authenticated>
    </>
  );
}

function ApplyFlow(props: ApplyFormProps) {
  const queryArgs = props.slug !== undefined ? { slug: props.slug } : {};
  const mine = useQuery(api.submissions.mine, queryArgs);
  const mineAll = useQuery(api.submissions.mineAll);
  const openNights = useQuery(api.events.listOpen);
  const { user } = useUser();
  const [editing, setEditing] = useState(false);

  if (mine === undefined) {
    return <p className="text-muted">Loading your application...</p>;
  }

  if (mine === null && props.phase === "closed") {
    return (
      <div className={card}>
        <p className="font-semibold">Applications are closed.</p>
        <p className="mt-1 text-sm text-muted">
          {eventLine(props.eventName, props.eventWhen, props.eventRoom)} is no
          longer taking new demos.
        </p>
        <div className="mt-4">
          <Link href={props.boardHref} className={buttonSecondary}>
            See the board
          </Link>
        </div>
      </div>
    );
  }

  const otherSignups = (mineAll ?? []).filter(
    (row) => row.eventId !== props.eventId,
  );
  const nights = openNights ?? [];

  if (mine !== null && !editing) {
    return (
      <SubmittedCard
        submission={mine}
        boardHref={props.boardHref}
        capacity={props.capacity}
        dryRun={props.dryRun}
        eventName={props.eventName}
        eventWhen={props.eventWhen}
        eventRoom={props.eventRoom}
        eventId={props.eventId}
        openNights={nights}
        onEdit={() => setEditing(true)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <EventIdentity
        eventName={props.eventName}
        eventWhen={props.eventWhen}
        eventRoom={props.eventRoom}
      />
      {mine === null && otherSignups.length > 0 && (
        <OtherNightBanner
          signups={otherSignups}
          toEventId={props.eventId}
        />
      )}
      <Fields
        key={mine?._id ?? "new"}
        existing={mine}
        slug={props.slug}
        fallbackName={user?.fullName ?? user?.firstName ?? ""}
        onSaved={() => setEditing(false)}
        secondTalk={mine === null && otherSignups.length > 0}
      />
    </div>
  );
}

function EventIdentity({
  eventName,
  eventWhen,
  eventRoom,
}: {
  eventName: string;
  eventWhen: string;
  eventRoom: string;
}) {
  return (
    <div>
      <p className={eyebrow}>This night</p>
      <p className="font-display mt-2 text-3xl tracking-[-0.035em] text-paper">
        {eventName}
      </p>
      <p className="mt-1 font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
        {eventRoom.length > 0 ? `${eventWhen} · ${eventRoom}` : eventWhen}
      </p>
    </div>
  );
}

function OtherNightBanner({
  signups,
  toEventId,
}: {
  signups: {
    _id: Id<"submissions">;
    eventName: string;
    eventWhen: string;
    eventRoom: string;
  }[];
  toEventId: Id<"events">;
}) {
  const first = signups[0];
  if (first === undefined) {
    return null;
  }

  return (
    <div className="border border-admit/40 bg-admit/10 p-5 sm:p-6">
      <p className={eyebrow}>Wrong room?</p>
      <p className="mt-2 text-sm text-cream/90">
        You&apos;re already signed up for {first.eventName} ({first.eventWhen}
        {first.eventRoom.length > 0 ? ` · ${first.eventRoom}` : ""}).
        Submitting here creates a second talk. Move that signup here instead?
      </p>
      <div className="mt-4">
        <MoveSignupControl
          submissionId={first._id}
          targets={[{ id: toEventId, label: "This night" }]}
          defaultTarget={toEventId}
          primaryLabel="Move that signup here"
        />
      </div>
    </div>
  );
}

function SubmittedCard({
  submission,
  boardHref,
  capacity,
  dryRun,
  eventName,
  eventWhen,
  eventRoom,
  eventId,
  openNights,
  onEdit,
}: {
  submission: Doc<"submissions">;
  boardHref: string;
  capacity: number;
  dryRun: string;
  eventName: string;
  eventWhen: string;
  eventRoom: string;
  eventId: Id<"events">;
  openNights: {
    _id: Id<"events">;
    slug: string;
    name: string;
    when: string;
    room: string;
  }[];
  onEdit: () => void;
}) {
  const isOut = submission.status === "rejected";
  const others = openNights.filter((night) => night._id !== eventId);

  return (
    <div className="space-y-4">
      <EventIdentity
        eventName={eventName}
        eventWhen={eventWhen}
        eventRoom={eventRoom}
      />
      <div className={card}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className={eyebrow}>
              {isOut ? "Your application" : "You are in"}
            </p>
            <h2 className="font-display mt-2 text-3xl tracking-[-0.035em]">
              {submission.demoTitle}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {submission.displayName}
            </p>
          </div>
          <StatusChip status={submission.status} />
        </div>

        <p className="mt-4 text-cream/90">
          {APPLICANT_NEXT_STEP[submission.status]}
        </p>

        <dl className="mt-5 space-y-4 border-t border-line pt-5 text-sm">
          <div>
            <dt className="font-mono text-[11px] tracking-[0.22em] text-paper uppercase">
              Showing live
            </dt>
            <dd className="mt-1 whitespace-pre-line text-muted">
              {submission.whatYoullShowLive}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] tracking-[0.22em] text-paper uppercase">
              Takeaway
            </dt>
            <dd className="mt-1 whitespace-pre-line text-muted">
              {submission.takeaway}
            </dd>
          </div>
        </dl>
      </div>

      {!isOut && (
        <div className="border border-admit/40 bg-admit/10 p-5 sm:p-6">
          <p className={eyebrow}>Two things left</p>
          <ol className="mt-3 space-y-2 text-sm text-cream/90">
            <li>
              1. Hosts pick up to {capacity} demos. Watch the{" "}
              <Link href={boardHref} className="underline hover:text-paper">
                board
              </Link>
              .
            </li>
            <li>2. {dryRun}</li>
          </ol>
        </div>
      )}

      {others.length > 0 && (
        <div className={card}>
          <p className={eyebrow}>Wrong room?</p>
          <p className="mt-2 text-sm text-muted">
            Move this signup onto another open night.
            {submission.status === "selected"
              ? " A selected talk re-enters the new night as shortlisted."
              : ""}
          </p>
          <div className="mt-4">
            <MoveSignupControl
              submissionId={submission._id}
              targets={others.map((night) => ({
                id: night._id,
                label:
                  night.room.length > 0
                    ? `${night.name} · ${night.when} · ${night.room}`
                    : `${night.name} · ${night.when}`,
                href: eventApplyPath(night.slug),
              }))}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={onEdit} className={buttonSecondary}>
          Edit my application
        </button>
        <Link href={boardHref} className={buttonSecondary}>
          See the board
        </Link>
      </div>
    </div>
  );
}

function Fields({
  existing,
  slug,
  fallbackName,
  onSaved,
  secondTalk,
}: {
  existing: Doc<"submissions"> | null;
  slug?: string;
  fallbackName: string;
  onSaved: () => void;
  secondTalk: boolean;
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
        ...(slug !== undefined ? { slug } : {}),
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
              What is on screen, what is running, and on what device. Open with
              it. Hosts pick from the first couple of lines.
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
        <p className="border border-admit/40 bg-admit/10 px-4 py-3 text-sm text-paper">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          className={secondTalk ? buttonSecondary : buttonPrimary}
          disabled={saving}
        >
          {saving
            ? "Sending..."
            : existing !== null
              ? "Save changes"
              : secondTalk
                ? "Sign up for this night too"
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
        className="mt-0.5 size-5 shrink-0 border-line accent-admit"
        required
      />
      <span className="text-sm text-cream/90">{label}</span>
    </label>
  );
}
