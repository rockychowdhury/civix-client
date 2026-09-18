"use client";

const municipalities = [
  {
    name: "Dhaka North City Corporation",
    since: "March 2026",
    resolved: 8400,
    population: "5.2M",
  },
  {
    name: "Kolkata Municipal Corporation",
    since: "February 2026",
    resolved: 12300,
    population: "4.5M",
  },
  {
    name: "Chittagong South",
    since: "January 2026",
    resolved: 5200,
    population: "2.8M",
  },
  {
    name: "Sylhet City Corporation",
    since: "December 2025",
    resolved: 2100,
    population: "0.5M",
  },
  {
    name: "Rajshahi Metropolitan",
    since: "November 2025",
    resolved: 1800,
    population: "0.9M",
  },
  {
    name: "Khulna City Corporation",
    since: "October 2025",
    resolved: 3100,
    population: "1.5M",
  },
];

export function WhereCivixRuns() {
  return (
    <section
      aria-labelledby="where-heading"
      style={{
        padding: "var(--space-7) var(--space-2) var(--space-5)",
      }}
    >
      <div className="container" style={{ maxWidth: "800px" }}>
        <h2 id="where-heading" className="visually-hidden">
          Where Civix Runs
        </h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}
        >
          {municipalities.map((m, i) => (
            <div
              key={m.name}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "var(--space-3)",
                padding: "var(--space-3) var(--space-4)",
                borderBottom: "1px solid var(--color-line)",
                background: i % 2 === 0 ? "var(--color-paper)" : "rgba(28, 27, 25, 0.02)",
                transition: "background 0.2s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(46, 64, 52, 0.04)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = i % 2 === 0 ? "var(--color-paper)" : "rgba(28, 27, 25, 0.02)";
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: "400",
                    fontSize: "clamp(1rem, 2vw, 1.125rem)",
                    lineHeight: "1.2",
                    color: "var(--color-ink)",
                    margin: 0,
                  }}
                >
                  {m.name}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.8125rem",
                    color: "var(--color-ink)",
                    opacity: 0.6,
                    margin: 0,
                  }}
                >
                  Live since {m.since} · {m.population} residents · {m.resolved.toLocaleString()} issues resolved
                </p>
              </div>
            </div>
          ))}
        </div>

        <p
          style={{
            marginTop: "var(--space-5)",
            textAlign: "center",
          }}
        >
          <a
            href="/municipalities"
            className="btn-secondary"
            style={{
              fontSize: "0.875rem",
            }}
          >
            Bring Civix to your city
          </a>
        </p>
      </div>
    </section>
  );
}