"use client";

import type { Row } from "@tanstack/react-table";
import { MoreHorizontal, PenSquare, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteTeam } from "@/hooks/team.hook";
import type { ITeam } from "@/types";

interface TeamRowActionsProps {
  row: Row<ITeam>;
}

export function TeamRowActions({ row }: TeamRowActionsProps) {
  const team = row.original;
  const { mutate: deleteTeam, isPending } = useDeleteTeam();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this team?")) {
      deleteTeam(team.id);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-field">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <Link href={`/department/teams/${team.id}/edit`}>
          <DropdownMenuItem className="cursor-pointer">
            <PenSquare className="mr-2 h-4 w-4" />
            Edit Team
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem
          className="cursor-pointer text-signal-open focus:text-signal-open"
          onClick={handleDelete}
          disabled={isPending}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
