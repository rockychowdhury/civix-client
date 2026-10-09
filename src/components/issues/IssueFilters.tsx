"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FilterSidebar } from "@/components/layout/dashboard/FilterSidebar";

interface IssueFiltersProps {
  status: string;
  onStatusChange: (status: string) => void;
}

export function IssueFilters({ status, onStatusChange }: IssueFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-2 mb-4">
      <div className="flex items-center">
        <h1 className="font-display text-2xl font-semibold text-ink">
          {status === "all"
            ? "All Issues"
            : `${status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}`}
        </h1>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto justify-end pb-3">
        <FilterSidebar>
          <div className="space-y-6">
            <div>
              <p className="font-display font-medium text-ink mb-3">Priority</p>
              <div className="flex flex-wrap gap-2">
                {["Normal", "High", "Urgent"].map((p) => (
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
          </div>
        </FilterSidebar>
      </div>
    </div>
  );
}
