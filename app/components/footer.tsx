"use client";

const footerMunicipalities = [
  "Dhaka North",
  "Kolkata",
  "Chittagong South",
  "Sylhet",
  "Rajshahi",
  "Khulna",
];

const footerLinks = {
  Product: ["Track a Report", "For Municipalities", "Public Data", "API Documentation"],
  Company: ["About", "Careers", "Press", "Contact"],
  Legal: ["Privacy Policy", "Terms of Service", "Data Processing", "System Status"],
};

export function Footer() {
  return (
    <footer
      role="contentinfo"
      style={{
        background: "var(--color-ink)",
        color: "var(--color-paper)",
        padding: "var(--space-6) var(--space-2) var(--space-4)",
        borderTop: "1px solid var(--color-line)",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-6)",
          }}
        >
          <div
            style={{
              paddingBottom: "var(--space-5)",
              borderBottom: "1px solid rgba(201, 194, 180, 0.3)",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                fontWeight: "500",
                color: "var(--color-signal-resolved)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                margin: "0 0 var(--space-3)",
              }}
            >
              Municipalities on Civix
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "var(--space-3) var(--space-4)",
              }}
            >
              {footerMunicipalities.map((city, i) => (
                <span
                  key={city}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.875rem",
                    color: "var(--color-paper)",
                    opacity: 0.8,
                    padding: "4px 0",
                  }}
                >
                  {city}
                  {i < footerMunicipalities.length - 1 && (
                    <span style={{ marginLeft: "var(--space-4)", opacity: 0.3 }}>·</span>
                  )}
                </span>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "var(--space-5)",
            }}
          >
            <div style={{ gridColumn: "1 / -1" }}>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: "400",
                  fontSize: "clamp(1.25rem, 3vw, 1.5rem)",
                  lineHeight: "1.15",
                  color: "var(--color-paper)",
                  margin: "0 0 var(--space-2)",
                }}
              >
                Civix
              </p>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.9375rem",
                  color: "var(--color-paper)",
                  opacity: 0.7,
                  lineHeight: "1.6",
                  maxWidth: "320px",
                  margin: 0,
                }}
              >
                A public record for problems that get fixed, not filed away.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "var(--space-4)",
              }}
            >
              {Object.entries(footerLinks).map(([category, links]) => (
                <div key={category}>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.75rem",
                      fontWeight: "500",
                      color: "var(--color-signal-resolved)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      margin: "0 0 var(--space-2)",
                    }}
                  >
                    {category}
                  </p>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {links.map((link) => (
                      <li key={link} style={{ marginBottom: "var(--space-1)" }}>
                        <a
                          href={`/${link.toLowerCase().replace(/\s+/g, "-")}`}
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: "0.875rem",
                            color: "var(--color-paper)",
                            opacity: 0.7,
                            textDecoration: "none",
                            transition: "opacity 0.2s",
                            display: "block",
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.opacity = "1";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.opacity = "0.7";
                          }}
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
              paddingTop: "var(--space-4)",
              borderTop: "1px solid rgba(201, 194, 180, 0.2)",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                color: "var(--color-paper)",
                opacity: 0.5,
                margin: 0,
                display: "flex",
                flexWrap: "wrap",
                gap: "var(--space-3)",
                alignItems: "center",
              }}
            >
              <span>System status: operational</span>
              <span>Uptime: 99.97%</span>
              <a
                href="/status"
                style={{
                  color: "var(--color-paper)",
                  opacity: 0.5,
                  textDecoration: "none",
                  transition: "opacity 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.opacity = "0.5";
                }}
              >
                Incident log
              </a>
              <span>© {new Date().getFullYear()} Civix</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}