"use client";

export function FinalCTA() {
  return (
    <section
      aria-labelledby="final-cta-heading"
      style={{
        padding: "var(--space-8) var(--space-2) var(--space-6)",
        textAlign: "center",
      }}
    >
      <div className="container" style={{ maxWidth: "720px", margin: "0 auto" }}>
        <h2 id="final-cta-heading" className="visually-hidden">
          Final Call to Action
        </h2>

        <p
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: "700",
            fontSize: "clamp(2rem, 4vw, 3rem)",
            lineHeight: "1.05",
            color: "var(--color-ink)",
            margin: "0 0 var(--space-4)",
            letterSpacing: "-0.02em",
          }}
        >
          Your city should answer when you report something.
        </p>

        <a
          href="/report"
          className="btn-primary"
          style={{
            fontSize: "0.875rem",
            padding: "14px 28px",
            display: "inline-block",
          }}
        >
          Report an Issue — takes 40 seconds
        </a>
      </div>
    </section>
  );
}