"use client";

import { ArrowUp } from "lucide-react";

export function ScrollTopButton() {
  const scrollToTop = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Back to top"
      className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full border border-paper/25 text-paper/70 transition-all hover:-translate-y-0.5 hover:border-paper/60 hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper active:translate-y-0"
    >
      <ArrowUp className="size-4" aria-hidden="true" />
    </button>
  );
}
