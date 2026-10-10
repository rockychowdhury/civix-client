import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAssignTechnician } from "@/hooks/work-order.hook";
import { useGetAllTechnicians } from "@/hooks/staff.hook";
import { useGetTeams } from "@/hooks/team.hook";
import { useGetMe } from "@/hooks/auth.hook";
import { toast } from "sonner";
import type { WorkOrder } from "@/types";
import { Loader2, UserPlus, Users, User, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export function AssignTechnicianSelect({
  workOrder,
  onCancel,
}: {
  workOrder: WorkOrder;
  onCancel: () => void;
}) {
  const { data: userData } = useGetMe();
  const departmentId = userData?.data?.staffProfile?.departmentMembers?.[0]?.departmentId;
  const municipalityId = userData?.data?.staffProfile?.municipalityId;

  const { data: techniciansData, isLoading: isTechsLoading } = useGetAllTechnicians({
    departmentId,
    municipalityId,
    limit: 100,
  } as any);

  const { data: teamsData, isLoading: isTeamsLoading } = useGetTeams({
    departmentId,
    limit: 50,
  } as any);

  const technicians = techniciansData?.data || [];
  const teams = teamsData?.data || [];
  const isLoading = isTechsLoading || isTeamsLoading;

  const assignTechnician = useAssignTechnician();
  const [selectedType, setSelectedType] = useState<"technician" | "team" | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [open, setOpen] = useState(false);

  const selectedTech =
    selectedType === "technician" ? technicians.find((t) => t.userId === selectedId) : null;
  const selectedTeam =
    selectedType === "team" ? teams.find((t: any) => t.id === selectedId) : null;

  const handleAssign = () => {
    if (!selectedId || !selectedType) return;

    assignTechnician.mutate(
      {
        id: workOrder.id,
        payload: {
          assignedToId: selectedType === "technician" ? selectedId : undefined,
          teamId: selectedType === "team" ? selectedId : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success(
            selectedType === "team"
              ? "Team assigned successfully"
              : "Technician assigned successfully",
          );
          onCancel();
        },
      },
    );
  };

  const selectedLabel = selectedTech
    ? `${selectedTech.firstName} ${selectedTech.lastName} (Technician)`
    : selectedTeam
      ? `${selectedTeam.name} (Team)`
      : "Select crew or technician...";

  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            className="h-7 text-xs justify-start min-w-[200px] bg-paper border border-line/40 cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            ) : selectedType === "team" ? (
              <Users className="mr-1.5 h-3.5 w-3.5 text-ledger shrink-0" />
            ) : selectedType === "technician" ? (
              <User className="mr-1.5 h-3.5 w-3.5 text-ledger shrink-0" />
            ) : null}
            <span className="truncate">{selectedLabel}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search crew or technician..." className="h-8 text-xs" />
            <CommandList>
              <CommandEmpty className="text-xs py-2 text-center text-ink/50">
                No technician or team found.
              </CommandEmpty>
              {teams.length > 0 && (
                <CommandGroup heading="Teams">
                  {teams.map((team: any) => (
                    <CommandItem
                      key={team.id}
                      value={`team ${team.name}`}
                      onSelect={() => {
                        setSelectedType("team");
                        setSelectedId(team.id);
                        setOpen(false);
                      }}
                      className="cursor-pointer text-xs py-1.5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 text-ink/50" />
                        <span>{team.name}</span>
                      </div>
                      {team._count?.members !== undefined && (
                        <span className="text-[10px] text-ink/40 font-mono">
                          {team._count.members} members
                        </span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {technicians.length > 0 && (
                <CommandGroup heading="Technicians">
                  {technicians.map((tech) => (
                    <CommandItem
                      key={tech.userId}
                      value={`tech ${tech.firstName} ${tech.lastName}`}
                      onSelect={() => {
                        setSelectedType("technician");
                        setSelectedId(tech.userId);
                        setOpen(false);
                      }}
                      className="cursor-pointer text-xs py-1.5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-ink/50" />
                        <span>
                          {tech.firstName} {tech.lastName}
                        </span>
                      </div>
                      {tech.currentWorkload !== undefined && (
                        <span className="text-[10px] text-ink/40 font-mono">
                          {tech.currentWorkload}/{tech.maxWorkload || 5}
                        </span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Button
        variant="primary"
        size="sm"
        className="h-7 px-3 text-xs bg-ledger hover:bg-ledger/90 text-paper cursor-pointer"
        disabled={!selectedId || assignTechnician.isPending}
        onClick={handleAssign}
      >
        {assignTechnician.isPending ? (
          <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
        ) : (
          <UserPlus className="h-3.5 w-3.5 mr-1.5" />
        )}
        Assign
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-ink/50 hover:text-ink cursor-pointer"
        onClick={onCancel}
        disabled={assignTechnician.isPending}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
