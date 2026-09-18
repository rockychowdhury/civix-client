"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export function Navbar() {
  const [resolvedCount, setResolvedCount] = useState(14208);
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setResolvedCount((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        setIsScrolled(window.scrollY > 20);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <nav
      ref={navRef}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "var(--color-ledger)",
        height: isScrolled ? "var(--nav-height-compressed)" : "var(--nav-height)",
        padding: `0 var(--space-2)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "var(--space-2)",
        transition: "height 0.2s ease, padding 0.2s ease",
        borderBottom: "1px solid var(--color-line)",
      }}
      role="navigation"
      aria-label="Main navigation"
    >
      <Link
        href="/"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: "400",
          fontSize: "clamp(0.875rem, 2vw, 1rem)",
          letterSpacing: "0.025em",
          color: "var(--color-paper)",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexShrink: 0,
        }}
        aria-label="Civix home"
      >
        Civix
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontFamily: "var(--font-body)",
            fontSize: "0.75rem",
            fontWeight: "500",
            color: "var(--color-signal-resolved)",
          }}
          aria-live="polite"
          aria-atomic="true"
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              background: "var(--color-signal-resolved)",
              borderRadius: "50%",
              flexShrink: 0,
              animation: "pulse 2s ease-in-out infinite",
            }}
            aria-hidden="true"
          />
          {formatNumber(resolvedCount)} resolved this month
        </span>
      </Link>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
          flexWrap: "wrap",
        }}
        role="navigation"
        aria-label="Secondary navigation"
      >
        <Link
          href="/track"
          className="nav-link"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.875rem",
            color: "var(--color-paper)",
            opacity: 0.8,
            textDecoration: "none",
            transition: "opacity 0.2s",
            whiteSpace: "nowrap",
            padding: "4px 0",
          }}
        >
          Track a Report
        </Link>
        <Link
          href="/municipalities"
          className="nav-link"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.875rem",
            color: "var(--color-paper)",
            opacity: 0.8,
            textDecoration: "none",
            transition: "opacity 0.2s",
            whiteSpace: "nowrap",
            padding: "4px 0",
          }}
        >
          For Municipalities
        </Link>
        <Link
          href="/data"
          className="nav-link"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.875rem",
            color: "var(--color-paper)",
            opacity: 0.8,
            textDecoration: "none",
            transition: "opacity 0.2s",
            whiteSpace: "nowrap",
            padding: "4px 0",
          }}
        >
          Public Data
        </Link>
        <Link
          href="/report"
          className="btn-primary"
          style={{
            marginLeft: "var(--space-2)",
            flexShrink: 0,
          }}
        >
          Report an Issue
        </Link>
      </div>
    </nav>
  );
}