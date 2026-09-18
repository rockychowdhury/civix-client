"use client";

import { useState } from "react";

const stories = [
  {
    id: 1,
    title: "Streetlight outage on Maple Avenue",
    tracking: "CVX-2026-004821",
    category: "Street Lighting",
    ward: "Downtown",
    report:
      "Streetlight out at 123 Maple Ave — darkness all night, safety concern for pedestrians crossing at the intersection.",
    timeline: [
      { status: "Submitted", time: "Nov 3, 7:14 PM", actor: "Citizen" },
      { status: "Routed", time: "Nov 3, 7:16 PM", actor: "System" },
      { status: "Assigned", time: "Nov 4, 9:02 AM", actor: "Roads Dept." },
      { status: "In Progress", time: "Nov 4, 10:45 AM", actor: "Technician M. Chen" },
      { status: "Resolved", time: "Nov 4, 3:45 PM", actor: "Roads Dept." },
    ],
    beforeDesc: "Dark intersection at Maple Ave & 5th St — no illumination for 200ft radius",
    afterDesc: "LED fixture replaced, intersection fully illuminated, photometric test passed",
  },
  {
    id: 2,
    title: "Pothole on 4th Avenue",
    tracking: "CVX-2026-005112",
    category: "Road Maintenance",
    ward: "East Side",
    report:
      "Pothole reported on 4th Avenue — growing each day, risk to vehicles and cyclists in bike lane.",
    timeline: [
      { status: "Submitted", time: "Oct 28, 2:31 PM", actor: "Citizen" },
      { status: "Routed", time: "Oct 28, 2:33 PM", actor: "System" },
      { status: "Assigned", time: "Oct 29, 8:15 AM", actor: "Roads Dept." },
      { status: "In Progress", time: "Oct 29, 9:30 AM", actor: "Crew 7" },
      { status: "Resolved", time: "Oct 29, 4:20 PM", actor: "Roads Dept." },
    ],
    beforeDesc: "6-inch deep pothole spanning bike lane and traffic lane on 4th Ave",
    afterDesc: "Hot-mix asphalt patch applied, compacted, and sealed — road surface restored",
  },
];

export function ResolvedStories() {
  const [current, setCurrent] = useState(0);

  const story = stories[current];

  return (
    <section
      aria-labelledby="resolved-stories-heading"
      style={{
        padding: "var(--space-7) var(--space-2) var(--space-5)",
      }}
    >
      <div className="container" style={{ maxWidth: "720px" }}>
        <h2 id="resolved-stories-heading" className="visually-hidden">
          Resolved Stories
        </h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
            marginBottom: "var(--space-5)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "var(--space-2)",
              paddingBottom: "var(--space-3)",
              borderBottom: "1px solid var(--color-line)",
            }}
          >
            <div>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.75rem",
                  fontWeight: "500",
                  color: "var(--color-signal-resolved)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Case study
              </span>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: "400",
                  fontSize: "clamp(1.5rem, 3vw, 2rem)",
                  lineHeight: "1.15",
                  color: "var(--color-ink)",
                  margin: "var(--space-1) 0 0",
                }}
              >
                {story.title}
              </h3>
            </div>
            <div
              style={{
                display: "flex",
                gap: "var(--space-2)",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  color: "var(--color-ink)",
                  opacity: 0.5,
                }}
              >
                {story.tracking}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  color: "var(--color-ink)",
                  opacity: 0.5,
                }}
              >
                {story.category} · {story.ward}
              </span>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "var(--space-4)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "var(--space-3)",
              }}
            >
              <div
                style={{
                  background: "var(--color-ink)",
                  color: "var(--color-paper)",
                  borderRadius: "2px",
                  padding: "var(--space-4)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-3)",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.75rem",
                      fontWeight: "500",
                      color: "var(--color-signal-open)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Before
                  </span>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.9375rem",
                      color: "var(--color-paper)",
                      opacity: 0.9,
                      lineHeight: "1.5",
                      margin: 0,
                    }}
                  >
                    {story.beforeDesc}
                  </p>
                </div>
                <div
                  style={{
                    height: "1px",
                    background: "var(--color-line)",
                    opacity: 0.3,
                  }}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.75rem",
                      fontWeight: "500",
                      color: "var(--color-signal-resolved)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    After
                  </span>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.9375rem",
                      color: "var(--color-paper)",
                      opacity: 0.9,
                      lineHeight: "1.5",
                      margin: 0,
                    }}
                  >
                    {story.afterDesc}
                  </p>
                </div>
              </div>

              <div
                style={{
                  background: "var(--color-paper)",
                  border: "1px solid var(--color-line)",
                  borderRadius: "2px",
                  padding: "var(--space-4)",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.75rem",
                    fontWeight: "500",
                    color: "var(--color-ink)",
                    opacity: 0.5,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    margin: "0 0 var(--space-2)",
                  }}
                >
                  Original report
                </p>
                <blockquote
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.9375rem",
                    color: "var(--color-ink)",
                    lineHeight: "1.6",
                    margin: 0,
                    fontStyle: "italic",
                    borderLeft: "3px solid var(--color-signal-open)",
                    paddingLeft: "var(--space-3)",
                  }}
                >
                  &ldquo;{story.report}&rdquo;
                </blockquote>
              </div>
            </div>

            <div
              style={{
                background: "var(--color-paper)",
                border: "1px solid var(--color-line)",
                borderRadius: "2px",
                padding: "var(--space-4)",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.75rem",
                  fontWeight: "500",
                  color: "var(--color-ink)",
                  opacity: 0.5,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  margin: "0 0 var(--space-3)",
                }}
              >
                Resolution timeline
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-2)",
                }}
              >
                {story.timeline.map((entry, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "var(--space-3)",
                      paddingLeft: "var(--space-3)",
                      borderLeft:
                        i === story.timeline.length - 1
                          ? "2px solid var(--color-signal-resolved)"
                          : "2px solid var(--color-line)",
                      position: "relative",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        left: "-6px",
                        top: "2px",
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        background:
                          i === story.timeline.length - 1
                            ? "var(--color-signal-resolved)"
                            : "var(--color-line)",
                        border:
                          i === story.timeline.length - 1
                            ? "none"
                            : "2px solid var(--color-paper)",
                        flexShrink: 0,
                      }}
                      aria-hidden="true"
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "0.875rem",
                          fontWeight:
                            i === story.timeline.length - 1 ? "500" : "400",
                          color:
                            i === story.timeline.length - 1
                              ? "var(--color-signal-resolved)"
                              : "var(--color-ink)",
                          margin: "0 0 2px",
                          lineHeight: "1.3",
                        }}
                      >
                        {entry.status}
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.75rem",
                          color: "var(--color-ink)",
                          opacity: 0.5,
                          margin: 0,
                        }}
                      >
                        {entry.time} — {entry.actor}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--space-2)",
            paddingTop: "var(--space-3)",
            borderTop: "1px solid var(--color-line)",
          }}
        >
          {stories.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "2px",
                background: i === current ? "var(--color-ledger)" : "var(--color-line)",
                border: "none",
                color: i === current ? "var(--color-paper)" : "var(--color-ink)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label={`View case study ${i + 1}`}
              aria-current={i === current ? "true" : "false"}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}