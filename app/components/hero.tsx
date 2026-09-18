"use client";

import { useEffect, useState } from "react";

const statuses = [
  { label: "Submitted", state: "completed" as const },
  { label: "Routed to Roads Dept.", state: "completed" as const },
  { label: "Technician Assigned", state: "current" as const },
  { label: "Resolved", state: "pending" as const },
];

export function Hero() {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTime((prev) => prev + 1000), 1000);
    return () => clearInterval(id);
  }, []);

  const formatted = new Date(time).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const formattedTime = formatted.replace(/:/g, "-");

  return (
    <section
      aria-labelledby="hero-heading"
      style={{
        padding: "var(--space-7) var(--space-2) var(--space-5)",
      }}
    >
      <div className="container" style={{ display: "flex", gap: "var(--space-4)", alignItems: "flex-start", flexWrap: "wrap" }}>
        <div
          id="hero-heading"
          style={{
            flex: "0 0 55%",
            minWidth: "280px",
            paddingTop: "var(--space-2)",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: "700",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              lineHeight: "1.05",
              color: "var(--color-ink)",
              margin: "0 0 var(--space-2)",
              letterSpacing: "-0.02em",
            }}
          >
            Report it once. Watch it get fixed.
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(1rem, 2vw, 1.125rem)",
              color: "var(--color-ink)",
              opacity: 0.7,
              margin: "0 0 var(--space-4)",
              lineHeight: "1.5",
              maxWidth: "90%",
            }}
          >
            File a complaint and track its progress in real time — from submission to resolution.
          </p>
          <a
            href="/report"
            className="btn-primary"
            style={{
              fontSize: "0.875rem",
              padding: "12px 24px",
            }}
          >
            Report an Issue — takes 40 seconds
          </a>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.875rem",
              color: "var(--color-ink)",
              opacity: 0.5,
              margin: "var(--space-3) 0 0",
              maxWidth: "80%",
            }}
          >
            No forms that vanish. No email that disappears. Just tracking that works.
          </p>
        </div>

        <div
          style={{
            flex: "0 0 45%",
            minWidth: "280px",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "360px",
              background: "var(--color-ink)",
              borderRadius: "2px",
              overflow: "hidden",
            }}
            role="region"
            aria-label="Live complaint tracking example"
          >
            <div
              style={{
                padding: "var(--space-3) var(--space-4)",
                borderBottom: "1px solid var(--color-line)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "var(--space-2)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  color: "var(--color-signal-resolved)",
                  fontWeight: "500",
                }}
              >
                CVX-{formattedTime}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.75rem",
                  color: "var(--color-paper)",
                  opacity: 0.7,
                }}
              >
                Live
              </span>
            </div>

            <div style={{ padding: "var(--space-4)" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-3)",
                }}
              >
                {statuses.map((status, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-3)",
                      padding: "var(--space-2) 0",
                      borderBottom:
                        i < statuses.length - 1
                          ? "1px solid var(--color-line)"
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        border: "2px solid",
                        background:
                          status.state === "completed"
                            ? "var(--color-signal-resolved)"
                            : status.state === "current"
                            ? "var(--color-signal-open)"
                            : "transparent",
                        borderColor:
                          status.state === "completed"
                            ? "var(--color-signal-resolved)"
                            : status.state === "current"
                            ? "var(--color-signal-open)"
                            : "var(--color-line)",
                        flexShrink: 0,
                        position: "relative",
                        boxShadow:
                          status.state === "current"
                            ? "0 0 0 3px rgba(181, 80, 44, 0.2)"
                            : "none",
                        animation:
                          status.state === "current"
                            ? "pulse 2s ease-in-out infinite"
                            : "none",
                      }}
                      aria-hidden="true"
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "0.875rem",
                          fontWeight:
                            status.state === "current" ? "500" : "400",
                          color:
                            status.state === "completed"
                              ? "var(--color-signal-resolved)"
                              : status.state === "current"
                              ? "var(--color-signal-open)"
                              : "var(--color-paper)",
                          margin: "0 0 2px",
                          lineHeight: "1.3",
                        }}
                      >
                        {status.label}
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.6875rem",
                          color: "var(--color-paper)",
                          opacity: 0.5,
                          margin: 0,
                        }}
                      >
                        {status.state === "completed" && "Completed 2 hrs ago"}
                        {status.state === "current" && "In progress — 15 min ago"}
                        {status.state === "pending" && "Estimated 2 days"}
                      </p>
                    </div>
                    {status.state === "current" && (
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.625rem",
                          fontWeight: "500",
                          color: "var(--color-signal-open)",
                          background: "rgba(181, 80, 44, 0.15)",
                          padding: "2px 8px",
                          borderRadius: "2px",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Active
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}