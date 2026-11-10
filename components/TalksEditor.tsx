"use client";

import type { Talk } from "@/convex/lib/lineup";
import { TALK_FIELD_LIMITS } from "@/convex/lib/limits";
import { buttonSecondary, fieldLabel, input } from "@/lib/styles";

export type TalkDraft = {
  key: string;
  title: string;
  speakerName: string;
  affiliation: string;
  blurb: string;
  url: string;
};

const fields = [
  { name: "title", label: "Talk title", limit: TALK_FIELD_LIMITS.title, required: true },
  { name: "speakerName", label: "Speaker", limit: TALK_FIELD_LIMITS.speakerName, required: true },
  { name: "affiliation", label: "Affiliation", limit: TALK_FIELD_LIMITS.affiliation, required: false },
  { name: "url", label: "Link", limit: TALK_FIELD_LIMITS.url, required: false },
] as const;

export function talkDrafts(talks: Talk[] | undefined): TalkDraft[] {
  return (talks ?? []).map((talk) => ({
    key: crypto.randomUUID(),
    title: talk.title,
    speakerName: talk.speakerName,
    affiliation: talk.affiliation ?? "",
    blurb: talk.blurb ?? "",
    url: talk.url ?? "",
  }));
}

/** What the mutation takes. Convex trims and drops empty optional fields. */
export function talksFromDrafts(drafts: TalkDraft[]): Talk[] {
  return drafts.map((draft) => ({
    title: draft.title,
    speakerName: draft.speakerName,
    affiliation: draft.affiliation,
    blurb: draft.blurb,
    url: draft.url,
  }));
}

export default function TalksEditor({
  idPrefix,
  talks,
  onChange,
}: {
  idPrefix: string;
  talks: TalkDraft[];
  onChange: (next: TalkDraft[]) => void;
}) {
  function patch(index: number, next: Partial<TalkDraft>) {
    onChange(talks.map((talk, i) => (i === index ? { ...talk, ...next } : talk)));
  }

  function move(index: number, offset: -1 | 1) {
    const next = [...talks];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {talks.map((talk, index) => (
        <div key={talk.key} className="space-y-2 border border-dashed border-paper/25 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-[11px] font-bold tracking-[0.28em] text-admit uppercase">
              Talk {String(index + 1).padStart(2, "0")}
            </p>
            <div className="flex gap-1">
              <button
                type="button"
                className={`${buttonSecondary} px-3 py-2`}
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label={`Move talk ${index + 1} up`}
              >
                ↑
              </button>
              <button
                type="button"
                className={`${buttonSecondary} px-3 py-2`}
                onClick={() => move(index, 1)}
                disabled={index === talks.length - 1}
                aria-label={`Move talk ${index + 1} down`}
              >
                ↓
              </button>
              <button
                type="button"
                className={`${buttonSecondary} px-3 py-2`}
                onClick={() => onChange(talks.filter((_, i) => i !== index))}
              >
                Remove
              </button>
            </div>
          </div>
          {fields.map((field) => {
            const id = `${idPrefix}-talk-${talk.key}-${field.name}`;
            return (
              <div key={field.name}>
                <label htmlFor={id} className={fieldLabel}>
                  {field.label}
                  {!field.required && <span className="text-muted"> (optional)</span>}
                </label>
                <input
                  id={id}
                  className={`${input} mt-1`}
                  type={field.name === "url" ? "url" : "text"}
                  inputMode={field.name === "url" ? "url" : undefined}
                  value={talk[field.name]}
                  onChange={(event) => patch(index, { [field.name]: event.target.value })}
                  maxLength={field.limit}
                  placeholder={field.name === "url" ? "https://..." : undefined}
                  required={field.required}
                />
              </div>
            );
          })}
          <div>
            <label htmlFor={`${idPrefix}-talk-${talk.key}-blurb`} className={fieldLabel}>
              Short blurb <span className="text-muted">(optional)</span>
            </label>
            <textarea
              id={`${idPrefix}-talk-${talk.key}-blurb`}
              className={`${input} mt-1 min-h-20`}
              value={talk.blurb}
              onChange={(event) => patch(index, { blurb: event.target.value })}
              maxLength={TALK_FIELD_LIMITS.blurb}
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        className={buttonSecondary}
        disabled={talks.length >= TALK_FIELD_LIMITS.count}
        onClick={() =>
          onChange([
            ...talks,
            { key: crypto.randomUUID(), title: "", speakerName: "", affiliation: "", blurb: "", url: "" },
          ])
        }
      >
        Add talk
      </button>
    </div>
  );
}
