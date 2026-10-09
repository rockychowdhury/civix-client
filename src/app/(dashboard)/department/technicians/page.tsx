"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { StaffTable } from "@/components/tables/StaffTable";
import { useGetAllStaff } from "@/hooks/staff.hook";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "use-debounce";

export default function StaffDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 500);

  const { data: staffData, isLoading } = useGetAllStaff({
    searchTerm: debouncedSearch || undefined,
  });

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl font-semibold text-ink tracking-tight">
            Staff Directory
          </h1>
          <p className="font-body text-ink/60">
            Manage dispatchers and technicians in your department.
          </p>
        </div>
        <Link href="/department/add-staff">
          <Button className="cursor-pointer shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Provision Staff
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 bg-paper border border-line/10 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between">
          <Input
            placeholder="Search by name or email..."
            className="max-w-xs bg-field/50 border-line/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <StaffTable data={staffData?.data || []} isLoading={isLoading} />
      </div>
    </div>
  );
}
