"use client";

import { useState } from "react";
import { useSubmitWorkUpdate } from "@/hooks/work-order.hook";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Paperclip } from "lucide-react";
// Assuming AttachmentsStep component is reusable
// If not, we'll just mock the file input for now

interface WorkUpdateFormProps {
  workOrderId: string;
}

export function WorkUpdateForm({ workOrderId }: WorkUpdateFormProps) {
  const [updateText, setUpdateText] = useState("");
  const { mutate, isPending } = useSubmitWorkUpdate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateText.trim()) return;

    mutate(
      { id: workOrderId, payload: { updateText } },
      {
        onSuccess: () => {
          toast.success("Update submitted");
          setUpdateText("");
        },
        onError: () => {
          toast.error("Failed to submit update");
        }
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Textarea
        placeholder="Add an informal progress note..."
        value={updateText}
        onChange={(e) => setUpdateText(e.target.value)}
        className="min-h-[100px] resize-none border-line focus-visible:ring-ledger bg-paper"
      />
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" size="sm" className="text-ink/60 hover:text-ink">
          <Paperclip className="h-4 w-4 mr-2" />
          Add Photo
        </Button>
        <Button 
          type="submit" 
          variant="secondary" 
          disabled={!updateText.trim() || isPending}
          className="cursor-pointer"
        >
          {isPending ? "Submitting..." : "Submit Update"}
        </Button>
      </div>
    </form>
  );
}
