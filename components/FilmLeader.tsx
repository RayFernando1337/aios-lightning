"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { LEADER_COOKIE } from "@/lib/leader";

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getServerSnapshot() {
  return false;
}

function markPlayed() {
  document.cookie = `${LEADER_COOKIE}=1; path=/; max-age=86400; SameSite=Lax`;
}

export default function FilmLeader({
  alreadyPlayed,
}: {
  alreadyPlayed: boolean;
}) {
  const reduceMotion = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const skipped = alreadyPlayed || reduceMotion;
  const [count, setCount] = useState(3);
  const [opening, setOpening] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (skipped) {
      return;
    }

    const tick = window.setInterval(() => {
      setCount((current) => (current > 1 ? current - 1 : current));
    }, 700);
    const open = window.setTimeout(() => setOpening(true), 2100);
    const hide = window.setTimeout(() => {
      setGone(true);
      markPlayed();
    }, 3100);

    return () => {
      window.clearInterval(tick);
      window.clearTimeout(open);
      window.clearTimeout(hide);
    };
  }, [skipped]);

  if (skipped || gone) {
    return null;
  }

  return (
    <div
      className={`film-leader fixed inset-0 z-50 overflow-hidden ${
        opening ? "pointer-events-none" : ""
      }`}
      aria-hidden="true"
    >
      <div
        className={`velvet absolute inset-y-0 left-0 w-1/2 shadow-[inset_-40px_0_60px_rgba(0,0,0,.55)] transition-transform duration-700 ease-in ${
          opening ? "-translate-x-[104%]" : "translate-x-0"
        }`}
      />
      <div
        className={`velvet absolute inset-y-0 right-0 w-1/2 shadow-[inset_40px_0_60px_rgba(0,0,0,.55)] transition-transform duration-700 ease-in ${
          opening ? "translate-x-[104%]" : "translate-x-0"
        }`}
      />
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center gap-8 transition-opacity duration-300 ${
          opening ? "opacity-0" : "opacity-100"
        }`}
      >
        <p className="font-mono text-[11px] font-bold tracking-[0.4em] text-paper uppercase">
          Admit one
        </p>
        <div className="relative grid place-items-center">
          <div className="dial" />
          <p className="font-display absolute text-7xl leading-none tracking-[-0.035em] text-paper">
            {count}
          </p>
        </div>
        <p className="font-mono text-[10px] tracking-[0.3em] text-paper/70 uppercase">
          Picture start · 24 fps
        </p>
      </div>
    </div>
  );
}
