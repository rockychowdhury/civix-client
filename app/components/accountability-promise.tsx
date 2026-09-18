"use client";

export function AccountabilityPromise() {
  return (
    <section
      aria-labelledby="accountability-heading"
      style={{
        padding: "var(--space-8) var(--space-2) var(--space-6)",
      }}
    >
      <div className="container" style={{ maxWidth: "900px" }}>
        <h2 id="accountability-heading" className="visually-hidden">
          Accountability Promise
        </h2>

        <blockquote
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: "400",
            fontSize: "clamp(2rem, 4.5vw, 3.5rem)",
            lineHeight: "1.1",
            color: "var(--color-ink)",
            margin: "0 0 var(--space-4)",
            paddingLeft: "var(--space-5)",
            borderLeft: "3px solid var(--color-ink)",
            position: "relative",
            maxWidth: "85%",
          }}
        >
          Every report has a deadline. If a department misses it, the issue escalates
          automatically — no one has to ask twice.
        </blockquote>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
            color: "var(--color-ink)",
            opacity: 0.7,
            lineHeight: "1.6",
            maxWidth: "560px",
            margin: 0,
          }}
        >
          Departments that miss their deadline trigger an automatic escalation path. The
          report is routed to the department supervisor, then to the city administrator,
          and finally to the public dashboard if unresolved within 14 days.
        </p>
      </div>
    </section>
  );
}