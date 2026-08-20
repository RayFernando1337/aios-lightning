"use client";

import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { readableError } from "@/lib/errors";
import { buttonPrimary, input } from "@/lib/styles";

export default function MoveSignupControl({
  submissionId,
  targets,
  defaultTarget,
  primaryLabel = "Move",
  onMoved,
}: {
  submissionId: Id<"submissions">;
  targets: { id: Id<"events">; label: string; href?: string }[];
  defaultTarget?: Id<"events">;
  primaryLabel?: string;
  onMoved?: (targetId: Id<"events">) => void;
}) {
  const router = useRouter();
  const move = useMutation(api.submissions.move);
  const [targetId, setTargetId] = useState<string>(
    defaultTarget ?? targets[0]?.id ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleMove() {
    const target = targets.find((night) => night.id === targetId);
    if (target === undefined) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await move({ submissionId, toEventId: target.id });
      if (target.href !== undefined) {
        router.push(target.href);
      }
      onMoved?.(target.id);
    } catch (caught) {
      setError(readableError(caught));
    } finally {
      setSaving(false);
    }
  }

  if (targets.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {targets.length > 1 && (
        <select
          className={input}
          value={targetId}
          onChange={(event) => setTargetId(event.target.value)}
        >
          {targets.map((night) => (
            <option key={night.id} value={night.id}>
              {night.label}
            </option>
          ))}
        </select>
      )}
      <button
        type="button"
        className={buttonPrimary}
        disabled={saving || targetId === ""}
        onClick={() => void handleMove()}
      >
        {saving ? "Moving..." : primaryLabel}
      </button>
      {error !== null && (
        <p className="border border-admit/40 bg-admit/10 px-4 py-3 text-sm text-paper">
          {error}
        </p>
      )}
    </div>
  );
}
