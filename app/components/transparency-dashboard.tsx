"use client";

const wardData = [
  { ward: "Downtown", open: 42, resolved: 38, x: 52, y: 35 },
  { ward: "East Side", open: 28, resolved: 51, x: 78, y: 45 },
  { ward: "West End", open: 35, resolved: 44, x: 22, y: 48 },
  { ward: "North Ward", open: 19, resolved: 67, x: 48, y: 18 },
  { ward: "South Ward", open: 31, resolved: 49, x: 55, y: 78 },
  { ward: "Riverside", open: 15, resolved: 23, x: 82, y: 72 },
  { ward: "University", open: 24, resolved: 41, x: 15, y: 32 },
];

const medianDays = 3.2;

export function TransparencyDashboard() {
  return (
    <section
      aria-labelledby="transparency-heading"
      style={{
        padding: "var(--space-7) var(--space-2) var(--space-5)",
      }}
    >
      <div className="container">
        <h2 id="transparency-heading" className="visually-hidden">
          Transparency Dashboard
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "var(--space-6)",
          }}
        >
          <div
            style={{
              position: "relative",
            }}
          >
            <div
              style={{
                aspectRatio: "4 / 3",
                background: "var(--color-ink)",
                borderRadius: "2px",
                position: "relative",
                overflow: "hidden",
              }}
              role="img"
              aria-label="City ward map showing open and resolved issue density. Open issues shown in rust, resolved in forest green."
            >
              <svg
                viewBox="0 0 100 75"
                preserveAspectRatio="none"
                style={{
                  width: "100%",
                  height: "100%",
                }}
                aria-hidden="true"
              >
                <defs>
                  <radialGradient id="open-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="var(--color-signal-open)" stopOpacity="0.15" />
                    <stop offset="70%" stopColor="var(--color-signal-open)" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="resolved-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="var(--color-signal-resolved)" stopOpacity="0.15" />
                    <stop offset="70%" stopColor="var(--color-signal-resolved)" stopOpacity="0" />
                  </radialGradient>
                </defs>

                <rect x="0" y="0" width="100" height="75" fill="var(--color-ink)" />

                <path
                  d="M10,10 L90,10 L90,65 L10,65 Z"
                  fill="none"
                  stroke="var(--color-line)"
                  strokeWidth="0.5"
                  opacity="0.3"
                />

                {wardData.map((ward) => (
                  <g key={ward.ward}>
                    <circle
                      cx={ward.x}
                      cy={ward.y}
                      r={Math.max(8, (ward.open / 67) * 18)}
                      fill="var(--color-signal-open)"
                      fillOpacity="0.25"
                      filter="url(#open-glow)"
                    />
                    <circle
                      cx={ward.x}
                      cy={ward.y}
                      r={Math.max(5, (ward.resolved / 67) * 14)}
                      fill="var(--color-signal-resolved)"
                      fillOpacity="0.35"
                      filter="url(#resolved-glow)"
                    />
                    <circle
                      cx={ward.x}
                      cy={ward.y}
                      r={Math.max(3, (ward.open / 67) * 8)}
                      fill="var(--color-signal-open)"
                      fillOpacity="0.5"
                    />
                    <circle
                      cx={ward.x}
                      cy={ward.y}
                      r={Math.max(2, (ward.resolved / 67) * 6)}
                      fill="var(--color-signal-resolved)"
                      fillOpacity="0.6"
                    />
                    <text
                      x={ward.x}
                      y={ward.y - 12}
                      textAnchor="middle"
                      fontFamily="var(--font-mono)"
                      fontSize="4"
                      fill="var(--color-paper)"
                      opacity="0.7"
                    >
                      {ward.ward}
                    </text>
                  </g>
                ))}
              </svg>

              <div
                style={{
                  position: "absolute",
                  bottom: "var(--space-3)",
                  left: "var(--space-3)",
                  right: "var(--space-3)",
                  display: "flex",
                  gap: "var(--space-3)",
                  flexWrap: "wrap",
                }}
                aria-hidden="true"
              >
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.75rem",
                    color: "var(--color-paper)",
                    opacity: 0.6,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: "var(--color-signal-open)",
                      opacity: 0.6,
                    }}
                  />
                  Open density
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.75rem",
                    color: "var(--color-paper)",
                    opacity: 0.6,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: "var(--color-signal-resolved)",
                      opacity: 0.7,
                    }}
                  />
                  Resolved density
                </span>
              </div>
            </div>

            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.8125rem",
                color: "var(--color-ink)",
                opacity: 0.5,
                textAlign: "center",
                margin: "var(--space-3) 0 0",
              }}
            >
              Issues by ward — density visualization using semantic signal colors
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              padding: "var(--space-2) 0",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "var(--space-2)",
                flexWrap: "wrap",
                marginBottom: "var(--space-2)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: "700",
                  fontSize: "clamp(2.5rem, 6vw, 4rem)",
                  lineHeight: "1.05",
                  color: "var(--color-ink)",
                }}
              >
                {medianDays}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                  color: "var(--color-ink)",
                  opacity: 0.7,
                  alignSelf: "flex-end",
                  marginBottom: "0.2em",
                }}
              >
                days
              </span>
            </div>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
                color: "var(--color-ink)",
                opacity: 0.6,
                lineHeight: "1.5",
                margin: "0 0 var(--space-4)",
                maxWidth: "320px",
              }}
            >
              Median time to resolution across all active municipalities
            </p>
            <a
              href="/data"
              className="btn-secondary"
              style={{
                fontSize: "0.875rem",
                padding: 0,
              }}
            >
              View full public data
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}