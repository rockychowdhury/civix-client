"use client";

import { format } from "date-fns";
import { Bell, BellRing, CheckCheck, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { CityNotification } from "@/api/notification.api";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import { AdminSectionSkeleton } from "@/components/modules/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from "@/hooks/notification.hook";
import { cn } from "@/lib/utils";
import { CityHeader, CityStatCard } from "./city-ui";

export function CityNotificationsView() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");

  const query = useGetNotifications({
    searchTerm: search.trim() || undefined,
    unreadOnly: filter === "UNREAD" ? true : undefined,
    limit: 50,
  });
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const items: CityNotification[] = useMemo(
    () => (query.data?.data ?? []) as CityNotification[],
    [query.data],
  );
  const unread = items.filter((n) => !n.isRead).length;

  if (query.isLoading) return <AdminSectionSkeleton />;
  if (query.isError) {
    return (
      <EmptyState
        title="Notifications unavailable"
        body="City alerts could not be loaded. Check your connection and try again."
        action={
          <Button
            type="button"
            size="sm"
            onClick={() => query.refetch()}
            className="cursor-pointer"
          >
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <CityHeader
        eyebrow="City alerts & escalations"
        title="Notifications"
        description="System notifications, SLA escalations, and municipal alerts for your city."
        actions={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={unread === 0 || markAll.isPending}
            onClick={() => markAll.mutate()}
            className="cursor-pointer text-xs active:translate-y-px rounded-xs"
          >
            <CheckCheck className="size-3.5 mr-1.5" />
            {markAll.isPending ? "Marking…" : "Mark all read"}
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <CityStatCard
          label="Total"
          value={items.length}
          sub="Notifications"
          icon={<Bell className="size-4 text-ink/40" />}
        />
        <CityStatCard
          label="Unread"
          value={unread}
          sub="Need attention"
          icon={<BellRing className="size-4 text-ink/40" />}
        />
        <CityStatCard label="Read" value={items.length - unread} sub="Acknowledged" />
        <CityStatCard
          label="Read rate"
          value={
            items.length ? `${Math.round(((items.length - unread) / items.length) * 100)}%` : "—"
          }
          sub="Inbox hygiene"
        />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b border-line/60">
        <div className="flex items-center gap-2 text-xs font-mono text-ink/50">
          <Bell className="size-3.5" />
          {items.length} notification{items.length === 1 ? "" : "s"}
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink/40" />
            <Input
              type="text"
              placeholder="Search alerts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8.5 h-8.5 text-xs bg-paper border-line rounded-xs"
            />
          </div>
          <Select value={filter} onValueChange={(v) => setFilter(v as "ALL" | "UNREAD")}>
            <SelectTrigger className="h-8.5 text-xs w-[130px] bg-paper border-line cursor-pointer rounded-xs">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs cursor-pointer">
                All
              </SelectItem>
              <SelectItem value="UNREAD" className="text-xs cursor-pointer">
                Unread only
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-line/60 bg-paper p-10 text-center space-y-2">
          <Bell className="size-7 mx-auto text-ink/25" />
          <p className="font-body text-lg text-ink/50">All caught up.</p>
          <p className="text-ink/30 text-sm font-body">No notifications match this inbox view.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-line/80 bg-paper divide-y divide-line/40 overflow-hidden shadow-2xs">
          {items.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => {
                if (!n.isRead) markRead.mutate(n.id);
              }}
              className={cn(
                "w-full text-left p-4 flex items-start gap-3 transition-colors cursor-pointer bg-transparent border-none",
                n.isRead ? "hover:bg-field/20" : "bg-ledger/[0.04] hover:bg-ledger/[0.07]",
              )}
            >
              <span
                className={cn(
                  "size-8 rounded-full border flex items-center justify-center shrink-0 mt-0.5",
                  n.isRead
                    ? "bg-field border-line text-ink/40"
                    : "bg-ledger text-paper border-ledger",
                )}
              >
                <Bell className="size-3.5" />
              </span>
              <span className="min-w-0 flex-1 space-y-1">
                <span className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-ink truncate">{n.title}</span>
                  <span className="font-mono text-[10px] text-ink/40 shrink-0">
                    {n.createdAt ? format(new Date(n.createdAt), "MMM d, HH:mm") : ""}
                  </span>
                </span>
                <span className="block text-xs text-ink/65 leading-relaxed line-clamp-2">
                  {n.message}
                </span>
                <span className="flex items-center gap-2">
                  {n.type && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-field border border-line/60 text-ink/70">
                      {n.type}
                    </span>
                  )}
                  {!n.isRead && (
                    <span className="text-[10px] font-mono font-semibold text-ledger">
                      ● Unread
                    </span>
                  )}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
