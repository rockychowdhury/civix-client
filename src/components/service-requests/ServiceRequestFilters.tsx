"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ServiceRequestFiltersProps {
  status: string;
  onStatusChange: (status: string) => void;
}

export function ServiceRequestFilters({ status, onStatusChange }: ServiceRequestFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-6 mb-8">
      <Tabs value={status} onValueChange={onStatusChange} className="w-full md:w-auto">
        <TabsList className="flex flex-wrap items-center gap-8 bg-transparent p-0 h-auto w-full justify-start border-b border-line/40 rounded-none">
          {["All", "Needs Review", "Unlinked", "Linked"].map((tab) => {
            const value = tab.toLowerCase().replace(" ", "-");
            return (
              <TabsTrigger
                key={value}
                value={value}
                className="relative px-1 py-4 text-base md:text-lg rounded-none border-0 bg-transparent text-ink/40 hover:text-ink/80 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-ink font-display font-medium tracking-wide transition-colors before:absolute before:bottom-[-1px] before:left-0 before:h-[2px] before:w-full before:scale-x-0 before:bg-ledger before:transition-transform before:duration-300 before:ease-out data-[state=active]:before:scale-x-100 cursor-pointer"
              >
                {tab}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-12 px-6 font-display text-sm tracking-widest uppercase text-ink/60 hover:text-ink border border-line/50 hover:bg-ink/[0.02] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_15px_rgba(0,0,0,0.04)] rounded-full"
            >
              <Calendar className="mr-3 h-4 w-4 opacity-50" />
              Date Range
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-6 border-line bg-paper rounded-xl shadow-xl" align="end">
            <p className="font-display font-medium text-ink mb-4">Select Period</p>
            {/* Mocked calendar component */}
            <div className="bg-field/50 h-56 w-72 rounded-lg border border-line/50 flex flex-col items-center justify-center text-ink/40 text-sm gap-2">
              <Calendar className="h-8 w-8 opacity-20" />
              <span>Calendar Module</span>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
