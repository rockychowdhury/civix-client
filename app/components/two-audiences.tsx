"use client";

export function TwoAudiences() {
  return (
    <section
      aria-labelledby="two-audiences-heading"
      style={{
        padding: 0,
      }}
    >
      <h2 id="two-audiences-heading" className="visually-hidden">
        Two Audiences, One System
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 0,
        }}
      >
        <div
          style={{
            background: "var(--color-paper)",
            color: "var(--color-ink)",
            padding: "var(--space-7) var(--space-2) var(--space-6)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minHeight: "320px",
          }}
        >
          <div className="container" style={{ maxWidth: "480px" }}>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "clamp(1.125rem, 2.5vw, 1.375rem)",
                color: "var(--color-ink)",
                lineHeight: "1.6",
                margin: "0 0 var(--space-4)",
              }}
            >
              Report your city&apos;s issues once and watch them get fixed. Civix tracks
              every complaint from submission to resolution, so you always know
              where things stand.
            </p>
            <a
              href="/report"
              className="btn-primary"
              style={{
                width: "fit-content",
                fontSize: "0.875rem",
                padding: "12px 24px",
              }}
            >
              Report an Issue
            </a>
          </div>
        </div>

        <div
          style={{
            background: "var(--color-ledger)",
            color: "var(--color-paper)",
            padding: "var(--space-7) var(--space-2) var(--space-6)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minHeight: "320px",
          }}
        >
          <div className="container" style={{ maxWidth: "480px" }}>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "clamp(1.125rem, 2.5vw, 1.375rem)",
                color: "var(--color-paper)",
                lineHeight: "1.6",
                margin: "0 0 var(--space-4)",
              }}
            >
              Built for departments that need real routing, SLA enforcement, and audit
              trails. Civix gives municipalities the tools to close the loop on every
              report — automatically.
            </p>
            <a
              href="/municipalities"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "var(--color-paper)",
                background: "transparent",
                padding: "12px 24px",
                border: "1px solid var(--color-line)",
                borderRadius: "2px",
                textDecoration: "none",
                display: "inline-block",
                width: "fit-content",
                transition: "background 0.2s, border-color 0.2s, color 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "var(--color-paper)";
                e.currentTarget.style.color = "var(--color-ledger)";
                e.currentTarget.style.borderColor = "var(--color-paper)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--color-paper)";
                e.currentTarget.style.borderColor = "var(--color-line)";
              }}
            >
              Municipal portal
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}