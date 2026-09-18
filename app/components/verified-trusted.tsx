"use client";

export function VerifiedTrusted() {
  return (
    <section
      aria-labelledby="verified-heading"
      style={{
        padding: "var(--space-7) var(--space-2) var(--space-5)",
      }}
    >
      <div className="container" style={{ maxWidth: "720px" }}>
        <h2 id="verified-heading" className="visually-hidden">
          Verified & Trusted
        </h2>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(1rem, 2vw, 1.125rem)",
            color: "var(--color-ink)",
            lineHeight: "1.6",
            margin: "0 0 var(--space-6)",
          }}
        >
          You can report anonymously with just an email — no ID required. If you choose
          to verify your identity, your report gets a verification badge that helps
          city officials prioritize credible submissions.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "var(--space-4)",
          }}
        >
          <div
            style={{
              padding: "var(--space-4) var(--space-3)",
              border: "1px solid var(--color-line)",
              borderRadius: "2px",
              background: "var(--color-paper)",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.8125rem",
                fontWeight: "500",
                color: "var(--color-ink)",
                opacity: 0.5,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                margin: "0 0 var(--space-2)",
              }}
            >
              Basic report
            </p>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "clamp(0.9375rem, 1.5vw, 1rem)",
                color: "var(--color-ink)",
                lineHeight: "1.6",
                margin: "0 0 var(--space-3)",
              }}
            >
              Submit with email only. Your report enters the queue and is tracked
              publicly. City staff can see and act on it.
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                paddingTop: "var(--space-3)",
                borderTop: "1px solid var(--color-line)",
              }}
            >
              <span
                style={{
                  width: "20px",
                  height: "20px",
                  border: "2px solid var(--color-line)",
                  borderRadius: "2px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
                aria-hidden="true"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 6L5.5 8.5L9 3.5"
                    stroke="var(--color-line)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.8125rem",
                  color: "var(--color-ink)",
                  opacity: 0.7,
                }}
              >
                Submitted — tracked — resolved
              </span>
            </div>
          </div>

          <div
            style={{
              padding: "var(--space-4) var(--space-3)",
              border: "1px solid var(--color-signal-resolved)",
              borderRadius: "2px",
              background: "rgba(76, 107, 79, 0.04)",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.8125rem",
                fontWeight: "500",
                color: "var(--color-signal-resolved)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                margin: "0 0 var(--space-2)",
              }}
            >
              Verified report
            </p>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "clamp(0.9375rem, 1.5vw, 1rem)",
                color: "var(--color-ink)",
                lineHeight: "1.6",
                margin: "0 0 var(--space-3)",
              }}
            >
              Optional identity verification adds a trust badge. Verified reports are
              flagged for priority review and carry more weight in departmental
              workload allocation.
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                paddingTop: "var(--space-3)",
                borderTop: "1px solid var(--color-signal-resolved)",
              }}
            >
              <span
                style={{
                  width: "20px",
                  height: "20px",
                  background: "var(--color-signal-resolved)",
                  borderRadius: "2px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
                aria-hidden="true"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 6L5.5 8.5L9 3.5"
                    stroke="var(--color-paper)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.8125rem",
                  color: "var(--color-signal-resolved)",
                  fontWeight: "500",
                }}
              >
                Verified — priority queue — weighted
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}