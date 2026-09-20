"use client";

import { useEffect, useState } from "react";

import { Container } from "./container";

const activities = [
  "Pothole reported on 4th Avenue — assigned to Roads Dept., 6 min ago",
  "Streetlight outage resolved in Ward 7 — 2 hrs ago",
  "Water leak reported on Main St — assigned to Utilities, 15 min ago",
  "Illegal dumping cleared on Riverside Dr — resolved, 1 hr ago",
  "Traffic signal malfunction at Main & 5th — assigned to Transport, 3 hrs ago",
  "Tree branch down on Oak St — assigned to Parks, 40 min ago",
];

const ROTATION_MS = 4500;

export function SplitFlapBoard() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((current) => (current + 1) % activities.length),
      ROTATION_MS,
    );
    return () => clearInterval(id);
  }, []);

  const words = activities[index].split(" ");

  const keyedWords = words.map((word) => ({
    word,
    id: `${index}-${word}`,
  }));

  return (
    <section
      aria-label="Live city activity"
      className="overflow-hidden border-y border-line bg-ledger/[0.06]"
    >
      <Container>
        <div className="flex items-center gap-4 py-3.5">
          <span className="flex shrink-0 items-center gap-2 font-body text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-ledger">
            <span
              aria-hidden="true"
              className="size-1.5 animate-dot rounded-full bg-signal-resolved motion-reduce:animate-none"
            />
            Live
          </span>
          <p
            aria-hidden="true"
            className="flex min-h-6 items-center gap-x-[0.4em] overflow-hidden font-mono text-[clamp(0.75rem,1.5vw,0.875rem)] leading-6 text-ink/90 [perspective:600px]"
          >
            {keyedWords.map((entry, i) => (
              <span
                key={entry.id}
                className="inline-block origin-top animate-flap whitespace-nowrap motion-reduce:animate-none"
                style={{ animationDelay: `${i * 28}ms` }}
              >
                {entry.word}
              </span>
            ))}
          </p>
        </div>
      </Container>
      <span className="sr-only">Recent activity: {activities.join(". ")}</span>
    </section>
  );
}
