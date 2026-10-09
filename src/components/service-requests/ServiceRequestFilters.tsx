"use client";

import { Calendar } from "lucide-react";
import { FilterSidebar } from "@/components/layout/dashboard/FilterSidebar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ServiceRequestFiltersProps {
  status: string;
  onStatusChange: (status: string) => void;
}

export function ServiceRequestFilters({ status, onStatusChange }: ServiceRequestFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-2 mb-4">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold text-ink">
          {status === "all"
            ? "Citizen Reports"
            : `${status
                .split("-")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ")} Reports`}
        </h1>
        <p className="font-body text-xs text-ink/60 mb-2">
          Manage individual citizen submissions — confirmed issues are tracked in Issue Queue.
        </p>
        <Tabs value={status} onValueChange={onStatusChange}>
          <TabsList className="bg-field/50 border border-line/20 p-1">
            {["all", "needs-review", "unlinked", "linked"].map((value) => (
              <TabsTrigger
                key={value}
                value={value}
                className="text-xs uppercase tracking-wider font-display data-[state=active]:bg-ledger data-[state=active]:text-paper cursor-pointer"
              >
                {value.replace("-", " ")}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto justify-end pb-3">
        <FilterSidebar>
          <div className="space-y-6">
            <div>
              <p className="font-display font-medium text-ink mb-3">Status</p>
              <div className="flex flex-wrap gap-2">
                {["Triaged", "In Progress", "Resolved", "Closed"].map((p) => (
                  <Button key={p} variant="secondary" className="h-8 text-xs">
                    {p}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <p className="font-display font-medium text-ink mb-3">Category</p>
              <div className="flex flex-wrap gap-2">
                {["Pothole", "Water Leak", "Garbage", "Street Light"].map((p) => (
                  <Button key={p} variant="secondary" className="h-8 text-xs">
                    {p}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <p className="font-display font-medium text-ink mb-3">Date Range</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="secondary"
                    className="h-10 w-full px-4 text-xs font-medium cursor-pointer border border-line justify-start"
                  >
                    <Calendar className="mr-3 h-4 w-4 opacity-50" />
                    Select Period
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4 border-line bg-paper" align="start">
                  <div className="bg-field/50 h-48 w-64 rounded-md border border-line/50 flex items-center justify-center text-ink/40">
                    <Calendar className="h-8 w-8 opacity-20 mr-2" />
                    <span className="text-sm">Calendar Select</span>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </FilterSidebar>
      </div>
    </div>
  );
}
