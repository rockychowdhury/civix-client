"use client";

import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-paper text-ink", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        button_previous: cn(
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 flex items-center justify-center rounded-md hover:bg-ink/5 absolute left-1"
        ),
        button_next: cn(
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 flex items-center justify-center rounded-md hover:bg-ink/5 absolute right-1"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday:
          "text-ink/50 rounded-md w-8 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-ink/5 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day_button: cn(
          "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-ink/10 rounded-md transition-colors"
        ),
        selected:
          "bg-ink text-paper hover:bg-ink hover:text-paper focus:bg-ink focus:text-paper rounded-md",
        today: "bg-ink/5 text-ink font-bold",
        outside: "text-ink/30 opacity-50",
        disabled: "text-ink/30 opacity-50",
        range_middle:
          "aria-selected:bg-ink/10 aria-selected:text-ink",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ ...props }) => {
          if (props.orientation === 'left') {
            return <ChevronLeftIcon className="h-4 w-4" />
          }
          return <ChevronRightIcon className="h-4 w-4" />
        }
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
