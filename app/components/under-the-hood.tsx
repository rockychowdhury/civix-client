"use client";

import { useState, useRef, useEffect } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";

const drawerItems = [
  {
    id: 1,
    title: "Duplicate reports are automatically merged",
    explanation:
      "When two reports describe the same issue at the same location, Civix merges them into a single case, preventing duplicate work and keeping statistics accurate. The system uses location proximity and category matching to identify duplicates within minutes of submission.",
  },
  {
    id: 2,
    title: "SLA engine enforces deadlines",
    explanation:
      "Each report has a deadline by department based on issue category and severity. If a department misses it, the issue escalates automatically — no one has to ask twice. Escalation paths are configurable per municipality and tracked in the public audit log.",
  },
  {
    id: 3,
    title: "Auto-routing by category and location",
    explanation:
      "The platform categorizes every complaint and maps it to the correct municipal department without manual intervention. A rules engine evaluates 40+ factors — from GPS coordinates to departmental workload — to assign ownership in seconds, not days.",
  },
];

export function UnderTheHood() {
  const [open, setOpen] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (contentRefs.current.length !== drawerItems.length) {
      contentRefs.current = drawerItems.map(() => null);
    }
  }, []);

  const toggleDrawer = (id: number) => {
    setOpen((prev) => (prev === id ? null : id));
  };

  return (
    <section
      aria-labelledby="under-hood-heading"
      style={{
        padding: "var(--space-7) var(--space-2) var(--space-5)",
      }}
    >
      <div className="container" style={{ maxWidth: "640px" }}>
        <h2 id="under-hood-heading" className="visually-hidden">
          Under the Hood
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {drawerItems.map((item, index) => {
            const isOpen = open === item.id;

            return (
              <div
                key={item.id}
                style={{
                  borderTop: "1px solid var(--color-line)",
                }}
              >
                <button
                  onClick={() => toggleDrawer(item.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-3)",
                    padding: "var(--space-3) 0",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                  aria-expanded={isOpen}
                  aria-controls={`drawer-content-${item.id}`}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      width: "12px",
                      height: "12px",
                      border: "2px solid",
                      borderRadius: "2px",
                      borderColor: isOpen ? "var(--color-signal-resolved)" : "var(--color-line)",
                      background: isOpen ? "var(--color-signal-resolved)" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                    }}
                    aria-hidden="true"
                  >
                    {isOpen && (
                      <svg
                        width="8"
                        height="8"
                        viewBox="0 0 8 8"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M2 4L4 6L6 2"
                          stroke="var(--color-paper)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "clamp(1rem, 2vw, 1.125rem)",
                      fontWeight: isOpen ? "500" : "400",
                      color: "var(--color-ink)",
                      lineHeight: "1.4",
                      flex: 1,
                    }}
                  >
                    {item.title}
                  </span>
                </button>

                <div
                  id={`drawer-content-${item.id}`}
                  ref={(el) => {
                    contentRefs.current[index] = el;
                  }}
                  style={{
                    overflow: "hidden",
                    maxHeight: isOpen ? "500px" : 0,
                    opacity: isOpen ? 1 : 0,
                    transition: prefersReducedMotion
                      ? "none"
                      : "max-height 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease",
                    marginBottom: isOpen ? "var(--space-3)" : 0,
                  }}
                  role="region"
                  aria-label={`${item.title} details`}
                >
                  <div
                    style={{
                      paddingLeft: "calc(12px + var(--space-3))",
                      borderLeft: "2px solid var(--color-line)",
                      marginLeft: "2px",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.875rem",
                        color: "var(--color-ink)",
                        lineHeight: "1.6",
                        margin: "0 0 var(--space-2)",
                      }}
                    >
                      {item.explanation}
                    </p>
                    <div
                      style={{
                        width: "40px",
                        height: "2px",
                        background: "var(--color-line)",
                        marginTop: "var(--space-2)",
                      }}
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}