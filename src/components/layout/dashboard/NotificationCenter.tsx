"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState } from "react";

const MOCK_NOTIFICATIONS = [
  { id: 1, title: "Report Updated", message: "Your report #1024 status changed to IN PROGRESS.", time: "2m ago", unread: true },
  { id: 2, title: "New Assignment", message: "You have been assigned to Work Order #305.", time: "1h ago", unread: true },
  { id: 3, title: "SLA Warning", message: "Work Order #201 is approaching SLA breach.", time: "3h ago", unread: false },
];

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const unreadCount = MOCK_NOTIFICATIONS.filter(n => n.unread).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-ink/60 hover:text-ink rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-signal-open" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 overflow-hidden shadow-lg border-line/20 rounded-md bg-paper">
        <div className="flex items-center justify-between p-4 border-b border-line/10 bg-field/30">
          <h4 className="font-display font-medium text-ink">Notifications</h4>
          <span className="text-[10px] font-mono text-ink/50 bg-paper px-2 py-0.5 rounded-full border border-line/20 uppercase tracking-widest">
            {unreadCount} New
          </span>
        </div>
        <div className="flex flex-col max-h-[300px] overflow-y-auto">
          {MOCK_NOTIFICATIONS.length === 0 ? (
            <div className="p-8 text-center text-sm text-ink/50">No new notifications</div>
          ) : (
            MOCK_NOTIFICATIONS.map((notif) => (
              <div 
                key={notif.id} 
                className={cn(
                  "flex flex-col gap-1 p-4 border-b border-line/10 last:border-0 hover:bg-field/50 transition-colors cursor-pointer",
                  notif.unread && "bg-field/20"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <h5 className={cn("text-sm font-medium", notif.unread ? "text-ink" : "text-ink/70")}>{notif.title}</h5>
                  <span className="text-[10px] font-mono text-ink/40 whitespace-nowrap">{notif.time}</span>
                </div>
                <p className="text-xs text-ink/60 line-clamp-2">{notif.message}</p>
              </div>
            ))
          )}
        </div>
        <div className="p-2 border-t border-line/10 bg-field/20">
          <Button variant="ghost" className="w-full text-xs h-8 text-ink/70 hover:text-ink">
            Mark all as read
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
