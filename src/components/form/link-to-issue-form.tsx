"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLinkServiceRequestToIssue, useNearbyCivicIssues } from "@/hooks";
import { cn } from "@/lib/utils";

interface LinkToIssueFormProps {
  requestId: string;
  categoryId: string;
  ward: string;
  onSuccess?: () => void;
}

export function LinkToIssueForm({ requestId, categoryId, ward, onSuccess }: LinkToIssueFormProps) {
  const [open, setOpen] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState("");

  const { data: nearbyIssuesData, isLoading } = useNearbyCivicIssues(categoryId, ward);
  const nearbyIssues = nearbyIssuesData || [];

  const { mutate, isPending } = useLinkServiceRequestToIssue();

  const handleLink = () => {
    if (!selectedIssueId) return;

    mutate(
      { id: requestId, civicIssueId: selectedIssueId },
      {
        onSuccess: () => {
          toast.success("Successfully linked to issue.");
          onSuccess?.();
        },
        onError: () => {
          toast.error("Failed to link request.");
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-3 p-4 border border-line rounded-md bg-paper">
      <h4 className="font-display font-medium text-ink">Link to Existing Issue</h4>
      <p className="text-sm text-ink/70">
        Merge this request into an already active operational issue.
      </p>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="secondary"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-body h-11 border border-line cursor-pointer"
          >
            {isLoading
              ? "Loading nearby issues..."
              : selectedIssueId
                ? nearbyIssues.find((i) => i.id === selectedIssueId)?.issueNumber ||
                  "Selected issue"
                : "Select candidate issue..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0 border-line">
          <Command>
            <CommandInput placeholder="Search issue number or title..." />
            <CommandList>
              <CommandEmpty>No candidate issues found.</CommandEmpty>
              <CommandGroup>
                {nearbyIssues.map((issue) => (
                  <CommandItem
                    key={issue.id}
                    value={`${issue.issueNumber} ${issue.title}`}
                    onSelect={() => {
                      setSelectedIssueId(issue.id);
                      setOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedIssueId === issue.id ? "opacity-100 text-ledger" : "opacity-0",
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-mono text-xs">{issue.issueNumber}</span>
                      <span className="truncate max-w-[200px]">{issue.title}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="flex justify-end mt-2">
        <Button
          variant="secondary"
          onClick={handleLink}
          disabled={isPending || !selectedIssueId}
          className="cursor-pointer"
        >
          {isPending ? "Linking..." : "Link to Issue"}
        </Button>
      </div>
    </div>
  );
}
