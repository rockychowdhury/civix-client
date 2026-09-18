"use client";

import { useState, useRef } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";

const stops = [
  {
    id: 1,
    label: "Report",
    title: "Submit a complaint",
    description:
      "File a report with category, location, and photos through the Civix platform.",
    responsible: "You — the citizen",
  },
  {
    id: 2,
    label: "Route",
    title: "Automatic routing",
    description:
      "The system routes the report to the correct department based on category and location.",
    responsible: "Civix engine — automatic",
  },
  {
    id: 3,
    label: "Resolve",
    title: "Department action",
    description:
      "The responsible department works on the issue and updates its status.",
    responsible: "City department",
  },
  {
    id: 4,
    label: "Confirm",
    title: "Resolution confirmed",
    description:
      "You receive notification when the issue is resolved. The loop closes.",
    responsible: "Civix + City",
  },
];

export function HowCivixWorks() {
  const [active, setActive] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const totalScroll = scrollWidth - clientWidth;
    if (totalScroll > 0) {
      const progress = scrollLeft / totalScroll;
      const stopIndex = Math.round(progress * (stops.length - 1));
      setActive(Math.max(1, Math.min(stops.length, stopIndex + 1)));
    }
  };

  return (
    <section
      aria-labelledby="how-it-works-heading"
      style={{
        padding: "var(--space-7) var(--space-2) var(--space-5)",
      }}
    >
      <div className="container">
        <h2
          id="how-it-works-heading"
          className="visually-hidden"
        >
          How Civix Works
        </h2>

        <div
          ref={scrollRef}
          style={{
            position: "relative",
            overflow: "hidden",
            margin: "0 calc(-1 * var(--space-2))",
            padding: "0 var(--space-2)",
          }}
          onScroll={handleScroll}
        >
          <div
            style={{
              position: "relative",
              display: "flex",
              gap: "var(--space-4)",
              padding: "var(--space-4) 0",
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              scrollBehavior: prefersReducedMotion ? "auto" : "smooth",
              scrollPadding: "0 var(--space-2)",
            }}
            onScroll={handleScroll}
          >
            {stops.map((stop, i) => {
              const isActive = stop.id === active;
              const stopProgress = (stop.id - 1) / (stops.length - 1);

              return (
                <div
                  key={stop.id}
                  style={{
                    flex: "0 0 auto",
                    width: "clamp(220px, 30vw, 280px)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "var(--space-2)",
                    scrollSnapAlign: "center",
                    padding: "var(--space-2) var(--space-1)",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "var(--space-2)",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        zIndex: 2,
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        border: "3px solid",
                        background:
                          isActive || stopProgress < active / stops.length
                            ? "var(--color-ledger)"
                            : "var(--color-paper)",
                        borderColor:
                          isActive || stopProgress < active / stops.length
                            ? "var(--color-ledger)"
                            : "var(--color-line)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.3s ease",
                        boxShadow:
                          isActive
                            ? "0 0 0 4px rgba(46, 64, 52, 0.15)"
                            : "none",
                      }}
                      aria-hidden="true"
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: "700",
                          fontSize: "1.25rem",
                          color:
                            isActive || stopProgress < active / stops.length
                              ? "var(--color-paper)"
                              : "var(--color-line)",
                        }}
                      >
                        {stop.id}
                      </span>
                    </div>

                    {i < stops.length - 1 && (
                      <div
                        style={{
                          position: "absolute",
                          top: "22px",
                          left: "50%",
                          width: "calc(100% - 48px)",
                          height: "3px",
                          background: "var(--color-line)",
                          zIndex: 1,
                        }}
                        aria-hidden="true"
                      >
                        <div
                          style={{
                            width: `${Math.min(100, (active / stops.length) * 100)}%`,
                            height: "100%",
                            background: "var(--color-ledger)",
                            transition: "width 0.4s ease",
                            transformOrigin: "left",
                          }}
                          aria-hidden="true"
                        />
                      </div>
                    )}

                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.875rem",
                        fontWeight: isActive ? "500" : "400",
                        color: isActive ? "var(--color-ink)" : "rgba(28, 27, 25, 0.6)",
                        textAlign: "center",
                        margin: 0,
                        lineHeight: "1.3",
                      }}
                    >
                      {stop.label}
                    </p>
                  </div>

                  <div
                    style={{
                      width: "100%",
                      textAlign: "center",
                      opacity: isActive ? 1 : 0.5,
                      transition: "opacity 0.3s ease",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.8125rem",
                        color: "var(--color-ink)",
                        lineHeight: "1.5",
                        margin: "0 0 var(--space-1)",
                      }}
                    >
                      {stop.title}
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.75rem",
                        color: "var(--color-ink)",
                        opacity: 0.6,
                        lineHeight: "1.5",
                        margin: 0,
                      }}
                    >
                      {stop.description}
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.6875rem",
                        color: "var(--color-ledger)",
                        margin: "var(--space-1) 0 0",
                        fontWeight: "500",
                      }}
                    >
                      → {stop.responsible}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}