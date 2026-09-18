"use client";

const pullQuote =
  "Most complaints don't fail because no one filed them. They fail because no one owns them after that.";

const observations = [
  "Reports get sent to the wrong department.",
  "No one tracks how long anything actually takes.",
  "Citizens have no way to know if their report was even seen.",
];

export function BrokenLoop() {
  return (
    <section
      aria-labelledby="broken-loop-heading"
      style={{
        padding: "var(--space-7) var(--space-2) var(--space-5)",
      }}
    >
      <div className="container" style={{ maxWidth: "800px" }}>
        <blockquote
          id="broken-loop-heading"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: "400",
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            lineHeight: "1.1",
            color: "var(--color-ink)",
            margin: "0 0 var(--space-6)",
            paddingLeft: "var(--space-4)",
            borderLeft: "3px solid var(--color-signal-open)",
            position: "relative",
          }}
        >
          {pullQuote}
        </blockquote>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {observations.map((obs, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: "var(--space-3)",
                padding: "var(--space-2) 0",
                borderBottom: i < observations.length - 1 ? "1px solid var(--color-line)" : "none",
              }}
            >
              <span
                style={{
                  flex: "0 0 3px",
                  width: "3px",
                  background: "var(--color-signal-open)",
                  marginTop: "0.25em",
                  flexShrink: 0,
                }}
                aria-hidden="true"
              />
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "clamp(1rem, 2vw, 1.125rem)",
                  color: "var(--color-ink)",
                  lineHeight: "1.6",
                  margin: 0,
                  flex: 1,
                }}
              >
                {obs}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}