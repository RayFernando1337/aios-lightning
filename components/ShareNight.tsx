"use client";

import { QRCodeSVG } from "qrcode.react";
import { useState, useSyncExternalStore } from "react";
import { eventApplyPath, eventPath } from "@/lib/paths";
import { buttonSecondary, eyebrow, fieldLabel, input } from "@/lib/styles";

const subscribeNever = () => () => {};

const smallButton =
  "inline-flex items-center justify-center border border-line bg-transparent px-3 py-1.5 font-mono text-[10px] font-bold tracking-[0.22em] text-muted uppercase transition hover:border-paper/40 hover:text-paper";

function CopyButton({ url, className }: { url: string; className: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
      window.setTimeout(() => setState("idle"), 1600);
    } catch {
      setState("failed");
    }
  }

  return (
    <>
      <button type="button" onClick={() => void copy()} className={className}>
        {state === "copied"
          ? "Copied"
          : state === "failed"
            ? "Copy failed"
            : "Copy"}
      </button>
      {state === "failed" && (
        <input
          className={input}
          value={url}
          readOnly
          aria-label="Link"
          onFocus={(event) => event.currentTarget.select()}
        />
      )}
    </>
  );
}

export default function ShareNight({
  slug,
  featured = false,
}: {
  slug: string;
  featured?: boolean;
}) {
  const origin = useSyncExternalStore(
    subscribeNever,
    () => window.location.origin,
    () => "",
  );

  const applyUrl = `${origin}${featured ? "/apply" : eventApplyPath(slug)}`;
  const nightUrl = `${origin}${featured ? "/" : eventPath(slug)}`;

  return (
    <div className="space-y-4">
      <p className={eyebrow}>Share this night</p>
      {origin !== "" && (
        <div className="inline-block bg-paper p-3">
          <QRCodeSVG
            value={applyUrl}
            size={168}
            bgColor="#fffdf8"
            fgColor="#171717"
            role="img"
            aria-label={`QR code for ${applyUrl}`}
          />
        </div>
      )}
      <div className="space-y-2">
        <p className={fieldLabel}>Guest apply link</p>
        <div className="flex flex-wrap items-center gap-3">
          <code className="min-w-0 break-all font-mono text-[11px] tracking-[0.08em] text-cream/85">
            {applyUrl}
          </code>
          <CopyButton url={applyUrl} className={buttonSecondary} />
        </div>
      </div>
      <div className="space-y-1.5">
        <p className="font-mono text-[10px] font-bold tracking-[0.24em] text-muted uppercase">
          Night page
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <code className="min-w-0 break-all font-mono text-[11px] tracking-[0.08em] text-muted">
            {nightUrl}
          </code>
          <CopyButton url={nightUrl} className={smallButton} />
        </div>
      </div>
    </div>
  );
}
