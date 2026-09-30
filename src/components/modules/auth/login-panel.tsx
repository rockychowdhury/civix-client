"use client";

import { useEffect, useState } from "react";

const excerpts = [
  {
    text: "The leak had been running for weeks. I filed on a Tuesday — by Friday there was a crew on the street and a photo in the case file.",
    meta: "Water leak · CVX-2026-004821 · resolved in 3 days",
  },
  {
    text: "I didn't expect a reply, let alone a fixed streetlight. The tracking number is what changed it — someone owned it the whole way.",
    meta: "Streetlight outage · CVX-2026-003704 · resolved in 2 days",
  },
];

const ROTATION_MS = 7000;

export function LoginPanel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((current) => (current + 1) % excerpts.length),
      ROTATION_MS,
    );
    return () => clearInterval(id);
  }, []);

  const excerpt = excerpts[index];

  return (
    <div className="w-full max-w-[460px]">
      <p className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-signal-resolved">
        Resolved stories
      </p>
      <blockquote key={index} className="mt-8 animate-overlay-in motion-reduce:animate-none">
        <p className="font-display text-[clamp(1.375rem,2.5vw,1.75rem)] leading-snug text-paper">
          &ldquo;{excerpt.text}&rdquo;
        </p>
        <footer className="mt-5 font-mono text-xs text-paper/60">{excerpt.meta}</footer>
      </blockquote>
    </div>
  );
}
