"use client";

import { Award, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { CITIZEN_TRUST_INFO, type CitizenTrustLevelCode } from "@/constant/citizen.constant";
import { cn } from "@/lib/utils";

interface CitizenTrustBadgeProps {
  level?: string | null;
  className?: string;
  showPerk?: boolean;
}

export function CitizenTrustBadge({
  level = "NEW",
  className,
  showPerk = false,
}: CitizenTrustBadgeProps) {
  const normalizedLevel = (level?.toUpperCase() || "NEW") as CitizenTrustLevelCode;
  const info = CITIZEN_TRUST_INFO[normalizedLevel] || CITIZEN_TRUST_INFO.NEW;

  const IconComponent =
    normalizedLevel === "TRUSTED" ? ShieldCheck : normalizedLevel === "REGULAR" ? Award : Sparkles;

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide transition-colors",
          info.badgeClass,
        )}
      >
        <IconComponent className="size-3.5" />
        <span>{info.label}</span>
      </span>
      {showPerk && (
        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-ink/50">
          <CheckCircle2 className="size-3 text-signal-resolved" />
          {info.perk}
        </span>
      )}
    </div>
  );
}
