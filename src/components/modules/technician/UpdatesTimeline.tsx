"use client";

import { format } from "date-fns";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  PauseCircle,
  PlayCircle,
  UserCheck,
} from "lucide-react";
import Image from "next/image";
import { WORK_UPDATE_TYPE_LABEL, type WorkUpdateType } from "@/constant/technician.constant";
import { cn } from "@/lib/utils";
import type { WorkUpdate } from "@/types";

function getUpdateMeta(type: string) {
  switch (type.toUpperCase()) {
    case "ACCEPTED":
      return {
        icon: UserCheck,
        color: "text-ink/70",
        bullet: "bg-ink/50",
      };
    case "ON_SITE":
      return {
        icon: MapPin,
        color: "text-ledger",
        bullet: "bg-ledger",
      };
    case "BLOCKED":
      return {
        icon: AlertCircle,
        color: "text-signal-open",
        bullet: "bg-signal-open",
      };
    case "PAUSED":
    case "DELAYED":
      return {
        icon: PauseCircle,
        color: "text-signal-progress",
        bullet: "bg-signal-progress",
      };
    case "RESUMED":
    case "PROGRESS":
      return {
        icon: PlayCircle,
        color: "text-ledger",
        bullet: "bg-ledger",
      };
    case "COMPLETED":
      return {
        icon: CheckCircle2,
        color: "text-signal-resolved",
        bullet: "bg-signal-resolved",
      };
    default:
      return {
        icon: Clock,
        color: "text-ink/60",
        bullet: "bg-ink/40",
      };
  }
}

/** Field log rendered from GET /work-orders/:id `updates[]` (newest first). */
export function UpdatesTimeline({ updates }: { updates: WorkUpdate[] }) {
  if (updates.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-line/40 px-4 py-6 text-center font-body text-sm text-ink/50 italic">
        No site log yet — your first update starts the record.
      </p>
    );
  }

  return (
    <ol className="relative flex flex-col gap-0 border-l-2 border-line/40 pl-0">
      {updates.map((update) => {
        const meta = getUpdateMeta(update.updateType);
        const Icon = meta.icon;
        return (
          <li
            key={update.id}
            className="relative flex flex-col gap-1.5 py-3.5 pl-6 first:pt-0 last:pb-0"
          >
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-4 -left-[5px] size-2 rounded-full ring-4 ring-paper first:top-1",
                meta.bullet,
              )}
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span
                className={cn(
                  "flex items-center gap-1.5 font-display text-sm font-semibold",
                  meta.color,
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                {WORK_UPDATE_TYPE_LABEL[update.updateType as WorkUpdateType] ||
                  update.updateType.replace(/_/g, " ")}
              </span>
              <time className="font-mono text-[0.6875rem] text-ink/45" dateTime={update.createdAt}>
                {format(new Date(update.createdAt), "MMM d, h:mm a")}
              </time>
            </div>
            {update.note ? (
              <p className="font-body text-sm leading-relaxed text-ink/80 whitespace-pre-wrap">
                {update.note}
              </p>
            ) : null}
            {update.attachments && update.attachments.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {update.attachments.map((att) =>
                  att.url ? (
                    <a
                      key={att.id}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative block size-16 overflow-hidden rounded-xs border border-line/40 bg-field/30 cursor-pointer"
                    >
                      <Image
                        src={att.url}
                        alt="Update attachment"
                        fill
                        unoptimized
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </a>
                  ) : null,
                )}
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
