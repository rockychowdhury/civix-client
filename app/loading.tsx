"use client";

import { useEffect, useState } from "react";

export default function Loading() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const targetWord = "CIVIX";
  const cellCount = targetWord.length;

  const [cells, setCells] = useState<string[]>(
    Array(cellCount).fill(" "),
  );
  const [settled, setSettled] = useState<boolean[]>(
    Array(cellCount).fill(false),
  );

  useEffect(() => {
    const intervals: ReturnType<typeof setInterval>[] = [];

    for (let i = 0; i < cellCount; i++) {
      const settleDelay = 600 + i * 320;
      const flipSpeed = 60;

      const interval = setInterval(() => {
        setCells((prev) => {
          const next = [...prev];
          next[i] = chars[Math.floor(Math.random() * chars.length)];
          return next;
        });
      }, flipSpeed);

      intervals.push(interval);

      setTimeout(() => {
        clearInterval(interval);
        setCells((prev) => {
          const next = [...prev];
          next[i] = targetWord[i];
          return next;
        });
        setSettled((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, settleDelay);
    }

    const loopTimer = setTimeout(() => {
      setSettled(Array(cellCount).fill(false));
      setCells(Array(cellCount).fill(" "));
    }, 600 + cellCount * 320 + 1600);

    return () => {
      for (const interval of intervals) clearInterval(interval);
      clearTimeout(loopTimer);
    };
  }, [settled.every(Boolean) ? "restart" : "running"]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-paper">
      <div className="flex flex-col items-center gap-8">
        {/* Split-flap board cells */}
        <div
          className="flex items-center gap-1.5"
          role="status"
          aria-label="Loading"
        >
          {cells.map((char, i) => (
            <div
              key={i}
              className="relative flex h-14 w-11 items-center justify-center overflow-hidden rounded-[2px] bg-ink sm:h-16 sm:w-13"
            >
              {/* Top half shadow line */}
              <div className="absolute inset-x-0 top-1/2 z-10 h-px bg-ink/30" />

              <span
                className={`font-mono text-2xl font-medium tracking-widest sm:text-3xl ${
                  settled[i]
                    ? "text-signal-resolved"
                    : "text-paper/80"
                } transition-colors duration-100`}
              >
                {char}
              </span>

              {/* Corner pegs */}
              <div className="absolute left-1 top-1 size-1 rounded-full bg-paper/10" />
              <div className="absolute right-1 top-1 size-1 rounded-full bg-paper/10" />
              <div className="absolute bottom-1 left-1 size-1 rounded-full bg-paper/10" />
              <div className="absolute bottom-1 right-1 size-1 rounded-full bg-paper/10" />
            </div>
          ))}
        </div>

        {/* Pulsing dots */}
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-1.5 rounded-full bg-ledger"
              style={{
                animation: `dot-pulse 1.4s ease-in-out ${i * 200}ms infinite`,
              }}
            />
          ))}
        </div>

        <p className="font-body text-sm text-ink/50">
          Loading…
        </p>
      </div>
    </div>
  );
}
