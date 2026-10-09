"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getCategories } from "@/api/category.api";
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
import { useReclassifyServiceRequest } from "@/hooks";
import { cn } from "@/lib/utils";

interface ReclassifyRequestFormProps {
  requestId: string;
  currentCategoryId: string;
  onSuccess?: () => void;
}

export function ReclassifyRequestForm({
  requestId,
  currentCategoryId,
  onSuccess,
}: ReclassifyRequestFormProps) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(currentCategoryId);
  const { data: categoryData, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  const categories = categoryData?.data || [];
  // flatten children categories since citizens pick subcategories
  const subcategories = categories.filter((c) => c.parentId);

  const { mutate, isPending } = useReclassifyServiceRequest();

  const handleReclassify = () => {
    if (selectedId === currentCategoryId) {
      toast.info("Category is unchanged");
      return;
    }

    mutate(
      { id: requestId, categoryId: selectedId },
      {
        onSuccess: () => {
          toast.success("Recategorized — this may update routing and priority.");
          onSuccess?.();
        },
        onError: () => {
          toast.error("Failed to reclassify request.");
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-3 p-4 border border-line rounded-md bg-paper">
      <h4 className="font-display font-medium text-ink">Reclassify</h4>
      <p className="text-sm text-ink/70">
        Update the category if the original selection was inaccurate.
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
              ? "Loading..."
              : subcategories.find((c) => c.id === selectedId)?.name || "Select category..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0 border-line">
          <Command>
            <CommandInput placeholder="Search category..." />
            <CommandList>
              <CommandEmpty>No category found.</CommandEmpty>
              <CommandGroup>
                {subcategories.map((category) => (
                  <CommandItem
                    key={category.id}
                    value={category.name}
                    onSelect={() => {
                      setSelectedId(category.id);
                      setOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedId === category.id ? "opacity-100 text-ledger" : "opacity-0",
                      )}
                    />
                    {category.name}
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
          onClick={handleReclassify}
          disabled={isPending || selectedId === currentCategoryId}
          className="cursor-pointer"
        >
          {isPending ? "Updating..." : "Update Category"}
        </Button>
      </div>
    </div>
  );
}
