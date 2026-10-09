import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAssignTechnician } from "@/hooks/work-order.hook";
import { useGetAllTechnicians } from "@/hooks/staff.hook";
import { useGetMe } from "@/hooks/auth.hook";
import { toast } from "sonner";
import type { WorkOrder } from "@/types";
import { Loader2, UserPlus, X } from "lucide-react";
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

  const technicians = techniciansData?.data || [];

  const assignTechnician = useAssignTechnician();
  const [selectedTechId, setSelectedTechId] = useState<string>("");
  const [open, setOpen] = useState(false);

  const selectedTech = technicians.find((t) => t.userId === selectedTechId);

  const handleAssign = () => {
    if (!selectedTechId) return;

    assignTechnician.mutate(
      {
        id: workOrder.id,
        payload: { technicianId: selectedTechId },
      },
      {
        onSuccess: () => {
          toast.success("Technician assigned successfully");
          onCancel(); // exit edit mode
        },
      },
    );
  };

  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            className="h-7 text-xs justify-start min-w-[180px] bg-paper"
            disabled={isTechsLoading}
          >
            {isTechsLoading ? (
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            ) : selectedTech ? (
              <span className="truncate">
                {selectedTech.firstName} {selectedTech.lastName}
              </span>
            ) : (
              <span className="text-muted-foreground">Select technician...</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search technicians..." className="h-8 text-xs" />
            <CommandList>
              <CommandEmpty className="text-xs py-2 text-center text-muted-foreground">
                No technician found.
              </CommandEmpty>
              <CommandGroup>
                {technicians.map((tech) => (
                  <CommandItem
                    key={tech.userId}
                    value={`${tech.firstName} ${tech.lastName}`}
                    onSelect={() => {
                      setSelectedTechId(tech.userId);
                      setOpen(false);
                    }}
                    className="cursor-pointer text-xs py-1.5"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>
                        {tech.firstName} {tech.lastName}
                      </span>
                      {tech.currentWorkload !== undefined && (
                        <span className="text-ink/40 font-mono">
                          {tech.currentWorkload}/{tech.maxWorkload || 5}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Button
        variant="primary"
        size="sm"
        className="h-7 px-3 text-xs bg-ledger hover:bg-ledger/90 text-paper cursor-pointer"
        disabled={!selectedTechId || assignTechnician.isPending}
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
