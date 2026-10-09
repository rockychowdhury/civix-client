"use client";

import { formatDistanceToNow } from "date-fns";
import { Bell } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useGetNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from "@/hooks";
import { cn } from "@/lib/utils";

function timeAgo(iso?: string): string {
  if (!iso) return "";
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return "";
  }
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const query = useGetNotifications({ limit: 20 });
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const items = query.data?.data ?? [];
  const unreadCount = query.data?.meta?.unreadCount ?? items.filter((n) => !n.isRead).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
          className="relative text-ink/60 hover:text-ink rounded-full cursor-pointer"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-signal-open" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0 overflow-hidden shadow-lg border-line/20 rounded-md bg-paper"
      >
        <div className="flex items-center justify-between p-4 border-b border-line/10 bg-field/30">
          <h4 className="font-display font-medium text-ink">Notifications</h4>
          <span className="text-[10px] font-mono text-ink/50 bg-paper px-2 py-0.5 rounded-full border border-line/20 uppercase tracking-widest">
            {unreadCount} New
          </span>
        </div>
        <div className="flex flex-col max-h-[300px] overflow-y-auto">
          {query.isLoading ? (
            <div className="p-8 text-center text-sm text-ink/50" role="status">
              Loading…
            </div>
          ) : query.isError ? (
            <div className="p-8 text-center text-sm text-ink/50">
              Couldn&apos;t load notifications.{" "}
              <button
                type="button"
                onClick={() => query.refetch()}
                className="cursor-pointer underline underline-offset-2"
              >
                Retry
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-sm text-ink/50">No new notifications</div>
          ) : (
            items.map((notif) => (
              <button
                key={notif.id}
                type="button"
                onClick={() => {
                  if (!notif.isRead) markRead.mutate(notif.id);
                }}
                className={cn(
                  "flex cursor-pointer flex-col gap-1 p-4 border-b border-line/10 last:border-0 hover:bg-field/50 transition-colors text-left",
                  !notif.isRead && "bg-field/20",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <h5
                    className={cn(
                      "text-sm font-medium",
                      !notif.isRead ? "text-ink" : "text-ink/70",
                    )}
                  >
                    {notif.title}
                  </h5>
                  <span className="text-[10px] font-mono text-ink/40 whitespace-nowrap">
                    {timeAgo(notif.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-ink/60 line-clamp-2">{notif.message}</p>
              </button>
            ))
          )}
        </div>
        <div className="p-2 border-t border-line/10 bg-field/20">
          <Button
            variant="ghost"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending || unreadCount === 0}
            className="w-full text-xs h-8 text-ink/70 hover:text-ink cursor-pointer"
          >
            {markAll.isPending ? "Marking…" : "Mark all as read"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
