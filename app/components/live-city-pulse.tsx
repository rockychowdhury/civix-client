"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";

const activities = [
  "Pothole reported on 4th Avenue — assigned to Roads Dept., 6 min ago",
  "Streetlight outage resolved in Ward 7 — 2 hrs ago",
  "Water leak reported on Main St — assigned to Utilities, 15 min ago",
  "Graffiti complaint filed in Arts District — pending review, 20 min ago",
  "Tree branch down on Oak St — assigned to Parks, 40 min ago",
  "Illegal dumping reported on Riverside Dr — assigned to Sanitation, 1 hr ago",
  "Traffic signal malfunction at Main & 5th — assigned to Transport, 3 hrs ago",
];

export function LiveCityPulse() {
  const prefersReducedMotion = useReducedMotion();
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion || !tickerRef.current) return;

    const ticker = tickerRef.current;
    const content = ticker.querySelector(".ticker-content");
    if (!content) return;

    let animationId: number;
    let position = 0;
    const speed = 0.3;

    const animate = () => {
      position -= speed;
      const contentWidth = content.scrollWidth;
      if (Math.abs(position) >= contentWidth / 2) {
        position = 0;
      }
      ticker.style.transform = `translateX(${position}px)`;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [prefersReducedMotion]);

  return (
    <section
      aria-label="Live city activity"
      style={{
        background: "rgba(46, 64, 52, 0.06)",
        padding: "var(--space-2) 0",
        borderTop: "1px solid var(--color-line)",
        borderBottom: "1px solid var(--color-line)",
        overflow: "hidden",
      }}
    >
      <div className="container">
        <div
          ref={tickerRef}
          className="ticker"
          style={{
            display: "flex",
            overflow: "hidden",
            width: "100%",
          }}
          aria-live="polite"
          aria-atomic="false"
        >
          <div
            className="ticker-content"
            style={{
              display: "flex",
              gap: "var(--space-6)",
              whiteSpace: "nowrap",
              willChange: "transform",
              animation: prefersReducedMotion ? "none" : "tickerScroll 30s linear infinite",
            }}
          >
            {activities.map((activity, i) => (
              <span
                key={i}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "clamp(0.8125rem, 1.5vw, 0.875rem)",
                  color: "var(--color-ink)",
                  opacity: 0.9,
                  fontVariant: "tabular-nums",
                  padding: "0 var(--space-1)",
                }}
              >
                {activity}
              </span>
            ))}
            {activities.map((activity, i) => (
              <span
                key={`${i}-clone`}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "clamp(0.8125rem, 1.5vw, 0.875rem)",
                  color: "var(--color-ink)",
                  opacity: 0.9,
                  fontVariant: "tabular-nums",
                  padding: "0 var(--space-1)",
                }}
              >
                {activity}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}