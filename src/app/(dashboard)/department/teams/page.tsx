"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import { TeamTable } from "@/components/tables/TeamTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetTeams } from "@/hooks/team.hook";

export const dynamic = "force-static";

export default function TeamsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 500);

  const { data: teamsData, isLoading } = useGetTeams({
    searchTerm: debouncedSearch || undefined,
  });

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl font-semibold text-ink tracking-tight">Teams</h1>
          <p className="font-body text-ink/60">Manage operational teams for field deployments.</p>
        </div>
        <Link href="/department/teams/add">
          <Button className="cursor-pointer shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Create Team
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 bg-paper border border-line/10 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between">
          <Input
            placeholder="Search by team name or code..."
            className="max-w-xs bg-field/50 border-line/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <TeamTable data={teamsData?.data || []} isLoading={isLoading} />
      </div>
    </div>
  );
}
