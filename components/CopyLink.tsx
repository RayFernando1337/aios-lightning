"use client";

import { useState } from "react";
import { buttonSecondary, input } from "@/lib/styles";

export default function CopyLink({
  path,
  label = "Copy",
}: {
  path: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  async function copy() {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setFailedUrl(null);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
      setFailedUrl(url);
    }
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
      <code className="min-w-0 truncate font-mono text-[11px] tracking-[0.08em] text-cream/85">
        {path}
      </code>
      <button
        type="button"
        onClick={() => void copy()}
        className={buttonSecondary}
      >
        {copied ? "Copied" : failedUrl !== null ? "Copy failed" : label}
      </button>
      {failedUrl !== null && (
        <input
          className={input}
          value={failedUrl}
          readOnly
          aria-label="Link"
          onFocus={(event) => event.currentTarget.select()}
        />
      )}
    </div>
  );
}
